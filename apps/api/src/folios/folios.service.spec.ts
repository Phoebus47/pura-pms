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
  },
  transactionCode: {
    findUnique: vi.fn(),
  },
  folioTransaction: {
    create: vi.fn(),
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
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.folio.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            folioNumber: 'F000006',
            reservationId: 'res-1',
            type: 'GUEST',
            status: FolioStatus.OPEN,
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
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.folio.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.folio.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'folio-1' },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          include: expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            reservation: expect.any(Object),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    it('should return folios for a reservation', async () => {
      const mockFolios = [
        { id: 'folio-1', windows: [] },
        { id: 'folio-2', windows: [] },
      ];
      mockPrismaService.folio.findMany.mockResolvedValue(mockFolios);

      const result = await service.findByReservationId('res-1');

      expect(result).toHaveLength(2);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.folio.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reservationId: 'res-1' },
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            windowId: 'win-1',
            trxCodeId: 'trx-1',
            amountNet: 1000,
            amountService: 100, // 10% of 1000
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            amountTax: expect.closeTo(77, 0), // 7% of (1000 + 100)
            sign: 1,
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            amountService: 0,
            amountTax: 0,
            sign: -1,
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            businessDate: new Date('2025-01-15'),
          }),
        }),
      );
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            amountService: 100,
            amountTax: 0,
          }),
        }),
      );
    });
  });
});
