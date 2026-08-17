import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PartnerHotelsService } from './partner-hotels.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerHotelDto } from './dto/create-partner-hotel.dto';

const mockPrismaService = {
  property: {
    findUnique: vi.fn(),
  },
  partnerHotel: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

function uniqueConflictError() {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '6.19.2',
  });
}

describe('PartnerHotelsService', () => {
  let service: PartnerHotelsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerHotelsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PartnerHotelsService>(PartnerHotelsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePartnerHotelDto = {
      propertyId: 'prop-1',
      name: 'Grand Partner Hotel',
      phone: '02-000-0000',
    };

    it('should create a partner hotel', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.partnerHotel.create.mockResolvedValue({
        id: 'ph-1',
        ...createDto,
        isActive: true,
      });

      const result = await service.create(createDto);
      expect(result.id).toBe('ph-1');
      expect(prisma.partnerHotel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on duplicate name', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.partnerHotel.create.mockRejectedValue(
        uniqueConflictError(),
      );
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all partner hotels', async () => {
      mockPrismaService.partnerHotel.findMany.mockResolvedValue([
        { id: 'ph-1' },
      ]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(prisma.partnerHotel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('should filter by propertyId', async () => {
      mockPrismaService.partnerHotel.findMany.mockResolvedValue([]);
      await service.findAll('prop-1');
      expect(prisma.partnerHotel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { propertyId: 'prop-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a partner hotel', async () => {
      mockPrismaService.partnerHotel.findUnique.mockResolvedValue({
        id: 'ph-1',
      });
      const result = await service.findOne('ph-1');
      expect(result.id).toBe('ph-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.partnerHotel.findUnique.mockResolvedValue(null);
      await expect(service.findOne('ph-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a partner hotel', async () => {
      mockPrismaService.partnerHotel.findUnique.mockResolvedValue({
        id: 'ph-1',
      });
      mockPrismaService.partnerHotel.update.mockResolvedValue({
        id: 'ph-1',
        isActive: false,
      });

      const result = await service.update('ph-1', { isActive: false });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.partnerHotel.findUnique.mockResolvedValue(null);
      await expect(service.update('ph-1', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on duplicate name', async () => {
      mockPrismaService.partnerHotel.findUnique.mockResolvedValue({
        id: 'ph-1',
      });
      mockPrismaService.partnerHotel.update.mockRejectedValue(
        uniqueConflictError(),
      );
      await expect(
        service.update('ph-1', { name: 'Duplicate' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
