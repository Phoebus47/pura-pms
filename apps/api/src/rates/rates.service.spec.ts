import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RatesService } from './rates.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { RATE_DERIVE_AMOUNT_LOCKED_MESSAGE } from './rate-derive';

const mockPrismaService = {
  property: { findUnique: vi.fn() },
  roomType: { findUnique: vi.fn() },
  rate: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

const standaloneDto: CreateRateDto = {
  code: 'BAR',
  name: 'Best Available',
  roomTypeId: 'rt-1',
  propertyId: 'prop-1',
  amount: 1500,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};

const parentRate = {
  id: 'rate-bar',
  code: 'BAR',
  name: 'Best Available',
  amount: 1500,
  propertyId: 'prop-1',
  parentRateId: null,
  deriveMode: null,
  deriveValue: null,
};

describe('RatesService', () => {
  let service: RatesService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrismaService.roomType.findUnique.mockResolvedValue({
      id: 'rt-1',
      propertyId: 'prop-1',
    });
    service = new RatesService(mockPrismaService as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a standalone rate', async () => {
      mockPrismaService.rate.create.mockResolvedValue({
        id: 'rate-1',
        ...standaloneDto,
      });

      const result = await service.create(standaloneDto);
      expect(result.id).toBe('rate-1');
      expect(mockPrismaService.rate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 1500,
            parentRateId: undefined,
          }),
        }),
      );
    });

    it('should derive amount from the parent rate', async () => {
      mockPrismaService.rate.findUnique.mockResolvedValue(parentRate);
      mockPrismaService.rate.create.mockResolvedValue({
        id: 'rate-corp',
        amount: 1350,
      });

      const result = await service.create({
        ...standaloneDto,
        code: 'CORP',
        name: 'Corporate',
        amount: undefined,
        parentRateId: 'rate-bar',
        deriveMode: 'PERCENT_OFFSET',
        deriveValue: -10,
      });

      expect(result.amount).toBe(1350);
      expect(mockPrismaService.rate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 1350,
            parentRateId: 'rate-bar',
          }),
        }),
      );
    });

    it('should throw when the property is missing', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);
      await expect(service.create(standaloneDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw when the room type is on another property', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue({
        id: 'rt-1',
        propertyId: 'other',
      });
      await expect(service.create(standaloneDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should filter by property and room type', async () => {
      mockPrismaService.rate.findMany.mockResolvedValue([]);
      await service.findAll('prop-1', 'rt-1');
      expect(mockPrismaService.rate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propertyId: 'prop-1', roomTypeId: 'rt-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a rate', async () => {
      mockPrismaService.rate.findUnique.mockResolvedValue({ id: 'rate-1' });
      const result = await service.findOne('rate-1');
      expect(result.id).toBe('rate-1');
    });

    it('should throw when missing', async () => {
      mockPrismaService.rate.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should cascade derived children when the parent amount changes', async () => {
      mockPrismaService.rate.findUnique.mockResolvedValue({
        ...parentRate,
        amount: 1500,
      });
      mockPrismaService.rate.update.mockResolvedValue({
        ...parentRate,
        amount: 2000,
      });
      mockPrismaService.rate.findMany.mockImplementation(
        (args: { where?: { parentRateId?: string } }) => {
          if (args.where?.parentRateId === 'rate-bar') {
            return Promise.resolve([
              {
                id: 'rate-corp',
                deriveMode: 'PERCENT_OFFSET',
                deriveValue: -10,
              },
            ]);
          }
          return Promise.resolve([]);
        },
      );

      await service.update('rate-bar', { amount: 2000 });

      expect(mockPrismaService.rate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 1800 }),
        }),
      );
    });

    it('should reject a manual amount on a derived rate', async () => {
      mockPrismaService.rate.findUnique.mockResolvedValue({
        id: 'rate-corp',
        propertyId: 'prop-1',
        parentRateId: 'rate-bar',
        deriveMode: 'PERCENT_OFFSET',
        deriveValue: -10,
        amount: 1350,
      });

      await expect(
        service.update('rate-corp', { amount: 1400 }),
      ).rejects.toThrow(RATE_DERIVE_AMOUNT_LOCKED_MESSAGE);
    });

    it('should reject a derivation cycle', async () => {
      mockPrismaService.rate.findUnique
        .mockResolvedValueOnce({
          id: 'rate-bar',
          propertyId: 'prop-1',
          parentRateId: null,
          deriveMode: null,
          deriveValue: null,
          amount: 1500,
        })
        .mockResolvedValueOnce({
          id: 'rate-corp',
          propertyId: 'prop-1',
          parentRateId: 'rate-bar',
        });

      await expect(
        service.update('rate-bar', {
          parentRateId: 'rate-corp',
          deriveMode: 'PERCENT_OFFSET',
          deriveValue: -5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
