import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGuestFeedbackDto,
  FindGuestFeedbackQueryDto,
  ReviewGuestFeedbackDto,
} from './dto/guest-feedback.dto';
import {
  assertCanReview,
  assertValidScore,
  GF_INVALID_SCORE,
  GF_MISSING_PROPERTY,
  GF_NOT_OPEN_STATUS,
} from './guest-feedback-rules';

const feedbackInclude = {
  guest: { select: { id: true, firstName: true, lastName: true } },
  reservation: {
    select: { id: true, confirmNumber: true, status: true },
  },
  property: { select: { id: true, name: true } },
} satisfies Prisma.GuestFeedbackInclude;

@Injectable()
export class GuestFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindGuestFeedbackQueryDto) {
    if (!query.propertyId) {
      throw new BadRequestException(GF_MISSING_PROPERTY);
    }
    return this.prisma.guestFeedback.findMany({
      where: {
        propertyId: query.propertyId,
        ...(query.guestId ? { guestId: query.guestId } : {}),
        ...(query.status
          ? {
              status: query.status as 'OPEN' | 'REVIEWED' | 'ARCHIVED',
            }
          : {}),
      },
      include: feedbackInclude,
      orderBy: [{ submittedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.guestFeedback.findUnique({
      where: { id },
      include: feedbackInclude,
    });
    if (!row) {
      throw new NotFoundException(`Guest feedback with ID ${id} not found`);
    }
    return row;
  }

  async create(dto: CreateGuestFeedbackDto) {
    try {
      assertValidScore(dto.score);
    } catch (error) {
      const message = error instanceof Error ? error.message : GF_INVALID_SCORE;
      if (message === GF_INVALID_SCORE) {
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

    return this.prisma.guestFeedback.create({
      data: {
        propertyId: dto.propertyId,
        guestId: dto.guestId,
        reservationId: dto.reservationId || null,
        score: dto.score,
        comment: dto.comment?.trim() || null,
        status: 'OPEN',
        submittedAt: new Date(),
      },
      include: feedbackInclude,
    });
  }

  async review(id: string, dto: ReviewGuestFeedbackDto) {
    const row = await this.findOne(id);
    if (row.status === 'REVIEWED') return row;

    try {
      assertCanReview(row.status);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : GF_NOT_OPEN_STATUS;
      if (message === GF_NOT_OPEN_STATUS) {
        throw new BadRequestException(message);
      }
      throw error;
    }

    return this.prisma.guestFeedback.update({
      where: { id },
      data: {
        status: 'REVIEWED',
        reviewedAt: new Date(),
        reviewedBy: dto.reviewedBy.trim(),
      },
      include: feedbackInclude,
    });
  }
}
