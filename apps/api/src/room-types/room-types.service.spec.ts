import { Test, TestingModule } from '@nestjs/testing';
import { RoomTypesService } from './room-types.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';

const mockPrismaService = {
  property: {
    findUnique: vi.fn(),
  },
  roomType: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('RoomTypesService', () => {
  let service: RoomTypesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomTypesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RoomTypesService>(RoomTypesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateRoomTypeDto = {
      propertyId: 'prop-1',
      name: 'Deluxe',
      code: 'DLX',
      baseRate: 100,
      description: 'Deluxe Room',
      maxAdults: 2,
      maxChildren: 1,
      amenities: ['wifi'],
    };

    it('should create a room type', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.roomType.findFirst.mockResolvedValue(null);
      mockPrismaService.roomType.create.mockResolvedValue({
        id: 'type-1',
        ...createDto,
      });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(prisma.roomType.create).toHaveBeenCalled();
    });

    it('should create a room type with defaults', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.roomType.findFirst.mockResolvedValue(null);
      mockPrismaService.roomType.create.mockResolvedValue({
        id: 'type-1',
        ...createDto,
      });

      const dtoDefaults = {
        propertyId: 'prop-1',
        name: 'Deluxe',
        code: 'DLX',
        baseRate: 100,
        description: 'Deluxe Room',
      };

      await service.create(dtoDefaults as unknown as CreateRoomTypeDto);

      expect(prisma.roomType.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            maxAdults: 2,
            maxChildren: 1,
            amenities: [],
          }),
        }),
      );
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if code exists', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.roomType.findFirst.mockResolvedValue({
        id: 'existing',
      });
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all room types', async () => {
      mockPrismaService.roomType.findMany.mockResolvedValue([{ id: 'type-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by propertyId', async () => {
      await service.findAll('prop-1');
      expect(prisma.roomType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propertyId: 'prop-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a room type', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue({ id: 'type-1' });
      const result = await service.findOne('type-1');
      expect(result.id).toBe('type-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue(null);
      await expect(service.findOne('type-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update room type', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue({
        id: 'type-1',
        propertyId: 'prop-1',
      });
      mockPrismaService.roomType.update.mockResolvedValue({
        id: 'type-1',
        name: 'Updated',
      });

      const result = await service.update('type-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should check duplicate code on update', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue({
        id: 'type-1',
        propertyId: 'prop-1',
      });
      mockPrismaService.roomType.findFirst.mockResolvedValue({
        id: 'existing',
      });

      await expect(service.update('type-1', { code: 'DUPE' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow code update when no duplicate exists', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue({
        id: 'type-1',
        propertyId: 'prop-1',
      });
      mockPrismaService.roomType.findFirst.mockResolvedValue(null); // No duplicate
      mockPrismaService.roomType.update.mockResolvedValue({
        id: 'type-1',
        code: 'NEW-CODE',
      });

      const result = await service.update('type-1', { code: 'NEW-CODE' });
      expect(result.code).toBe('NEW-CODE');
      expect(mockPrismaService.roomType.findFirst).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue(null);
      await expect(service.update('type-1', { name: 'Up' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove if no rooms', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue({
        id: 'type-1',
        _count: { rooms: 0 },
      });
      mockPrismaService.roomType.delete.mockResolvedValue({ id: 'type-1' });

      await service.remove('type-1');
      expect(prisma.roomType.delete).toHaveBeenCalledWith({
        where: { id: 'type-1' },
      });
    });

    it('should throw BadRequestException if rooms exist', async () => {
      mockPrismaService.roomType.findUnique.mockResolvedValue({
        id: 'type-1',
        _count: { rooms: 1 },
      });
      await expect(service.remove('type-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
