import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRatesService } from './exchange-rates.service';

const mockPrismaService = {
  exchangeRate: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRatesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExchangeRatesService>(ExchangeRatesService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exchange rate with uppercase currencies', async () => {
      const created = {
        id: 'fx-1',
        baseCurrency: 'THB',
        targetCurrency: 'USD',
        rate: 35,
        effectiveDate: new Date('2026-08-14'),
        isActive: true,
      };
      mockPrismaService.exchangeRate.create.mockResolvedValue(created);

      const result = await service.create({
        baseCurrency: 'thb',
        targetCurrency: 'usd',
        rate: 35,
        effectiveDate: '2026-08-14',
      });

      expect(result).toEqual(created);
      expect(mockPrismaService.exchangeRate.create).toHaveBeenCalledWith({
        data: {
          baseCurrency: 'THB',
          targetCurrency: 'USD',
          rate: 35,
          effectiveDate: new Date('2026-08-14'),
        },
      });
    });

    it('should throw 409 on unique pair and date conflict', async () => {
      mockPrismaService.exchangeRate.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.create({
          baseCurrency: 'THB',
          targetCurrency: 'USD',
          rate: 35,
          effectiveDate: '2026-08-14',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should rethrow non-unique prisma errors', async () => {
      mockPrismaService.exchangeRate.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('fk', {
          code: 'P2003',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.create({
          baseCurrency: 'THB',
          targetCurrency: 'USD',
          rate: 35,
          effectiveDate: '2026-08-14',
        }),
      ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findRateForPosting', () => {
    it('should look up the latest effectiveDate on or before the business date', async () => {
      const rate = {
        id: 'fx-1',
        baseCurrency: 'THB',
        targetCurrency: 'USD',
        rate: 35,
        effectiveDate: new Date('2026-08-01'),
      };
      mockPrismaService.exchangeRate.findFirst.mockResolvedValue(rate);

      const result = await service.findRateForPosting(
        'THB',
        'USD',
        '2026-08-14',
      );

      expect(result).toEqual(rate);
      expect(mockPrismaService.exchangeRate.findFirst).toHaveBeenCalledWith({
        where: {
          baseCurrency: 'THB',
          targetCurrency: 'USD',
          isActive: true,
          effectiveDate: { lte: new Date('2026-08-14') },
        },
        orderBy: { effectiveDate: 'desc' },
      });
    });
  });

  describe('findForDate', () => {
    it('should return the rate when found', async () => {
      const rate = { id: 'fx-1', rate: 35 };
      mockPrismaService.exchangeRate.findFirst.mockResolvedValue(rate);

      await expect(
        service.findForDate('THB', 'USD', '2026-08-14'),
      ).resolves.toEqual(rate);
    });

    it('should throw NotFoundException when no rate matches', async () => {
      mockPrismaService.exchangeRate.findFirst.mockResolvedValue(null);

      await expect(
        service.findForDate('THB', 'EUR', '2026-08-14'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findActive', () => {
    it('should list active rates newest first', async () => {
      const rates = [{ id: 'fx-1', isActive: true }];
      mockPrismaService.exchangeRate.findMany.mockResolvedValue(rates);

      const result = await service.findActive();

      expect(result).toEqual(rates);
      expect(mockPrismaService.exchangeRate.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ effectiveDate: 'desc' }, { targetCurrency: 'asc' }],
      });
    });
  });

  describe('update', () => {
    it('should patch rate and isActive', async () => {
      const updated = { id: 'fx-1', rate: 36, isActive: false };
      mockPrismaService.exchangeRate.update.mockResolvedValue(updated);

      const result = await service.update('fx-1', {
        rate: 36,
        isActive: false,
      });

      expect(result).toEqual(updated);
      expect(mockPrismaService.exchangeRate.update).toHaveBeenCalledWith({
        where: { id: 'fx-1' },
        data: { rate: 36, isActive: false },
      });
    });

    it('should throw NotFoundException when the rate is missing', async () => {
      mockPrismaService.exchangeRate.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', {
          code: 'P2025',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.update('missing', { isActive: false }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should rethrow other prisma errors on update', async () => {
      mockPrismaService.exchangeRate.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('fk', {
          code: 'P2003',
          clientVersion: 'test',
        }),
      );

      await expect(service.update('fx-1', { rate: 1 })).rejects.toBeInstanceOf(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });
});
