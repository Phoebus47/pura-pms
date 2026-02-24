/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

const mockPrismaService = {
  property: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePropertyDto = {
      name: 'Test Property',
      address: '123 Main St',
      currency: 'THB',
      timezone: 'Asia/Bangkok',
    };

    it('should create a property', async () => {
      mockPrismaService.property.create.mockResolvedValue({
        id: 'prop-1',
        ...createDto,
      });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(prisma.property.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Property',
          }),
        }),
      );
    });

    it('should create a property with defaults', async () => {
      const dtoDefaults: CreatePropertyDto = {
        name: 'Test Property',
        address: '123 Main St',
      };
      mockPrismaService.property.create.mockResolvedValue({
        id: 'prop-1',
        ...dtoDefaults,
        currency: 'THB',
        timezone: 'Asia/Bangkok',
      });

      await service.create(dtoDefaults);

      expect(prisma.property.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currency: 'THB',
            timezone: 'Asia/Bangkok',
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all properties', async () => {
      mockPrismaService.property.findMany.mockResolvedValue([{ id: 'prop-1' }]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(prisma.property.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a property', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });

      const result = await service.findOne('prop-1');
      expect(result.id).toBe('prop-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);
      await expect(service.findOne('prop-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdatePropertyDto = { name: 'Updated Property' };

    it('should update property', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.property.update.mockResolvedValue({
        id: 'prop-1',
        name: 'Updated Property',
      });

      const result = await service.update('prop-1', updateDto);
      expect(result.name).toBe('Updated Property');
    });
  });

  describe('remove', () => {
    it('should remove property if no dependencies', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        _count: { rooms: 0, roomTypes: 0 },
      });
      mockPrismaService.property.delete.mockResolvedValue({ id: 'prop-1' });

      await service.remove('prop-1');
      expect(prisma.property.delete).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
      });
    });

    it('should throw BadRequestException if dependencies exist', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        _count: { rooms: 1, roomTypes: 0 },
      });

      await expect(service.remove('prop-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if room types exist', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        _count: { rooms: 0, roomTypes: 1 },
      });

      await expect(service.remove('prop-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
