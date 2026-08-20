import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGuestMessageDto,
  FindGuestMessagesQueryDto,
} from './dto/guest-message.dto';
import {
  assertInAppChannel,
  assertOutboundHasSender,
  GM_CHANNEL_NOT_SUPPORTED,
  GM_MISSING_PROPERTY,
  GM_OUTBOUND_NEEDS_SENDER,
} from './guest-message-rules';

const messageInclude = {
  guest: { select: { id: true, firstName: true, lastName: true } },
  reservation: {
    select: { id: true, confirmNumber: true, status: true },
  },
  property: { select: { id: true, name: true } },
} satisfies Prisma.GuestMessageInclude;

@Injectable()
export class GuestMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindGuestMessagesQueryDto) {
    if (!query.propertyId) {
      throw new BadRequestException(GM_MISSING_PROPERTY);
    }
    return this.prisma.guestMessage.findMany({
      where: {
        propertyId: query.propertyId,
        ...(query.guestId ? { guestId: query.guestId } : {}),
        ...(query.reservationId ? { reservationId: query.reservationId } : {}),
        ...(query.unread === 'true' ? { readAt: null } : {}),
      },
      include: messageInclude,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.guestMessage.findUnique({
      where: { id },
      include: messageInclude,
    });
    if (!row) {
      throw new NotFoundException(`Guest message with ID ${id} not found`);
    }
    return row;
  }

  async create(dto: CreateGuestMessageDto) {
    try {
      assertInAppChannel(dto.channel);
      assertOutboundHasSender(dto.direction, dto.sentBy);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : GM_CHANNEL_NOT_SUPPORTED;
      if (
        message === GM_CHANNEL_NOT_SUPPORTED ||
        message === GM_OUTBOUND_NEEDS_SENDER
      ) {
        throw new BadRequestException(message);
      }
      throw error;
    }

    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }

    const guest = await this.prisma.guest.findUnique({
      where: { id: dto.guestId },
    });
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${dto.guestId} not found`);
    }

    if (dto.reservationId) {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
      });
      if (!reservation) {
        throw new NotFoundException(
          `Reservation with ID ${dto.reservationId} not found`,
        );
      }
    }

    return this.prisma.guestMessage.create({
      data: {
        propertyId: dto.propertyId,
        guestId: dto.guestId,
        reservationId: dto.reservationId || null,
        direction: dto.direction,
        channel: 'IN_APP',
        content: dto.content.trim(),
        sentBy: dto.sentBy?.trim() || null,
      },
      include: messageInclude,
    });
  }

  async markRead(id: string) {
    const row = await this.findOne(id);
    if (row.readAt) return row;
    return this.prisma.guestMessage.update({
      where: { id },
      data: { readAt: new Date() },
      include: messageInclude,
    });
  }
}
