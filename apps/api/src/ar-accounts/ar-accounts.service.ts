import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FolioStatus,
  InvoiceStatus,
  Prisma,
  type Folio,
  type FolioWindow,
} from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { computePostingAmounts } from '../folios/folio-posting';
import { persistPostingLines } from '../folios/package-split';
import { resolveCashierShiftId } from '../folios/folio-shift';
import { CreateArAccountDto } from './dto/create-ar-account.dto';
import { UpdateArAccountDto } from './dto/update-ar-account.dto';
import { TransferFolioDto } from './dto/transfer-folio.dto';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';
import {
  addToAging,
  agingBucket,
  emptyAging,
  outstandingOf,
  toUtcDateOnly,
} from './aging';
import { formatAccountNumber, nextInvoiceNumber } from './ar-invoice-number';
import {
  ACCOUNT_INACTIVE,
  addDaysUtc,
  CITY_LEDGER_CODE_MISSING,
  CITY_LEDGER_TRX_CODE,
  FOLIO_ALREADY_INVOICED,
  FOLIO_NO_BALANCE,
  FOLIO_NOT_TRANSFERABLE,
  INVOICE_NOT_PAYABLE,
  PAYMENT_EXCEEDS_BALANCE,
  PROPERTY_MISMATCH,
  statusAfterPayment,
} from './city-ledger';
import { renderStatementHtml, type ArStatement } from './statement-html';

const accountInclude = {
  invoices: { orderBy: { invoiceNumber: 'asc' as const } },
} satisfies Prisma.ARAccountInclude;

