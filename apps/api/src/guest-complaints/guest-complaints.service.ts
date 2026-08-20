import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  CloseGuestComplaintDto,
  CreateGuestComplaintDto,
  FindGuestComplaintsQueryDto,
  ResolveGuestComplaintDto,
  StartGuestComplaintDto,
} from './dto/guest-complaints.dto';
import {
  assertCanClose,
  assertCanResolve,
  assertCanStart,
  GC_MISSING_PROPERTY,
} from './guest-complaints-rules';

const complaintInclude = {
  guest: { select: { id: true, firstName: true, lastName: true } },
  reservation: {
    select: { id: true, confirmNumber: true, status: true },
  },
  property: { select: { id: true, name: true } },
} satisfies Prisma.GuestComplaintInclude;

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

@Injectable()
export class GuestComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindGuestComplaintsQueryDto) {
    if (!query.propertyId) {
      throw new BadRequestException(GC_MISSING_PROPERTY);
    }
    return this.prisma.guestComplaint.findMany({
      where: {
        propertyId: query.propertyId,
        ...(query.status
          ? {
              status: query.status as
                | 'OPEN'
                | 'IN_PROGRESS'
                | 'RESOLVED'
                | 'CLOSED',
            }
          : {}),
      },
      include: complaintInclude,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.guestComplaint.findUnique({
      where: { id },
      include: complaintInclude,
    });
    if (!row) {
      throw new NotFoundException(`Guest complaint with ID ${id} not found`);
    }
    return row;
  }

  private async ensureGuestExists(guestId?: string) {
    if (!guestId) return;
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
    });
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }
  }

  private async ensureReservationExists(reservationId?: string) {
    if (!reservationId) return;
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundException(
        `Reservation with ID ${reservationId} not found`,
      );
    }
  }

  private parseSeverity(severity?: string) {
    if (!severity) return 'MEDIUM' as const;
    const normalized = severity.toUpperCase();
    if (
      !VALID_SEVERITIES.includes(
        normalized as (typeof VALID_SEVERITIES)[number],
      )
    ) {
      throw new BadRequestException(
        'severity must be LOW, MEDIUM, HIGH, or CRITICAL',
      );
    }
    return normalized as (typeof VALID_SEVERITIES)[number];
  }

  async create(dto: CreateGuestComplaintDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }
    await this.ensureGuestExists(dto.guestId);
    await this.ensureReservationExists(dto.reservationId);

    return this.prisma.guestComplaint.create({
      data: {
        propertyId: dto.propertyId,
        guestId: dto.guestId || null,
        reservationId: dto.reservationId || null,
        category: dto.category.trim(),
        severity: this.parseSeverity(dto.severity),
        subject: dto.subject.trim(),
        description: dto.description.trim(),
        status: 'OPEN',
        openedBy: dto.openedBy.trim(),
      },
      include: complaintInclude,
    });
  }

  async start(id: string, dto: StartGuestComplaintDto) {
    const row = await this.findOne(id);
    if (row.status === 'IN_PROGRESS') return row;
    assertCanStart(row.status);

    return this.prisma.guestComplaint.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        assignedTo: dto.assignedTo?.trim() || row.assignedTo,
      },
      include: complaintInclude,
    });
  }

  async resolve(id: string, dto: ResolveGuestComplaintDto) {
    const row = await this.findOne(id);
    if (row.status === 'RESOLVED') return row;
    assertCanResolve(row.status);

    return this.prisma.guestComplaint.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNote: dto.resolutionNote.trim(),
        resolvedAt: new Date(),
        resolvedBy: dto.resolvedBy.trim(),
      },
      include: complaintInclude,
    });
  }

  async close(id: string, dto: CloseGuestComplaintDto) {
    const row = await this.findOne(id);
    if (row.status === 'CLOSED') return row;
    assertCanClose(row.status);

    return this.prisma.guestComplaint.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: dto.closedBy.trim(),
      },
      include: complaintInclude,
    });
  }
}
