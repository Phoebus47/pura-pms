import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { TaxInvoicesService } from './tax-invoices.service';

const businessDate = new Date('2026-08-14T00:00:00.000Z');

const mockPrismaService = {
  taxInvoice: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  folio: { findUnique: vi.fn() },
  $transaction: vi.fn(),
};

function folioForIssue() {
  return {
    id: 'fol-1',
    folioNumber: 'F000001',
    reservationId: 'res-1',
    businessDate,
    reservation: {
      id: 'res-1',
      guest: { firstName: 'Ann', lastName: 'Guest' },
      room: { propertyId: 'prop-1' },
    },
    windows: [
      {
        transactions: [
          {
            isVoid: false,
            sign: 1,
            amountNet: 1000,
            amountTax: 70,
            amountTotal: 1070,
          },
          {
            isVoid: false,
            sign: -1,
            amountNet: 200,
            amountTax: 0,
            amountTotal: 200,
          },
        ],
      },
    ],
  };
}

describe('TaxInvoicesService', () => {
  let service: TaxInvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxInvoicesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get<TaxInvoicesService>(TaxInvoicesService);
    vi.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) =>
        cb(mockPrismaService),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list invoices for a property and date', async () => {
    const rows = [{ id: 'ti-1' }];
    mockPrismaService.taxInvoice.findMany.mockResolvedValue(rows);

    const result = await service.findAll('prop-1', '2026-08-14');

    expect(result).toEqual(rows);
    expect(mockPrismaService.taxInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { propertyId: 'prop-1', businessDate: new Date('2026-08-14') },
      }),
    );
  });

  it('should throw when invoice is missing', async () => {
    mockPrismaService.taxInvoice.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should issue an invoice with charge snapshot and running number', async () => {
    mockPrismaService.folio.findUnique.mockResolvedValue(folioForIssue());
    mockPrismaService.taxInvoice.findFirst.mockResolvedValue(null);
    mockPrismaService.taxInvoice.count.mockResolvedValue(1);
    const created = { id: 'ti-1', invoiceNumber: 'TI-2026-000002' };
    mockPrismaService.taxInvoice.create.mockResolvedValue(created);

    const result = await service.issue({
      folioId: 'fol-1',
      taxId: '1234567890123',
      issuedBy: 'user-1',
    });

    expect(result).toEqual(created);
    expect(mockPrismaService.taxInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          invoiceNumber: 'TI-2026-000002',
          propertyId: 'prop-1',
          folioId: 'fol-1',
          taxId: '1234567890123',
          buyerName: 'Ann Guest',
          amountNet: 1000,
          amountTax: 70,
          amountTotal: 1070,
          status: InvoiceStatus.OPEN,
          issuedBy: 'user-1',
        }),
      }),
    );
  });

  it('should reject a second active invoice for the same folio', async () => {
    mockPrismaService.folio.findUnique.mockResolvedValue(folioForIssue());
    mockPrismaService.taxInvoice.findFirst.mockResolvedValue({ id: 'ti-old' });

    await expect(
      service.issue({
        folioId: 'fol-1',
        taxId: '1234567890123',
        issuedBy: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(mockPrismaService.taxInvoice.create).not.toHaveBeenCalled();
  });

  it('should reject issue when the folio is missing', async () => {
    mockPrismaService.folio.findUnique.mockResolvedValue(null);

    await expect(
      service.issue({
        folioId: 'missing',
        taxId: '1234567890123',
        issuedBy: 'user-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should void an issued invoice with a reason', async () => {
    mockPrismaService.taxInvoice.findUnique.mockResolvedValue({
      id: 'ti-1',
      status: InvoiceStatus.OPEN,
    });
    const voided = { id: 'ti-1', status: InvoiceStatus.VOID };
    mockPrismaService.taxInvoice.update.mockResolvedValue(voided);

    const result = await service.void('ti-1', {
      reason: 'Wrong buyer',
      voidedBy: 'user-1',
    });

    expect(result).toEqual(voided);
    expect(mockPrismaService.taxInvoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: InvoiceStatus.VOID,
          voidReason: 'Wrong buyer',
          voidedBy: 'user-1',
        }),
      }),
    );
  });

  it('should reject voiding an already void invoice', async () => {
    mockPrismaService.taxInvoice.findUnique.mockResolvedValue({
      id: 'ti-1',
      status: InvoiceStatus.VOID,
    });

    await expect(
      service.void('ti-1', { reason: 'again', voidedBy: 'user-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
