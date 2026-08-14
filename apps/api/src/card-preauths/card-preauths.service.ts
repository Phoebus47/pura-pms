import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardPreauthStatus, Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { computePostingAmounts } from '../folios/folio-posting';
import { persistPostingLines } from '../folios/package-split';
import { resolveCashierShiftId } from '../folios/folio-shift';
import { CreateCardPreauthDto } from './dto/create-card-preauth.dto';
import { IncrementCardPreauthDto } from './dto/increment-card-preauth.dto';
import { CaptureCardPreauthDto } from './dto/capture-card-preauth.dto';
import {
  CAPTURE_EXCEEDS_HOLD,
  CARD_CODE_MISSING,
  CARD_PAYMENT_TRX_CODE,
  INCREMENT_TOO_SMALL,
  isOpenHold,
  PREAUTH_NOT_CAPTURABLE,
  PREAUTH_NOT_HOLDABLE,
  PREAUTH_NOT_RELEASABLE,
} from './preauth-rules';

const preauthInclude = {
  reservation: {
    select: {
      id: true,
      confirmNumber: true,
      guest: { select: { firstName: true, lastName: true } },
    },
  },
} satisfies Prisma.CardPreauthInclude;

@Injectable()
export class CardPreauthsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(reservationId?: string) {
    return this.prisma.cardPreauth.findMany({
      where: reservationId ? { reservationId } : {},
      include: preauthInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.cardPreauth.findUnique({
      where: { id },
      include: preauthInclude,
    });
    if (!row) {
      throw new NotFoundException(`Card pre-auth with ID ${id} not found`);
    }
    return row;
  }

  async create(dto: CreateCardPreauthDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
    });
    if (!reservation) {
      throw new NotFoundException(
        `Reservation with ID ${dto.reservationId} not found`,
      );
    }
    return this.prisma.cardPreauth.create({
      data: {
        reservationId: dto.reservationId,
        amount: dto.amount,
        last4: dto.last4,
        expiryMonth: dto.expiryMonth,
        expiryYear: dto.expiryYear,
        manualRef: dto.manualRef,
        createdBy: dto.createdBy,
        status: CardPreauthStatus.HELD,
      },
      include: preauthInclude,
    });
  }

  async increment(id: string, dto: IncrementCardPreauthDto) {
    const row = await this.findOne(id);
    if (!isOpenHold(row.status)) {
      throw new ConflictException(PREAUTH_NOT_HOLDABLE);
    }
    if (dto.amount <= Number(row.amount)) {
      throw new BadRequestException(INCREMENT_TOO_SMALL);
    }
    return this.prisma.cardPreauth.update({
      where: { id },
      data: { amount: dto.amount, status: CardPreauthStatus.INCREMENTAL },
      include: preauthInclude,
    });
  }

  async release(id: string) {
    const row = await this.findOne(id);
    if (!isOpenHold(row.status)) {
      throw new ConflictException(PREAUTH_NOT_RELEASABLE);
    }
    return this.prisma.cardPreauth.update({
      where: { id },
      data: { status: CardPreauthStatus.RELEASED },
      include: preauthInclude,
    });
  }

  async capture(id: string, dto: CaptureCardPreauthDto) {
    const row = await this.findOne(id);
    if (!isOpenHold(row.status)) {
      throw new ConflictException(PREAUTH_NOT_CAPTURABLE);
    }
    const captureAmount = dto.amount ?? Number(row.amount);
    if (captureAmount - Number(row.amount) > 0.001) {
      throw new BadRequestException(CAPTURE_EXCEEDS_HOLD);
    }
    const folio = await this.prisma.folio.findUnique({
      where: { id: dto.folioId },
      include: {
        reservation: { include: { room: true } },
        windows: { orderBy: { windowNumber: 'asc' } },
      },
    });
    if (!folio) {
      throw new NotFoundException(`Folio with ID ${dto.folioId} not found`);
    }
    if (folio.reservationId !== row.reservationId) {
      throw new BadRequestException(
        'Folio does not belong to this reservation',
      );
    }
    const trxCode = await this.prisma.transactionCode.findUnique({
      where: { code: CARD_PAYMENT_TRX_CODE },
    });
    if (!trxCode) {
      throw new BadRequestException(CARD_CODE_MISSING);
    }
    const window =
      folio.windows.find((item) => item.windowNumber === 1) ?? folio.windows[0];
    if (!window) {
      throw new BadRequestException('Folio has no windows');
    }
    const shiftId = await resolveCashierShiftId(
      this.prisma,
      dto.userId,
      folio.reservation.room.propertyId,
    );
    const amounts = computePostingAmounts(captureAmount, trxCode);
    const businessDate = folio.businessDate ?? new Date();

    return this.prisma.$transaction(async (tx) => {
      const posted = await persistPostingLines(tx, {
        folioId: folio.id,
        windowId: window.id,
        businessDate,
        reference: `CC ****${row.last4} ${row.manualRef}`,
        userId: dto.userId,
        shiftId,
        lines: [{ trxCodeId: trxCode.id, code: trxCode.code, ...amounts }],
      });
      return tx.cardPreauth.update({
        where: { id },
        data: {
          status: CardPreauthStatus.CAPTURED,
          capturedAmount: captureAmount,
          folioId: folio.id,
          folioTransactionId: posted.id,
        },
        include: preauthInclude,
      });
    });
  }
}
