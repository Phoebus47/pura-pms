import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConfirmTm30ReportDto,
  FailTm30ReportDto,
  FindTm30ReportsQueryDto,
  GenerateTm30ReportsDto,
  SubmitTm30ReportDto,
} from './dto/tm30-report.dto';
import {
  classifyGuestForTm30,
  dueAtFromArrival,
  formatTm30Tsv,
  TM30_MISSING_PROPERTY,
  TM30_NOT_PENDING,
  TM30_NOT_SUBMITTED,
  toUtcDate,
} from './tm30-rules';

const reportInclude = {
  reservation: {
    select: { id: true, confirmNumber: true, status: true },
  },
  guest: {
    select: { id: true, firstName: true, lastName: true },
  },
  property: { select: { id: true, name: true } },
} satisfies Prisma.Tm30ReportInclude;

@Injectable()
export class Tm30ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: FindTm30ReportsQueryDto) {
    if (!query.propertyId) {
      throw new BadRequestException(TM30_MISSING_PROPERTY);
    }
    return this.prisma.tm30Report.findMany({
      where: {
        propertyId: query.propertyId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.arrivalDate
          ? { arrivalDate: new Date(query.arrivalDate) }
          : {}),
        ...(query.overdue === 'true'
          ? { status: 'PENDING', dueAt: { lt: new Date() } }
          : {}),
      },
      include: reportInclude,
      orderBy: [{ dueAt: 'asc' }, { fullName: 'asc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.tm30Report.findUnique({
      where: { id },
      include: reportInclude,
    });
    if (!row) {
      throw new NotFoundException(`TM.30 report with ID ${id} not found`);
    }
    return row;
  }

  async generate(dto: GenerateTm30ReportsDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }

    const stays = await this.prisma.reservation.findMany({
      where: {
        status: 'CHECKED_IN',
        room: { propertyId: dto.propertyId },
      },
      include: { guest: true, room: true },
    });

    const created: unknown[] = [];
    const skipped: Array<{ reservationId: string; reason: string }> = [];
    const arrivalFilter = dto.arrivalDate
      ? toUtcDate(new Date(dto.arrivalDate)).toISOString().slice(0, 10)
      : null;

    for (const stay of stays) {
      if (
        arrivalFilter &&
        toUtcDate(stay.checkIn).toISOString().slice(0, 10) !== arrivalFilter
      ) {
        continue;
      }
      const skip = classifyGuestForTm30(stay.guest);
      if (skip) {
        skipped.push({ reservationId: stay.id, reason: skip });
        continue;
      }
      const existing = await this.prisma.tm30Report.findUnique({
        where: {
          reservationId_guestId: {
            reservationId: stay.id,
            guestId: stay.guestId,
          },
        },
      });
      if (existing) {
        skipped.push({ reservationId: stay.id, reason: 'ALREADY_EXISTS' });
        continue;
      }
      const arrivalDate = toUtcDate(stay.checkIn);
      const row = await this.prisma.tm30Report.create({
        data: {
          propertyId: dto.propertyId,
          reservationId: stay.id,
          guestId: stay.guestId,
          passportNumber: stay.guest.idNumber?.trim() ?? '',
          fullName: `${stay.guest.firstName} ${stay.guest.lastName}`.trim(),
          nationality: stay.guest.nationality?.trim() ?? '',
          dateOfBirth: stay.guest.dateOfBirth
            ? toUtcDate(stay.guest.dateOfBirth)
            : null,
          roomNumber: stay.room.number,
          arrivalDate,
          departureDate: toUtcDate(stay.checkOut),
          addressInThailand: property.address,
          dueAt: dueAtFromArrival(stay.checkedInAt ?? stay.checkIn),
          generatedBy: dto.generatedBy,
        },
        include: reportInclude,
      });
      created.push(row);
    }

    return { created, skipped };
  }

  async exportTsv(query: FindTm30ReportsQueryDto) {
    const rows = await this.findAll(query);
    return {
      filename: `tm30-${query.propertyId}.tsv`,
      text: formatTm30Tsv(rows),
    };
  }

  async submit(id: string, dto: SubmitTm30ReportDto) {
    const row = await this.findOne(id);
    if (row.status !== 'PENDING') {
      throw new BadRequestException(TM30_NOT_PENDING);
    }
    return this.prisma.tm30Report.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submittedBy: dto.submittedBy,
        referenceNo: dto.referenceNo?.trim() || row.referenceNo,
      },
      include: reportInclude,
    });
  }

  async confirm(id: string, dto: ConfirmTm30ReportDto) {
    const row = await this.findOne(id);
    if (row.status !== 'SUBMITTED') {
      throw new BadRequestException(TM30_NOT_SUBMITTED);
    }
    return this.prisma.tm30Report.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        referenceNo: dto.referenceNo?.trim() || row.referenceNo,
      },
      include: reportInclude,
    });
  }

  async fail(id: string, dto: FailTm30ReportDto) {
    const row = await this.findOne(id);
    if (row.status !== 'SUBMITTED') {
      throw new BadRequestException(TM30_NOT_SUBMITTED);
    }
    return this.prisma.tm30Report.update({
      where: { id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        failureReason: dto.failureReason.trim(),
      },
      include: reportInclude,
    });
  }
}
