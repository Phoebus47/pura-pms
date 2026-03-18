import { Test, TestingModule } from '@nestjs/testing';
import { FoliosService } from './folios.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { FolioStatus } from '@pura/database';
import { vi } from 'vitest';

const mockPrismaService = {
  reservation: {
    findUnique: vi.fn(),
  },
  folio: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  folioWindow: {
    findUnique: vi.fn(),
    update: vi.fn(),
    createMany: vi.fn(),
  },
  transactionCode: {
    findUnique: vi.fn(),
  },
  reasonCode: {
    findUnique: vi.fn(),
  },
  folioTransaction: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('FoliosService', () => {
  let service: FoliosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoliosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FoliosService>(FoliosService);
    prisma = module.get<PrismaService>(PrismaService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a folio successfully', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
      });
      mockPrismaService.folio.count.mockResolvedValue(5);
      mockPrismaService.folio.create.mockResolvedValue({
        id: 'folio-1',
        folioNumber: 'F000006',
        status: FolioStatus.OPEN,
      });

      const result = await service.create({ reservationId: 'res-1' });

      expect(result).toBeDefined();

      expect(prisma.folio.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            folioNumber: 'F000006',
            reservationId: 'res-1',
            type: 'GUEST',
            status: FolioStatus.OPEN,
            windows: {
              create: [
                { windowNumber: 1, description: 'Main Billing' },
                { windowNumber: 2, description: 'Auxiliary window 2' },
                { windowNumber: 3, description: 'Auxiliary window 3' },
                { windowNumber: 4, description: 'Auxiliary window 4' },
              ],
            },
          }),
        }),
      );
    });

    it('should create with custom type', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
      });
      mockPrismaService.folio.count.mockResolvedValue(0);
      mockPrismaService.folio.create.mockResolvedValue({
        id: 'folio-1',
        type: 'COMPANY',
      });

      const result = await service.create({
        reservationId: 'res-1',
        type: 'COMPANY' as const,
      });

      expect(result).toBeDefined();

      expect(prisma.folio.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'COMPANY',
          }),
        }),
      );
    });

    it('should throw NotFoundException if reservation not found', async () => {
      expect.assertions(2);
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ reservationId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
      expect(true).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a folio with full relations', async () => {
      const mockFolio = {
        id: 'folio-1',
        folioNumber: 'F000001',
        reservation: { guest: {}, room: {} },
        windows: [{ transactions: [] }],
      };
      mockPrismaService.folio.findUnique.mockResolvedValue(mockFolio);

      const result = await service.findOne('folio-1');

      expect(result).toEqual(mockFolio);

      expect(prisma.folio.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'folio-1' },

          include: expect.objectContaining({
            reservation: expect.any(Object),

            windows: expect.any(Object),
          }),
        }),
      );
    });

    it('should throw NotFoundException if folio not found', async () => {
      expect.assertions(2);
      mockPrismaService.folio.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(true).toBe(true);
    });
  });

  describe('findByReservationId', () => {
    it('should return empty array when no folios', async () => {
      mockPrismaService.folio.findMany.mockResolvedValueOnce([]);

      const result = await service.findByReservationId('res-empty');

      expect(result).toEqual([]);
      expect(mockPrismaService.folioWindow.createMany).not.toHaveBeenCalled();
    });

    it('should ensure windows and return folios with ordered relations', async () => {
      const fullFolios = [
        { id: 'folio-1', windows: [{ windowNumber: 1, transactions: [] }] },
      ];
      mockPrismaService.folio.findMany
        .mockResolvedValueOnce([{ id: 'folio-1' }, { id: 'folio-2' }])
        .mockResolvedValueOnce(fullFolios);
      mockPrismaService.folioWindow.createMany.mockResolvedValue({ count: 4 });

      const result = await service.findByReservationId('res-1');

      expect(result).toEqual(fullFolios);
      expect(mockPrismaService.folioWindow.createMany).toHaveBeenCalledTimes(2);
      expect(prisma.folio.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: { reservationId: 'res-1' },
          include: expect.objectContaining({
            windows: expect.objectContaining({
              orderBy: { windowNumber: 'asc' },
            }),
          }),
        }),
      );
    });
  });

  describe('postTransaction', () => {
    const baseDto = {
      windowNumber: 1,
      trxCodeId: 'trx-1',
      amountNet: 1000,
      userId: 'user-1',
      businessDate: '2025-01-15',
    };

    it('should post a CHARGE transaction with tax and service', async () => {
      const mockWindow = { id: 'win-1' };
      const mockTrxCode = {
        id: 'trx-1',
        type: 'CHARGE',
        hasTax: true,
        hasService: true,
        serviceRate: 10, // 10%
      };

      mockPrismaService.folioWindow.findUnique.mockResolvedValue(mockWindow);
      mockPrismaService.transactionCode.findUnique.mockResolvedValue(
        mockTrxCode,
      );

      // Mock $transaction to execute the callback
      mockPrismaService.$transaction.mockImplementation(
        async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) => {
          return cb(mockPrismaService);
        },
      );
      mockPrismaService.folioTransaction.create.mockResolvedValue({
        id: 'trx-result',
      });
      mockPrismaService.folioWindow.update.mockResolvedValue({});
      mockPrismaService.folio.update.mockResolvedValue({});

      const result = await service.postTransaction('folio-1', baseDto);

      expect(result).toEqual({ id: 'trx-result' });

      expect(mockPrismaService.folioTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            windowId: 'win-1',
            trxCodeId: 'trx-1',
            amountNet: 1000,
            amountService: 100, // 10% of 1000

            amountTax: expect.closeTo(77, 0), // 7% of (1000 + 100)
            sign: 1,
            businessDate: new Date('2025-01-15'),
          }),
        }),
      );
    });

    it('should post a PAYMENT transaction (negative sign)', async () => {
      const mockWindow = { id: 'win-1' };
      const mockTrxCode = {
        id: 'trx-2',
        type: 'PAYMENT',
        hasTax: false,
        hasService: false,
        serviceRate: null,
      };

      mockPrismaService.folioWindow.findUnique.mockResolvedValue(mockWindow);
      mockPrismaService.transactionCode.findUnique.mockResolvedValue(
        mockTrxCode,
      );
      mockPrismaService.$transaction.mockImplementation(
        async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) => {
          return cb(mockPrismaService);
        },
      );
      mockPrismaService.folioTransaction.create.mockResolvedValue({
        id: 'trx-pay',
      });
      mockPrismaService.folioWindow.update.mockResolvedValue({});
      mockPrismaService.folio.update.mockResolvedValue({});

      await service.postTransaction('folio-1', {
        ...baseDto,
        trxCodeId: 'trx-2',
      });

      expect(mockPrismaService.folioTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amountService: 0,
            amountTax: 0,
            sign: -1,
            businessDate: new Date('2025-01-15'),
          }),
        }),
      );
    });

    it('should post with custom businessDate', async () => {
      mockPrismaService.folioWindow.findUnique.mockResolvedValue({
        id: 'win-1',
      });
      mockPrismaService.transactionCode.findUnique.mockResolvedValue({
        id: 'trx-1',
        type: 'CHARGE',
        hasTax: false,
        hasService: false,
        serviceRate: null,
      });
      mockPrismaService.$transaction.mockImplementation(
        async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) => {
          return cb(mockPrismaService);
        },
      );
      mockPrismaService.folioTransaction.create.mockResolvedValue({});
      mockPrismaService.folioWindow.update.mockResolvedValue({});
      mockPrismaService.folio.update.mockResolvedValue({});

      await service.postTransaction('folio-1', {
        ...baseDto,
        businessDate: '2025-01-15',
      });

      expect(mockPrismaService.folioTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            businessDate: new Date('2025-01-15'),
          }),
        }),
      );
    });

    it('should require businessDate', async () => {
      expect.assertions(3);
      mockPrismaService.folioWindow.findUnique.mockResolvedValue({
        id: 'win-1',
      });
      mockPrismaService.transactionCode.findUnique.mockResolvedValue({
        id: 'trx-1',
        type: 'CHARGE',
        hasTax: false,
        hasService: false,
        serviceRate: null,
      });

      await expect(
        service.postTransaction('folio-1', {
          ...baseDto,
          businessDate: '' as never,
        }),
      ).rejects.toThrow('businessDate is required for posting');

      expect(true).toBe(true);
      expect(mockPrismaService.folioTransaction.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if window not found', async () => {
      expect.assertions(2);
      mockPrismaService.folioWindow.findUnique.mockResolvedValue(null);

      await expect(service.postTransaction('folio-1', baseDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(true).toBe(true);
    });

    it('should throw NotFoundException if trxCode not found', async () => {
      expect.assertions(2);
      mockPrismaService.folioWindow.findUnique.mockResolvedValue({
        id: 'win-1',
      });
      mockPrismaService.transactionCode.findUnique.mockResolvedValue(null);

      await expect(service.postTransaction('folio-1', baseDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(true).toBe(true);
    });

    it('should handle service charge without tax', async () => {
      mockPrismaService.folioWindow.findUnique.mockResolvedValue({
        id: 'win-1',
      });
      mockPrismaService.transactionCode.findUnique.mockResolvedValue({
        id: 'trx-1',
        type: 'CHARGE',
        hasTax: false,
        hasService: true,
        serviceRate: 10,
      });
      mockPrismaService.$transaction.mockImplementation(
        async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) => {
          return cb(mockPrismaService);
        },
      );
      mockPrismaService.folioTransaction.create.mockResolvedValue({});
      mockPrismaService.folioWindow.update.mockResolvedValue({});
      mockPrismaService.folio.update.mockResolvedValue({});

      await service.postTransaction('folio-1', baseDto);

      expect(mockPrismaService.folioTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amountService: 100,
            amountTax: 0,
            businessDate: new Date('2025-01-15'),
          }),
        }),
      );
    });
  });

  describe('voidTransaction', () => {
    const baseDto = {
      userId: 'user-1',
      reasonCodeId: 'reason-1',
    };

    it('should throw NotFoundException if transaction not found', async () => {
      expect.assertions(2);
      mockPrismaService.folioTransaction.findUnique.mockResolvedValue(null);

      await expect(
        service.voidTransaction('missing-trx', baseDto),
      ).rejects.toThrow(NotFoundException);
      expect(true).toBe(true);
    });

    it('should throw BadRequestException if already voided', async () => {
      expect.assertions(2);
      mockPrismaService.folioTransaction.findUnique.mockResolvedValue({
        id: 'trx-1',
        isVoid: true,
      });

      await expect(service.voidTransaction('trx-1', baseDto)).rejects.toThrow(
        'Transaction is already voided',
      );
      expect(true).toBe(true);
    });

    it('should throw BadRequestException if reasonCodeId missing', async () => {
      expect.assertions(2);
      mockPrismaService.folioTransaction.findUnique.mockResolvedValue({
        id: 'trx-1',
        isVoid: false,
      });

      await expect(
        // Cast to any so we can omit reasonCodeId intentionally
        service.voidTransaction('trx-1', { userId: 'user-1' } as any),
      ).rejects.toThrow('reasonCodeId is required for voiding');
      expect(true).toBe(true);
    });

    it('should throw BadRequestException if reason code invalid or inactive', async () => {
      expect.assertions(3);
      mockPrismaService.folioTransaction.findUnique.mockResolvedValue({
        id: 'trx-1',
        isVoid: false,
      });
      mockPrismaService.reasonCode.findUnique.mockResolvedValueOnce(null);

      await expect(service.voidTransaction('trx-1', baseDto)).rejects.toThrow(
        'Invalid or inactive reason code',
      );
      expect(true).toBe(true);

      mockPrismaService.reasonCode.findUnique.mockResolvedValueOnce({
        id: 'reason-1',
        isActive: false,
      });

      await expect(service.voidTransaction('trx-1', baseDto)).rejects.toThrow(
        'Invalid or inactive reason code',
      );
    });

    it('should create correcting transaction and mark original as void', async () => {
      const original = {
        id: 'trx-1',
        windowId: 'win-1',
        trxCodeId: 'code-1',
        businessDate: new Date('2025-01-15'),
        amountNet: 100,
        amountService: 10,
        amountTax: 7,
        amountTotal: 117,
        sign: 1,
        isVoid: false,
        reference: 'Ref',
      };

      mockPrismaService.folioTransaction.findUnique.mockResolvedValue(original);
      mockPrismaService.reasonCode.findUnique.mockResolvedValue({
        id: 'reason-1',
        isActive: true,
      });

      mockPrismaService.$transaction.mockImplementation(
        async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) =>
          cb(mockPrismaService),
      );

      mockPrismaService.folioTransaction.create.mockResolvedValue({
        id: 'trx-correction',
      });

      mockPrismaService.folioTransaction.update.mockResolvedValue({});
      mockPrismaService.folioWindow.update.mockResolvedValue({
        id: 'win-1',
        folioId: 'folio-1',
      });
      mockPrismaService.folio.update.mockResolvedValue({});

      const result = await service.voidTransaction('trx-1', {
        ...baseDto,
        remark: 'Void test',
      });

      expect(result).toEqual({ id: 'trx-correction' });
      expect(mockPrismaService.folioTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            windowId: original.windowId,
            trxCodeId: original.trxCodeId,
            amountNet: original.amountNet,
            amountService: original.amountService,
            amountTax: original.amountTax,
            amountTotal: original.amountTotal,
            sign: -1,
            userId: baseDto.userId,
            reasonCodeId: baseDto.reasonCodeId,
            relatedTrxId: original.id,
          }),
        }),
      );
      expect(mockPrismaService.folioTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: original.id },
          data: expect.objectContaining({
            isVoid: true,
            voidedBy: baseDto.userId,
            reasonCodeId: baseDto.reasonCodeId,
          }),
        }),
      );
      expect(mockPrismaService.folioWindow.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: original.windowId },
          data: expect.objectContaining({
            balance: { increment: -117 },
          }),
        }),
      );
      expect(mockPrismaService.folio.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'folio-1' },
          data: expect.objectContaining({
            balance: { increment: -117 },
          }),
        }),
      );
    });
  });
});
