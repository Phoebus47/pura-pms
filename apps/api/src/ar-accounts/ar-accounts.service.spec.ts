import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FolioStatus, InvoiceStatus, Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { ArAccountsService } from './ar-accounts.service';
import { CITY_LEDGER_TRX_CODE } from './city-ledger';

const businessDate = new Date('2026-08-14T00:00:00.000Z');

const mockPrismaService = {
  aRAccount: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  invoice: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  invoicePayment: { create: vi.fn() },
  folio: { findUnique: vi.fn(), update: vi.fn() },
  folioWindow: { update: vi.fn() },
  folioTransaction: { create: vi.fn() },
  transactionCode: { findUnique: vi.fn() },
  shift: { findFirst: vi.fn() },
  property: { findUnique: vi.fn() },
  $transaction: vi.fn(),
};

function openFolio() {
  return {
    id: 'fol-1',
    folioNumber: 'F000001',
    balance: 1070,
    isClosed: false,
    status: FolioStatus.OPEN,
    businessDate,
    reservation: { room: { propertyId: 'prop-1' } },
    windows: [{ id: 'win-1', windowNumber: 1 }],
  };
}

function openAccount() {
  return {
    id: 'ar-1',
    propertyId: 'prop-1',
    accountNumber: 'AR-000001',
    companyName: 'Acme',
    creditLimit: 50000,
    currentBalance: 0,
    paymentTerms: 30,
    isActive: true,
    invoices: [],
  };
}

