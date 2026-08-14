import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  draftLinesForTransaction,
  GUEST_LEDGER_CODE,
  isBalanced,
  JOURNAL_SOURCE_MANUAL,
  journalEntryNumber,
  mergeDraftLines,
} from './journal-lines';

function toDateOnly(value: string | Date): Date {
  const ymd =
    typeof value === 'string'
      ? value.slice(0, 10)
      : value.toISOString().slice(0, 10);
  return new Date(`${ymd}T00:00:00.000Z`);
}

@Injectable()
export class JournalsService {
  constructor(private readonly prisma: PrismaService) {}

  listAccounts() {
    return this.prisma.gLAccount.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  findByDate(propertyId: string, businessDate: string) {
    return this.prisma.journalEntry.findMany({
      where: {
        propertyId,
        entryDate: toDateOnly(businessDate),
      },
      include: { lines: { include: { account: true } } },
      orderBy: { source: 'asc' },
    });
  }

  async postForBusinessDate(
    propertyId: string,
    businessDate: string | Date,
    source = JOURNAL_SOURCE_MANUAL,
    postedBy = 'SYSTEM',
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }
    const entryDate = toDateOnly(businessDate);
    const existing = await this.prisma.journalEntry.findUnique({
      where: {
        propertyId_entryDate_source: {
          propertyId,
          entryDate,
          source,
        },
      },
      include: { lines: { include: { account: true } } },
    });
    if (existing) {
      return existing;
    }
    const lines = await this.buildLines(propertyId, entryDate);
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          entryNumber: journalEntryNumber(propertyId, entryDate, source),
          propertyId,
          entryDate,
          description: `Folio postings ${source} ${entryDate.toISOString().slice(0, 10)}`,
          source,
          isPosted: true,
          postedBy,
          postedAt: new Date(),
          lines: { create: lines },
        },
        include: { lines: { include: { account: true } } },
      });
      await this.applyAccountBalances(tx, lines);
      return entry;
    });
  }

  private async buildLines(propertyId: string, entryDate: Date) {
    const transactions = await this.prisma.folioTransaction.findMany({
      where: {
        businessDate: entryDate,
        isVoid: false,
        window: {
          folio: { reservation: { room: { propertyId } } },
        },
      },
      include: { trxCode: true },
    });
    const drafts = mergeDraftLines(
      transactions.flatMap((trx) =>
        draftLinesForTransaction({
          type: trx.trxCode.type,
          sign: trx.sign,
          amountTotal: trx.amountTotal,
          glAccountCode: trx.trxCode.glAccountCode,
        }),
      ),
    );
    if (!isBalanced(drafts)) {
      throw new BadRequestException('Journal lines are not balanced');
    }
    const codes = [...new Set(drafts.map((line) => line.glAccountCode))];
    if (!codes.includes(GUEST_LEDGER_CODE) && drafts.length > 0) {
      codes.push(GUEST_LEDGER_CODE);
    }
    const accounts = await this.prisma.gLAccount.findMany({
      where: { code: { in: codes } },
    });
    const idByCode = new Map(
      accounts.map((account) => [account.code, account.id]),
    );
    return drafts.map((line) => {
      const accountId = idByCode.get(line.glAccountCode);
      if (!accountId) {
        throw new BadRequestException(
          `GL account ${line.glAccountCode} is not seeded`,
        );
      }
      return {
        accountId,
        debit: line.debit,
        credit: line.credit,
      };
    });
  }

  private async applyAccountBalances(
    tx: Prisma.TransactionClient,
    lines: { accountId: string; debit: number; credit: number }[],
  ) {
    for (const line of lines) {
      await tx.gLAccount.update({
        where: { id: line.accountId },
        data: {
          balance: { increment: line.debit - line.credit },
        },
      });
    }
  }
}
