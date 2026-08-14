import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolioDto } from './dto/create-folio.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { FolioStatus } from '@pura/database';
import { VoidTransactionDto } from './dto/void-transaction.dto';
import { resolveCashierShiftId, resolvePostShiftId } from './folio-shift';
import { computePostingAmounts, standardWindowCreates } from './folio-posting';

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

    const { amountNet, amountService, amountTax, amountTotal, sign } =
      computePostingAmounts(postTransactionDto.amountNet, trxCode);

    const shiftId = await resolvePostShiftId(
      this.prisma,
      folioId,
      postTransactionDto.userId,
    );

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date(postTransactionDto.businessDate),
          amountNet,
          amountService,
          amountTax,
          amountTotal,
          sign,
          reference: postTransactionDto.reference,
          remark: postTransactionDto.remark,
          userId: postTransactionDto.userId,
          reasonCodeId: postTransactionDto.reasonCodeId,
          shiftId,
        },
      });

      // Update balances
      const totalImpact = amountTotal * sign;

      await tx.folioWindow.update({
        where: { id: window.id },
        data: { balance: { increment: totalImpact } },
      });

      await tx.folio.update({
        where: { id: folioId },
        data: { balance: { increment: totalImpact } },
      });

      return transaction;
    });
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
}
