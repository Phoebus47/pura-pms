import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { IssueTaxInvoiceDto } from './dto/issue-tax-invoice.dto';
import { VoidTaxInvoiceDto } from './dto/void-tax-invoice.dto';
import { snapshotFolioCharges } from './folio-snapshot';
import { nextInvoiceNumber } from './invoice-number';

const invoiceInclude = {
  property: {
    select: { id: true, name: true, address: true, taxId: true },
  },
  folio: { select: { id: true, folioNumber: true } },
  reservation: {
    select: {
      id: true,
      confirmNumber: true,
      guest: { select: { firstName: true, lastName: true } },
    },
  },
} satisfies Prisma.TaxInvoiceInclude;

@Injectable()
export class TaxInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(propertyId: string, businessDate?: string) {
    return this.prisma.taxInvoice.findMany({
      where: {
        propertyId,
        ...(businessDate ? { businessDate: new Date(businessDate) } : {}),
      },
      include: invoiceInclude,
      orderBy: { invoiceNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.taxInvoice.findUnique({
      where: { id },
      include: invoiceInclude,
    });
    if (!invoice) {
      throw new NotFoundException(`Tax invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async issue(dto: IssueTaxInvoiceDto) {
    const folio = await this.loadFolioForIssue(dto.folioId);
    await this.assertNoActiveInvoice(dto.folioId);
    const propertyId = folio.reservation.room.propertyId;
    const businessDate = folio.businessDate ?? new Date();
    const lines = folio.windows.flatMap((window) => window.transactions);
    const snapshot = snapshotFolioCharges(lines);
    const buyerName =
      dto.buyerName?.trim() ||
      `${folio.reservation.guest.firstName} ${folio.reservation.guest.lastName}`.trim();

    return this.prisma.$transaction(async (tx) => {
      const invoiceNumber = await nextInvoiceNumber(
        (prefix) =>
          tx.taxInvoice.count({
            where: { propertyId, invoiceNumber: { startsWith: prefix } },
          }),
        businessDate,
      );
      return tx.taxInvoice.create({
        data: {
          invoiceNumber,
          propertyId,
          folioId: folio.id,
          reservationId: folio.reservationId,
          businessDate,
          taxId: dto.taxId,
          branchNumber: dto.branchNumber,
          buyerName,
          amountNet: snapshot.amountNet,
          amountTax: snapshot.amountTax,
          amountTotal: snapshot.amountTotal,
          status: InvoiceStatus.OPEN,
          issuedAt: new Date(),
          issuedBy: dto.issuedBy,
        },
        include: invoiceInclude,
      });
    });
  }

  async void(id: string, dto: VoidTaxInvoiceDto) {
    const invoice = await this.prisma.taxInvoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Tax invoice with ID ${id} not found`);
    }
    if (invoice.status === InvoiceStatus.VOID) {
      throw new ConflictException('Tax invoice is already void');
    }
    return this.prisma.taxInvoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.VOID,
        voidReason: dto.reason,
        voidedAt: new Date(),
        voidedBy: dto.voidedBy,
      },
      include: invoiceInclude,
    });
  }

  private async loadFolioForIssue(folioId: string) {
    const folio = await this.prisma.folio.findUnique({
      where: { id: folioId },
      include: {
        reservation: {
          include: {
            guest: true,
            room: true,
          },
        },
        windows: { include: { transactions: true } },
      },
    });
    if (!folio) {
      throw new NotFoundException(`Folio with ID ${folioId} not found`);
    }
    return folio;
  }

  private async assertNoActiveInvoice(folioId: string) {
    const existing = await this.prisma.taxInvoice.findFirst({
      where: {
        folioId,
        status: { not: InvoiceStatus.VOID },
      },
    });
    if (existing) {
      throw new ConflictException(
        'An active tax invoice already exists for this folio',
      );
    }
  }
}
