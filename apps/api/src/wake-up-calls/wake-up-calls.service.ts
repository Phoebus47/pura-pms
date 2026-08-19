import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  CancelWakeUpCallDto,
  CompleteWakeUpCallDto,
  CreateWakeUpCallDto,
  MissWakeUpCallDto,
} from './dto/wake-up-call.dto';
import {
  assertSchedulableReservation,
  assertScheduledStatus,
  toScheduledDate,
} from './wake-up-rules';

const callInclude = {
  reservation: {
    select: {
      id: true,
      confirmNumber: true,
      status: true,
      guest: { select: { firstName: true, lastName: true } },
    },
  },
  room: { select: { id: true, number: true } },
  property: { select: { id: true, name: true } },
} satisfies Prisma.WakeUpCallInclude;

@Injectable()
export class WakeUpCallsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: {
    propertyId?: string;
    scheduledDate?: string;
    reservationId?: string;
  }) {
    if (!query.reservationId && !query.propertyId) {
      throw new BadRequestException('propertyId or reservationId is required');
    }
    return this.prisma.wakeUpCall.findMany({
      where: {
        ...(query.reservationId
          ? { reservationId: query.reservationId }
          : {
              propertyId: query.propertyId,
              ...(query.scheduledDate
                ? { scheduledDate: new Date(query.scheduledDate) }
                : {}),
            }),
      },
      include: callInclude,
      orderBy: [{ scheduledAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.wakeUpCall.findUnique({
      where: { id },
      include: callInclude,
    });
    if (!row) {
      throw new NotFoundException(`Wake-up call with ID ${id} not found`);
    }
    return row;
  }

  async create(dto: CreateWakeUpCallDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      include: { room: { include: { property: true } } },
    });
    if (!reservation) {
      throw new NotFoundException(
        `Reservation with ID ${dto.reservationId} not found`,
      );
    }
    assertSchedulableReservation(reservation.status);
    if (!reservation.roomId || !reservation.room?.property) {
      throw new BadRequestException(
        'Reservation must have a room assigned to schedule a wake-up call',
      );
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('scheduledAt must be a valid date');
    }

    return this.prisma.wakeUpCall.create({
      data: {
        propertyId: reservation.room.property.id,
        reservationId: reservation.id,
        roomId: reservation.roomId,
        scheduledAt,
        scheduledDate: toScheduledDate(scheduledAt),
        status: 'SCHEDULED',
        notes: dto.notes?.trim() || null,
        scheduledBy: dto.scheduledBy,
      },
      include: callInclude,
    });
  }

  async complete(id: string, dto: CompleteWakeUpCallDto) {
    const row = await this.findOne(id);
    assertScheduledStatus(row.status);
    return this.prisma.wakeUpCall.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: dto.completedBy,
      },
      include: callInclude,
    });
  }

  async miss(id: string, dto: MissWakeUpCallDto) {
    const row = await this.findOne(id);
    assertScheduledStatus(row.status);
    return this.prisma.wakeUpCall.update({
      where: { id },
      data: {
        status: 'MISSED',
        missedAt: new Date(),
        missedBy: dto.missedBy,
      },
      include: callInclude,
    });
  }

  async cancel(id: string, dto: CancelWakeUpCallDto) {
    const row = await this.findOne(id);
    assertScheduledStatus(row.status);
    return this.prisma.wakeUpCall.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: dto.cancelledBy,
        cancelReason: dto.cancelReason?.trim() || null,
      },
      include: callInclude,
    });
  }
}
