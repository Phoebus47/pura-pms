import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { HardwareBridgeService } from '../hardware-bridge/hardware-bridge.service';
import {
  CreatePrintJobDto,
  CreateRegistrationCardDto,
  SignRegistrationCardDto,
  VoidRegistrationCardDto,
} from './dto/registration-card.dto';
import { buildSnapshots } from './reg-card-snapshots';
import {
  assertDraftStatus,
  assertSignedStatus,
  assertValidSignatureData,
  nextVersion,
} from './reg-card-rules';

const reservationInclude = {
  guest: true,
  room: {
    include: {
      roomType: true,
      property: true,
    },
  },
} satisfies Prisma.ReservationInclude;

const cardInclude = {
  reservation: {
    select: {
      id: true,
      confirmNumber: true,
      status: true,
    },
  },
  property: {
    select: { id: true, name: true },
  },
} satisfies Prisma.RegistrationCardInclude;

@Injectable()
export class RegistrationCardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hardwareBridge: HardwareBridgeService,
  ) {}

  findByReservation(reservationId: string) {
    return this.prisma.registrationCard.findMany({
      where: { reservationId },
      include: cardInclude,
      orderBy: { version: 'desc' },
    });
  }

  async findOne(id: string) {
    const card = await this.prisma.registrationCard.findUnique({
      where: { id },
      include: cardInclude,
    });
    if (!card) {
      throw new NotFoundException(`Registration card with ID ${id} not found`);
    }
    return card;
  }

  async createDraft(dto: CreateRegistrationCardDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      include: reservationInclude,
    });
    if (!reservation) {
      throw new NotFoundException(
        `Reservation with ID ${dto.reservationId} not found`,
      );
    }
    if (!reservation.room.property) {
      throw new BadRequestException('Reservation room has no property');
    }

    const existingDraft = await this.prisma.registrationCard.findFirst({
      where: { reservationId: dto.reservationId, status: 'DRAFT' },
    });
    if (existingDraft) {
      return existingDraft;
    }

    const latest = await this.prisma.registrationCard.findFirst({
      where: { reservationId: dto.reservationId },
      orderBy: { version: 'desc' },
    });
    if (latest?.status === 'SIGNED') {
      const snapshots = buildSnapshots(reservation);
      return this.prisma.registrationCard.create({
        data: {
          propertyId: reservation.room.property.id,
          reservationId: dto.reservationId,
          version: nextVersion(latest.version),
          status: 'DRAFT',
          guestSnapshot:
            snapshots.guestSnapshot as unknown as Prisma.InputJsonValue,
          staySnapshot:
            snapshots.staySnapshot as unknown as Prisma.InputJsonValue,
          propertySnapshot:
            snapshots.propertySnapshot as unknown as Prisma.InputJsonValue,
          createdBy: dto.createdBy,
        },
        include: cardInclude,
      });
    }

    const snapshots = buildSnapshots(reservation);
    return this.prisma.registrationCard.create({
      data: {
        propertyId: reservation.room.property.id,
        reservationId: dto.reservationId,
        version: nextVersion(latest?.version ?? null),
        status: 'DRAFT',
        guestSnapshot:
          snapshots.guestSnapshot as unknown as Prisma.InputJsonValue,
        staySnapshot:
          snapshots.staySnapshot as unknown as Prisma.InputJsonValue,
        propertySnapshot:
          snapshots.propertySnapshot as unknown as Prisma.InputJsonValue,
        createdBy: dto.createdBy,
      },
      include: cardInclude,
    });
  }

  async sign(id: string, dto: SignRegistrationCardDto) {
    const card = await this.findOne(id);
    assertDraftStatus(card.status);
    assertValidSignatureData(dto.signatureData);

    return this.prisma.registrationCard.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signatureData: dto.signatureData,
        signedAt: new Date(),
        signedByGuestName: dto.signedByGuestName.trim(),
      },
      include: cardInclude,
    });
  }

  async void(id: string, dto: VoidRegistrationCardDto) {
    const card = await this.findOne(id);
    assertSignedStatus(card.status);

    return this.prisma.registrationCard.update({
      where: { id },
      data: {
        status: 'VOID',
        voidReason: dto.reason.trim(),
        voidedAt: new Date(),
        voidedBy: dto.voidedBy,
      },
      include: cardInclude,
    });
  }

  async createPrintJob(id: string, dto: CreatePrintJobDto) {
    const card = await this.findOne(id);
    if (card.status !== 'SIGNED') {
      throw new ConflictException(
        'Only signed registration cards can be printed',
      );
    }

    return this.hardwareBridge.createJob({
      propertyId: card.propertyId,
      type: 'PRINT',
      requestedBy: dto.requestedBy,
      reservationId: card.reservationId,
      idempotencyKey: dto.idempotencyKey,
      payload: {
        jobType: 'REG_CARD',
        registrationCardId: card.id,
        confirmNumber: card.reservation.confirmNumber,
        version: card.version,
      },
    });
  }
}
