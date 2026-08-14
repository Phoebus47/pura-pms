import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CardPreauthStatus } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { CardPreauthsService } from './card-preauths.service';
import { CARD_PAYMENT_TRX_CODE } from './preauth-rules';

const mockPrisma = {
  cardPreauth: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  reservation: { findUnique: vi.fn() },
  folio: { findUnique: vi.fn(), update: vi.fn() },
  folioWindow: { update: vi.fn() },
  folioTransaction: { create: vi.fn() },
  transactionCode: { findUnique: vi.fn() },
  shift: { findFirst: vi.fn() },
  $transaction: vi.fn(),
};

function openHold() {
  return {
    id: 'pa-1',
    reservationId: 'res-1',
    amount: 1000,
    status: CardPreauthStatus.HELD,
    last4: '4242',
    manualRef: 'AUTH-1',
  };
}

describe('CardPreauthsService', () => {
  let service: CardPreauthsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardPreauthsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CardPreauthsService>(CardPreauthsService);
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrisma) => Promise<unknown>) => cb(mockPrisma),
    );
  });

  it('should create a held pre-auth for an existing reservation', async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue({ id: 'res-1' });
    mockPrisma.cardPreauth.create.mockResolvedValue({
      id: 'pa-1',
      status: CardPreauthStatus.HELD,
    });

    const result = await service.create({
      reservationId: 'res-1',
      amount: 1000,
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2028,
      manualRef: 'AUTH-1',
      createdBy: 'user-1',
    });

    expect(result.status).toBe(CardPreauthStatus.HELD);
    expect(mockPrisma.cardPreauth.create).toHaveBeenCalled();
  });

  it('should increment an open hold', async () => {
    mockPrisma.cardPreauth.findUnique.mockResolvedValue(openHold());
    mockPrisma.cardPreauth.update.mockResolvedValue({
      id: 'pa-1',
      amount: 1500,
      status: CardPreauthStatus.INCREMENTAL,
    });

    const result = await service.increment('pa-1', { amount: 1500 });

    expect(result.status).toBe(CardPreauthStatus.INCREMENTAL);
  });

  it('should reject incrementing a captured hold', async () => {
    mockPrisma.cardPreauth.findUnique.mockResolvedValue({
      ...openHold(),
      status: CardPreauthStatus.CAPTURED,
    });
    await expect(
      service.increment('pa-1', { amount: 1500 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should release an open hold', async () => {
    mockPrisma.cardPreauth.findUnique.mockResolvedValue(openHold());
    mockPrisma.cardPreauth.update.mockResolvedValue({
      id: 'pa-1',
      status: CardPreauthStatus.RELEASED,
    });
    const result = await service.release('pa-1');
    expect(result.status).toBe(CardPreauthStatus.RELEASED);
  });

  it('should capture a hold as a 9001 folio payment', async () => {
    mockPrisma.cardPreauth.findUnique.mockResolvedValue(openHold());
    mockPrisma.folio.findUnique.mockResolvedValue({
      id: 'fol-1',
      reservationId: 'res-1',
      businessDate: new Date('2026-08-14T00:00:00.000Z'),
      reservation: { room: { propertyId: 'prop-1' } },
      windows: [{ id: 'win-1', windowNumber: 1 }],
    });
    mockPrisma.transactionCode.findUnique.mockResolvedValue({
      id: 'tc-9001',
      code: CARD_PAYMENT_TRX_CODE,
      type: 'PAYMENT',
      hasTax: false,
      hasService: false,
      serviceRate: 0,
    });
    mockPrisma.shift.findFirst.mockResolvedValue({ id: 'shift-1' });
    mockPrisma.folioTransaction.create.mockResolvedValue({ id: 'trx-1' });
    mockPrisma.folioWindow.update.mockResolvedValue({});
    mockPrisma.folio.update.mockResolvedValue({});
    mockPrisma.cardPreauth.update.mockResolvedValue({
      id: 'pa-1',
      status: CardPreauthStatus.CAPTURED,
      capturedAmount: 1000,
    });

    const result = await service.capture('pa-1', {
      folioId: 'fol-1',
      userId: 'user-1',
    });

    expect(result.status).toBe(CardPreauthStatus.CAPTURED);
    expect(mockPrisma.folioTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          trxCodeId: 'tc-9001',
          amountTotal: 1000,
          sign: -1,
        }),
      }),
    );
  });

  it('should throw when the pre-auth is missing', async () => {
    mockPrisma.cardPreauth.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