const invoiceInclude = {
  arAccount: { select: { id: true, accountNumber: true, companyName: true } },
  folio: { select: { id: true, folioNumber: true } },
  payments: { orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.InvoiceInclude;

@Injectable()
export class ArAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(propertyId: string) {
    return this.prisma.aRAccount.findMany({
      where: { propertyId },
      include: accountInclude,
      orderBy: { accountNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.aRAccount.findUnique({
      where: { id },
      include: accountInclude,
    });
    if (!account) {
      throw new NotFoundException(`AR account with ID ${id} not found`);
    }
    return account;
  }

  async create(dto: CreateArAccountDto) {
    await this.requireProperty(dto.propertyId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const accountNumber =
          dto.accountNumber?.trim() ||
          (await this.nextAccountNumber(tx, dto.propertyId));
        return tx.aRAccount.create({
          data: {
            propertyId: dto.propertyId,
            accountNumber,
            companyName: dto.companyName,
            contactPerson: dto.contactPerson,
            email: dto.email,
            phone: dto.phone,
            address: dto.address,
            creditLimit: dto.creditLimit,
            paymentTerms: dto.paymentTerms ?? 30,
            isActive: dto.isActive ?? true,
          },
          include: accountInclude,
        });
      });
    } catch (err: unknown) {
      this.throwIfUniqueConflict(err, 'AR account number already exists');
      throw err;
    }
  }

  async update(id: string, dto: UpdateArAccountDto) {
    await this.findOne(id);
    try {
      return await this.prisma.aRAccount.update({
        where: { id },
        data: {
          accountNumber: dto.accountNumber,
          companyName: dto.companyName,
          contactPerson: dto.contactPerson,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          creditLimit: dto.creditLimit,
          paymentTerms: dto.paymentTerms,
          isActive: dto.isActive,
        },
        include: accountInclude,
      });
    } catch (err: unknown) {
      this.throwIfUniqueConflict(err, 'AR account number already exists');
      throw err;
    }
  }

  async aging(id: string, asOf?: string) {
    const account = await this.findOne(id);
    const asOfDate = toUtcDateOnly(asOf ?? new Date());
    let totals = emptyAging();
    for (const invoice of account.invoices) {
      if (invoice.status === InvoiceStatus.VOID) continue;
      const open = outstandingOf(invoice.amount, invoice.paidAmount);
      if (open <= 0) continue;
      totals = addToAging(totals, agingBucket(invoice.dueDate, asOfDate), open);
    }
    return {
      arAccountId: account.id,
      asOf: asOfDate.toISOString().slice(0, 10),
      currentBalance: Number(account.currentBalance),
      ...totals,
    };
  }

  async getStatement(id: string, asOf?: string): Promise<ArStatement> {
    const account = await this.findOne(id);
    const aging = await this.aging(id, asOf);
    return {
      accountNumber: account.accountNumber,
      companyName: account.companyName,
      asOf: aging.asOf,
      currentBalance: account.currentBalance,
      aging: {
        current: aging.current,
        days30: aging.days30,
        days60: aging.days60,
        days90: aging.days90,
      },
      invoices: account.invoices.filter(
        (invoice) => invoice.status !== InvoiceStatus.VOID,
      ),
    };
  }

  renderStatementHtml(statement: ArStatement): string {
    return renderStatementHtml(statement);
  }

  async findInvoices(propertyId: string, arAccountId?: string) {
    return this.prisma.invoice.findMany({
      where: {
        propertyId,
        ...(arAccountId ? { arAccountId } : {}),
      },
      include: invoiceInclude,
      orderBy: { invoiceNumber: 'asc' },
    });
  }

  async findInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceInclude,
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async transfer(arAccountId: string, dto: TransferFolioDto) {
    const account = await this.requireActiveAccount(arAccountId);
    const folio = await this.loadFolioForTransfer(dto.folioId);
    this.assertTransferable(folio, account.propertyId);
    await this.assertNoActiveInvoice(folio.id);
    const trxCode = await this.prisma.transactionCode.findUnique({
      where: { code: CITY_LEDGER_TRX_CODE },
    });
    if (!trxCode) {
      throw new BadRequestException(CITY_LEDGER_CODE_MISSING);
    }
    const window = this.pickWindow(folio.windows);
    const shiftId = await resolveCashierShiftId(
      this.prisma,
      dto.userId,
      account.propertyId,
    );
    const amounts = computePostingAmounts(Number(folio.balance), trxCode);
    const invoiceDate = toUtcDateOnly(folio.businessDate ?? new Date());

    return this.prisma.$transaction(async (tx) => {
      await persistPostingLines(tx, {
        folioId: folio.id,
        windowId: window.id,
        businessDate: invoiceDate,
        reference: `CITY LEDGER ${account.accountNumber}`,
        remark: dto.remark,
        userId: dto.userId,
        shiftId,
        lines: [{ trxCodeId: trxCode.id, code: trxCode.code, ...amounts }],
      });
      const invoiceNumber = await nextInvoiceNumber(
        (prefix) =>
          tx.invoice.count({
            where: {
              propertyId: account.propertyId,
              invoiceNumber: { startsWith: prefix },
            },
          }),
        invoiceDate,
      );
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          propertyId: account.propertyId,
          arAccountId: account.id,
          folioId: folio.id,
          invoiceDate,
          dueDate: addDaysUtc(invoiceDate, account.paymentTerms),
          amount: amounts.amountTotal,
          paidAmount: 0,
          status: InvoiceStatus.OPEN,
        },
        include: invoiceInclude,
      });
      await tx.aRAccount.update({
        where: { id: account.id },
        data: { currentBalance: { increment: amounts.amountTotal } },
      });
      await tx.folio.update({
        where: { id: folio.id },
        data: {
          status: FolioStatus.POSTED_TO_CITY_LEDGER,
          isClosed: true,
          closedAt: new Date(),
          closedBy: dto.userId,
        },
      });
      return invoice;
    });
  }

  async allocatePayment(invoiceId: string, dto: AllocatePaymentDto) {
    const invoice = await this.findInvoice(invoiceId);
    if (
      invoice.status === InvoiceStatus.VOID ||
      invoice.status === InvoiceStatus.PAID
    ) {
      throw new ConflictException(INVOICE_NOT_PAYABLE);
    }
    const open = outstandingOf(invoice.amount, invoice.paidAmount);
    if (dto.amount - open > 0.001) {
      throw new BadRequestException(PAYMENT_EXCEEDS_BALANCE);
    }
    const paidAmount = Number(invoice.paidAmount) + dto.amount;
    const status = statusAfterPayment(Number(invoice.amount), paidAmount);

    return this.prisma.$transaction(async (tx) => {
      await tx.invoicePayment.create({
        data: {
          invoiceId: invoice.id,
          amount: dto.amount,
          method: dto.method,
          reference: dto.reference,
          paidBy: dto.paidBy,
          businessDate: toUtcDateOnly(dto.businessDate),
        },
      });
      await tx.aRAccount.update({
        where: { id: invoice.arAccountId },
        data: { currentBalance: { decrement: dto.amount } },
      });
      return tx.invoice.update({
        where: { id: invoice.id },
        data: { paidAmount, status },
        include: invoiceInclude,
      });
    });
  }

  private async requireProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }
  }

  private async requireActiveAccount(id: string) {
    const account = await this.prisma.aRAccount.findUnique({ where: { id } });
    if (!account) {
      throw new NotFoundException(`AR account with ID ${id} not found`);
    }
    if (!account.isActive) {
      throw new ConflictException(ACCOUNT_INACTIVE);
    }
    return account;
  }

  private async loadFolioForTransfer(folioId: string) {
    const folio = await this.prisma.folio.findUnique({
      where: { id: folioId },
      include: {
        reservation: { include: { room: true } },
        windows: { orderBy: { windowNumber: 'asc' } },
      },
    });
    if (!folio) {
      throw new NotFoundException(`Folio with ID ${folioId} not found`);
    }
    return folio;
  }

  private assertTransferable(
    folio: Folio & {
      reservation: { room: { propertyId: string } } | null;
      windows: FolioWindow[];
    },
    propertyId: string,
  ) {
    if (folio.reservation?.room.propertyId !== propertyId) {
      throw new BadRequestException(PROPERTY_MISMATCH);
    }
    if (
      folio.isClosed ||
      folio.status === FolioStatus.CLOSED ||
      folio.status === FolioStatus.POSTED_TO_CITY_LEDGER
    ) {
      throw new ConflictException(FOLIO_NOT_TRANSFERABLE);
    }
    if (Number(folio.balance) <= 0) {
      throw new BadRequestException(FOLIO_NO_BALANCE);
    }
  }

  private pickWindow(windows: FolioWindow[]) {
    const window = windows.find((row) => row.windowNumber === 1) ?? windows[0];
    if (!window) {
      throw new BadRequestException('Folio has no windows');
    }
    return window;
  }

  private async assertNoActiveInvoice(folioId: string) {
    const existing = await this.prisma.invoice.findFirst({
      where: { folioId, status: { not: InvoiceStatus.VOID } },
    });
    if (existing) {
      throw new ConflictException(FOLIO_ALREADY_INVOICED);
    }
  }

  private async nextAccountNumber(
    tx: Prisma.TransactionClient,
    propertyId: string,
  ) {
    const count = await tx.aRAccount.count({ where: { propertyId } });
    return formatAccountNumber(count + 1);
  }

  private throwIfUniqueConflict(err: unknown, message: string) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(message);
    }
  }
}
