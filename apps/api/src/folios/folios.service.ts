import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolioDto } from './dto/create-folio.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { FolioStatus, Prisma } from '@pura/database';
import { VoidTransactionDto } from './dto/void-transaction.dto';
import { resolveCashierShiftId, resolvePostShiftId } from './folio-shift';
import { computePostingAmounts, standardWindowCreates } from './folio-posting';
import {
  persistPostingLines,
  resolvePostingLines,
  sumBalanceImpact,
} from './package-split';
import {
  AR_ACCOUNT_INACTIVE_MESSAGE,
  AR_CREDIT_EXCEEDED_MESSAGE,
  isOverCreditLimit,
  remainingArCredit,
  resolveCreditLimit,
  wouldExceedArCredit,
} from './credit-limit';
import {
  convertForeignToBase,
  formatFxReference,
  MISSING_FX_RATE_MESSAGE,
  needsCashFxConversion,
  requireForeignAmount,
} from '../exchange-rates/cash-fx';
import { postingRateQuery } from '../exchange-rates/exchange-rate-query';

@Injectable()
export class FoliosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFolioDto: CreateFolioDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: createFolioDto.reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(
        `Reservation with ID ${createFolioDto.reservationId} not found`,
      );
    }

    // Generate folio number (simple implementation)
    const folioCount = await this.prisma.folio.count();
    const folioNumber = `F${(folioCount + 1).toString().padStart(6, '0')}`;

    return this.prisma.folio.create({
      data: {
        folioNumber,
        reservationId: createFolioDto.reservationId,
        type: createFolioDto.type || 'GUEST',
        status: FolioStatus.OPEN,
        businessDate: new Date(), // Should ideally come from property/system settings
        windows: {
          create: standardWindowCreates(),
        },
      },
      include: {
        windows: { orderBy: { windowNumber: 'asc' } },
      },
    });
  }

  /** Ensures folios created before 4-window rollout still have windows 1–4. */
  private async ensureStandardWindows(folioId: string): Promise<void> {
    await this.prisma.folioWindow.createMany({
      data: standardWindowCreates().map((window) => ({
        folioId,
        ...window,
      })),
      skipDuplicates: true,
    });
  }

  async findOne(id: string) {
    const folio = await this.prisma.folio.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            guest: true,
            room: true,
          },
        },
        windows: {
          include: {
            transactions: {
              include: {
                trxCode: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            windowNumber: 'asc',
          },
        },
      },
    });

    if (!folio) {
      throw new NotFoundException(`Folio with ID ${id} not found`);
    }

    return folio;
  }

  async findByReservationId(reservationId: string) {
    const folioIds = await this.prisma.folio.findMany({
      where: { reservationId },
      select: { id: true },
    });
    if (folioIds.length === 0) {
      return [];
    }
    await Promise.all(folioIds.map(({ id }) => this.ensureStandardWindows(id)));
    return this.prisma.folio.findMany({
      where: { reservationId },
      include: {
        windows: {
          include: {
            transactions: {
              include: {
                trxCode: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { windowNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async postTransaction(
    folioId: string,
    postTransactionDto: PostTransactionDto,
  ) {
    const window = await this.prisma.folioWindow.findUnique({
      where: {
        folioId_windowNumber: {
          folioId,
          windowNumber: postTransactionDto.windowNumber,
        },
      },
    });

    if (!window) {
      throw new NotFoundException(
        `Window ${postTransactionDto.windowNumber} not found for folio ${folioId}`,
      );
    }

    const trxCode = await this.prisma.transactionCode.findUnique({
      where: { id: postTransactionDto.trxCodeId },
    });

    if (!trxCode) {
      throw new NotFoundException(
        `Transaction Code with ID ${postTransactionDto.trxCodeId} not found`,
      );
    }

    if (!postTransactionDto.businessDate) {
      throw new BadRequestException('businessDate is required for posting');
    }

    const { shiftId, rateCode, propertyCurrency } = await resolvePostShiftId(
      this.prisma,
      folioId,
      postTransactionDto.userId,
    );

    const { amountNet, reference } = await this.resolveCashFxAmount(
      trxCode.code,
      postTransactionDto,
      propertyCurrency,
    );

    const amounts = computePostingAmounts(amountNet, trxCode);

    const lines = await resolvePostingLines(this.prisma, trxCode, rateCode, {
      trxCodeId: trxCode.id,
      code: trxCode.code,
      ...amounts,
    });

    await this.assertArCreditAllowsPost(folioId, sumBalanceImpact(lines));

    return this.prisma.$transaction(async (tx) => {
      const posted = await persistPostingLines(tx, {
        folioId,
        windowId: window.id,
        businessDate: new Date(postTransactionDto.businessDate),
        reference,
        remark: postTransactionDto.remark,
        userId: postTransactionDto.userId,
        reasonCodeId: postTransactionDto.reasonCodeId,
        shiftId,
        lines,
      });
      if (await this.isBalanceOverLimit(tx, folioId)) {
        return { ...posted, creditLimitExceeded: true };
      }
      return posted;
    });
  }

  private async resolveCashFxAmount(
    trxCode: string,
    dto: PostTransactionDto,
    propertyCurrency: string,
  ): Promise<{ amountNet: number; reference?: string }> {
    const guestCurrency = dto.currency;
    if (!needsCashFxConversion(trxCode, guestCurrency, propertyCurrency)) {
      return { amountNet: dto.amountNet, reference: dto.reference };
    }

    const foreignAmount = requireForeignAmount(dto.foreignAmount);
    const rateRow = await this.prisma.exchangeRate.findFirst(
      postingRateQuery(
        propertyCurrency,
        guestCurrency,
        new Date(dto.businessDate),
      ),
    );
    if (!rateRow) {
      throw new BadRequestException(MISSING_FX_RATE_MESSAGE);
    }

    const rate = Number(rateRow.rate);
    return {
      amountNet: convertForeignToBase(foreignAmount, rate),
      reference: formatFxReference(guestCurrency, foreignAmount, rate),
    };
  }

  async voidTransaction(transactionId: string, dto: VoidTransactionDto) {
    const original = await this.prisma.folioTransaction.findUnique({
      where: { id: transactionId },
      include: {
        window: {
          include: {
            folio: {
              include: {
                reservation: { include: { room: true } },
              },
            },
          },
        },
      },
    });

    if (!original) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    if (original.isVoid) {
      throw new BadRequestException('Transaction is already voided');
    }

    if (!dto.reasonCodeId) {
      throw new BadRequestException('reasonCodeId is required for voiding');
    }

    const reasonCode = await this.prisma.reasonCode.findUnique({
      where: { id: dto.reasonCodeId },
    });

    if (!reasonCode?.isActive) {
      throw new BadRequestException('Invalid or inactive reason code');
    }

    const shiftId = await resolveCashierShiftId(
      this.prisma,
      dto.userId,
      original.window?.folio?.reservation?.room?.propertyId,
    );

    return this.prisma.$transaction(async (tx) => {
      const correction = await tx.folioTransaction.create({
        data: {
          windowId: original.windowId,
          trxCodeId: original.trxCodeId,
          businessDate: original.businessDate,
          amountNet: original.amountNet,
          amountService: original.amountService,
          amountTax: original.amountTax,
          amountTotal: original.amountTotal,
          sign: original.sign * -1,
          userId: dto.userId,
          reference: original.reference,
          remark: dto.remark,
          reasonCodeId: dto.reasonCodeId,
          relatedTrxId: original.id,
          shiftId,
        },
      });

      await tx.folioTransaction.update({
        where: { id: original.id },
        data: {
          isVoid: true,
          voidedAt: new Date(),
          voidedBy: dto.userId,
          reasonCodeId: dto.reasonCodeId,
          relatedTrxId: correction.id,
        },
      });

      const totalImpact = Number(original.amountTotal) * original.sign * -1;

      const window = await tx.folioWindow.update({
        where: { id: original.windowId },
        data: { balance: { increment: totalImpact } },
      });

      await tx.folio.update({
        where: { id: window.folioId },
        data: { balance: { increment: totalImpact } },
      });

      return correction;
    });
  }

  async checkout(id: string, userId: string) {
    const folio = await this.loadFolioCreditContext(this.prisma, id);
    if (!folio) {
      throw new NotFoundException(`Folio with ID ${id} not found`);
    }
    if (folio.isClosed || folio.status === FolioStatus.CLOSED) {
      throw new ConflictException('Folio is already closed');
    }
    if (this.folioExceedsLimit(folio)) {
      throw new ConflictException('Folio balance exceeds credit limit');
    }
    return this.prisma.folio.update({
      where: { id },
      data: {
        status: FolioStatus.CLOSED,
        isClosed: true,
        closedAt: new Date(),
        closedBy: userId,
      },
    });
  }

  async setCreditLimit(id: string, creditLimit: number | null | undefined) {
    const folio = await this.prisma.folio.findUnique({ where: { id } });
    if (!folio) {
      throw new NotFoundException(`Folio with ID ${id} not found`);
    }
    return this.prisma.folio.update({
      where: { id },
      data: { creditLimit: creditLimit ?? null },
    });
  }

  async setArAccount(id: string, arAccountId: string | null | undefined) {
    const folio = await this.prisma.folio.findUnique({
      where: { id },
      include: { reservation: { include: { room: true } } },
    });
    if (!folio) {
      throw new NotFoundException(`Folio with ID ${id} not found`);
    }
    if (!arAccountId) {
      return this.prisma.folio.update({
        where: { id },
        data: { arAccountId: null },
      });
    }
    const account = await this.prisma.aRAccount.findUnique({
      where: { id: arAccountId },
    });
    if (!account) {
      throw new NotFoundException(
        `AR account with ID ${arAccountId} not found`,
      );
    }
    if (!account.isActive) {
      throw new ConflictException(AR_ACCOUNT_INACTIVE_MESSAGE);
    }
    if (account.propertyId !== folio.reservation.room.propertyId) {
      throw new BadRequestException(
        'AR account does not belong to this property',
      );
    }
    return this.prisma.folio.update({
      where: { id },
      data: { arAccountId },
    });
  }

  private async isBalanceOverLimit(
    db: PrismaService | Prisma.TransactionClient,
    folioId: string,
  ): Promise<boolean> {
    const folio = await this.loadFolioCreditContext(db, folioId);
    return folio ? this.folioExceedsLimit(folio) : false;
  }

  private async assertArCreditAllowsPost(folioId: string, impact: number) {
    if (impact <= 0) {
      return;
    }
    const folio = await this.prisma.folio.findUnique({
      where: { id: folioId },
      select: {
        balance: true,
        arAccount: {
          select: {
            isActive: true,
            creditLimit: true,
            currentBalance: true,
          },
        },
      },
    });
    if (!folio?.arAccount) {
      return;
    }
    if (!folio.arAccount.isActive) {
      throw new ConflictException(AR_ACCOUNT_INACTIVE_MESSAGE);
    }
    const remaining = remainingArCredit(
      folio.arAccount.creditLimit,
      folio.arAccount.currentBalance,
    );
    const projected = Number(folio.balance) + impact;
    if (wouldExceedArCredit(projected, remaining)) {
      throw new ConflictException(AR_CREDIT_EXCEEDED_MESSAGE);
    }
  }

  private async loadFolioCreditContext(
    db: PrismaService | Prisma.TransactionClient,
    folioId: string,
  ) {
    return db.folio.findUnique({
      where: { id: folioId },
      select: {
        id: true,
        balance: true,
        creditLimit: true,
        isClosed: true,
        status: true,
        reservation: {
          select: {
            room: {
              select: {
                property: { select: { defaultCreditLimit: true } },
              },
            },
          },
        },
      },
    });
  }

  private folioExceedsLimit(folio: {
    balance: unknown;
    creditLimit: unknown;
    reservation?: {
      room?: { property?: { defaultCreditLimit: unknown } | null } | null;
    } | null;
  }): boolean {
    const limit = resolveCreditLimit(
      folio.creditLimit,
      folio.reservation?.room?.property?.defaultCreditLimit,
    );
    return isOverCreditLimit(Number(folio.balance), limit);
  }
}