describe('ArAccountsService', () => {
  let service: ArAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArAccountsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get<ArAccountsService>(ArAccountsService);
    vi.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) =>
        cb(mockPrismaService),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list accounts for a property', async () => {
    const rows = [openAccount()];
    mockPrismaService.aRAccount.findMany.mockResolvedValue(rows);

    const result = await service.findAll('prop-1');

    expect(result).toEqual(rows);
    expect(mockPrismaService.aRAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { propertyId: 'prop-1' } }),
    );
  });

  it('should throw when an account is missing', async () => {
    mockPrismaService.aRAccount.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should create an account with a generated number', async () => {
    mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrismaService.aRAccount.count.mockResolvedValue(0);
    const created = { id: 'ar-1', accountNumber: 'AR-000001' };
    mockPrismaService.aRAccount.create.mockResolvedValue(created);

    const result = await service.create({
      propertyId: 'prop-1',
      companyName: 'Acme',
      creditLimit: 50000,
    });

    expect(result).toEqual(created);
    expect(mockPrismaService.aRAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accountNumber: 'AR-000001',
          companyName: 'Acme',
          creditLimit: 50000,
          paymentTerms: 30,
        }),
      }),
    );
  });

  it('should reject a duplicate account number', async () => {
    mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrismaService.aRAccount.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({
        propertyId: 'prop-1',
        accountNumber: 'AR-000001',
        companyName: 'Acme',
        creditLimit: 1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should age open invoices from due date', async () => {
    mockPrismaService.aRAccount.findUnique.mockResolvedValue({
      ...openAccount(),
      currentBalance: 300,
      invoices: [
        {
          status: InvoiceStatus.OPEN,
          amount: 100,
          paidAmount: 0,
          dueDate: new Date('2026-08-20T00:00:00.000Z'),
        },
        {
          status: InvoiceStatus.PARTIAL,
          amount: 200,
          paidAmount: 50,
          dueDate: new Date('2026-07-20T00:00:00.000Z'),
        },
        {
          status: InvoiceStatus.VOID,
          amount: 999,
          paidAmount: 0,
          dueDate: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
    });

    const result = await service.aging('ar-1', '2026-08-14');

    expect(result).toEqual({
      arAccountId: 'ar-1',
      asOf: '2026-08-14',
      currentBalance: 300,
      current: 100,
      days30: 150,
      days60: 0,
      days90: 0,
    });
  });

  it('should transfer a folio balance to city ledger', async () => {
    mockPrismaService.aRAccount.findUnique.mockResolvedValue(openAccount());
    mockPrismaService.folio.findUnique.mockResolvedValue(openFolio());
    mockPrismaService.invoice.findFirst.mockResolvedValue(null);
    mockPrismaService.transactionCode.findUnique.mockResolvedValue({
      id: 'tc-9005',
      code: CITY_LEDGER_TRX_CODE,
      type: 'PAYMENT',
      hasTax: false,
      hasService: false,
      serviceRate: 0,
    });
    mockPrismaService.shift.findFirst.mockResolvedValue({ id: 'shift-1' });
    mockPrismaService.folioTransaction.create.mockResolvedValue({
      id: 'trx-1',
    });
    mockPrismaService.folioWindow.update.mockResolvedValue({});
    mockPrismaService.folio.update.mockResolvedValue({});
    mockPrismaService.invoice.count.mockResolvedValue(0);
    const created = { id: 'inv-1', invoiceNumber: 'AR-2026-000001' };
    mockPrismaService.invoice.create.mockResolvedValue(created);
    mockPrismaService.aRAccount.update.mockResolvedValue({});

    const result = await service.transfer('ar-1', {
      folioId: 'fol-1',
      userId: 'user-1',
    });

    expect(result).toEqual(created);
    expect(mockPrismaService.folioTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          trxCodeId: 'tc-9005',
          amountTotal: 1070,
          sign: -1,
          shiftId: 'shift-1',
        }),
      }),
    );
    expect(mockPrismaService.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          invoiceNumber: 'AR-2026-000001',
          folioId: 'fol-1',
          amount: 1070,
          status: InvoiceStatus.OPEN,
        }),
      }),
    );
    expect(mockPrismaService.aRAccount.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { currentBalance: { increment: 1070 } },
      }),
    );
    expect(mockPrismaService.folio.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: FolioStatus.POSTED_TO_CITY_LEDGER,
          isClosed: true,
          closedBy: 'user-1',
        }),
      }),
    );
  });

  it('should reject transfer when the folio is already closed', async () => {
    mockPrismaService.aRAccount.findUnique.mockResolvedValue(openAccount());
    mockPrismaService.folio.findUnique.mockResolvedValue({
      ...openFolio(),
      isClosed: true,
      status: FolioStatus.CLOSED,
    });

    await expect(
      service.transfer('ar-1', { folioId: 'fol-1', userId: 'user-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should reject a second city-ledger invoice for the same folio', async () => {
    mockPrismaService.aRAccount.findUnique.mockResolvedValue(openAccount());
    mockPrismaService.folio.findUnique.mockResolvedValue(openFolio());
    mockPrismaService.invoice.findFirst.mockResolvedValue({ id: 'inv-old' });

    await expect(
      service.transfer('ar-1', { folioId: 'fol-1', userId: 'user-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should allocate a payment against an open invoice', async () => {
    mockPrismaService.invoice.findUnique.mockResolvedValue({
      id: 'inv-1',
      arAccountId: 'ar-1',
      amount: 100,
      paidAmount: 20,
      status: InvoiceStatus.PARTIAL,
    });
    mockPrismaService.invoicePayment.create.mockResolvedValue({ id: 'pay-1' });
    mockPrismaService.aRAccount.update.mockResolvedValue({});
    const updated = {
      id: 'inv-1',
      paidAmount: 100,
      status: InvoiceStatus.PAID,
    };
    mockPrismaService.invoice.update.mockResolvedValue(updated);

    const result = await service.allocatePayment('inv-1', {
      amount: 80,
      method: 'BANK_TRANSFER',
      paidBy: 'user-1',
      businessDate: '2026-08-14',
    });

    expect(result).toEqual(updated);
    expect(mockPrismaService.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { paidAmount: 100, status: InvoiceStatus.PAID },
      }),
    );
    expect(mockPrismaService.aRAccount.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { currentBalance: { decrement: 80 } },
      }),
    );
  });

  it('should reject a payment larger than the outstanding balance', async () => {
    mockPrismaService.invoice.findUnique.mockResolvedValue({
      id: 'inv-1',
      amount: 100,
      paidAmount: 90,
      status: InvoiceStatus.PARTIAL,
    });

    await expect(
      service.allocatePayment('inv-1', {
        amount: 20,
        method: 'CASH',
        paidBy: 'user-1',
        businessDate: '2026-08-14',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
