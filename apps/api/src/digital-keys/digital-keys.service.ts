import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  IssueDigitalKeyByConfirmNumberDto,
  IssueDigitalKeyDto,
  RevokeDigitalKeyDto,
} from './dto/digital-key.dto';
import {
  defaultExpiresAt,
  DK_NOT_ACTIVE_MESSAGE,
  DK_RESERVATION_NOT_ISSUABLE_MESSAGE,
  DK_ROOM_REQUIRED_MESSAGE,
  generateMockToken,
  isIssuableReservationStatus,
  type DigitalKeyTransport,
} from './dk-rules';

const digitalKeyInclude = {
  reservation: {
    select: { id: true, confirmNumber: true, status: true },
  },
} satisfies Prisma.DigitalKeyInclude;

@Injectable()
export class DigitalKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async issue(dto: IssueDigitalKeyDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      include: { room: true },
    });
    if (!reservation) {
      throw new NotFoundException(
        `Reservation with ID ${dto.reservationId} not found`,
      );
    }
    return this.createKeyForReservation(reservation, dto);
  }

  async issueByConfirmNumber(dto: IssueDigitalKeyByConfirmNumberDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { confirmNumber: dto.confirmNumber.trim() },
      include: { room: true },
    });
    if (!reservation) {
      throw new NotFoundException(
        `Reservation with confirmation number ${dto.confirmNumber} not found`,
      );
    }
    return this.createKeyForReservation(reservation, dto);
  }

  async findOne(id: string) {
    const row = await this.prisma.digitalKey.findUnique({
      where: { id },
      include: digitalKeyInclude,
    });
    if (!row) {
      throw new NotFoundException(`Digital key with ID ${id} not found`);
    }
    return row;
  }

  async findAll(query: { propertyId?: string; reservationId?: string }) {
    return this.prisma.digitalKey.findMany({
      where: {
        ...(query.propertyId ? { propertyId: query.propertyId } : {}),
        ...(query.reservationId ? { reservationId: query.reservationId } : {}),
      },
      include: digitalKeyInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(id: string, dto: RevokeDigitalKeyDto) {
    const row = await this.findOne(id);
    if (row.status !== 'ACTIVE') {
      throw new BadRequestException(DK_NOT_ACTIVE_MESSAGE);
    }
    return this.prisma.digitalKey.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedBy: dto.revokedBy,
        revokedReason: dto.revokedReason?.trim() || null,
      },
      include: digitalKeyInclude,
    });
  }

  private async createKeyForReservation(
    reservation: {
      id: string;
      status: string;
      checkOut: Date;
      room: { propertyId: string; number: string } | null;
    },
    dto: { issuedBy: string; transport?: DigitalKeyTransport },
  ) {
    if (!isIssuableReservationStatus(reservation.status)) {
      throw new BadRequestException(DK_RESERVATION_NOT_ISSUABLE_MESSAGE);
    }
    if (!reservation.room) {
      throw new BadRequestException(DK_ROOM_REQUIRED_MESSAGE);
    }

    return this.prisma.digitalKey.create({
      data: {
        propertyId: reservation.room.propertyId,
        reservationId: reservation.id,
        roomNumber: reservation.room.number,
        token: generateMockToken(),
        transport: dto.transport ?? 'BLE',
        status: 'ACTIVE',
        issuedBy: dto.issuedBy,
        expiresAt: defaultExpiresAt(reservation.checkOut),
      },
      include: digitalKeyInclude,
    });
  }
}
