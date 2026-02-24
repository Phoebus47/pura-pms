import { Test, TestingModule } from '@nestjs/testing';
import { GuestsService } from './guests.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

const mockPrismaService = {
  guest: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  reservation: {
    findMany: vi.fn(),
  },
};

describe('GuestsService', () => {
  let service: GuestsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GuestsService>(GuestsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be instantiated explicitly', () => {
    const explicitService = new GuestsService(
      mockPrismaService as unknown as PrismaService,
    );
    expect(explicitService).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateGuestDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
    };

    it('should create a guest', async () => {
      mockPrismaService.guest.create.mockResolvedValue({
        id: 'guest-1',
        ...createDto,
        vipLevel: 0,
        isBlacklist: false,
        preferences: {},
      });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(prisma.guest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'john@example.com',
          }),
        }),
      );
    });

    it('should create a guest with defaults', async () => {
      const dtoDefaults = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123',
      };

      await service.create(dtoDefaults);

      expect(prisma.guest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            vipLevel: 0,
            isBlacklist: false,
            preferences: {},
          }),
        }),
      );
    });

    it('should create guest with dateOfBirth', async () => {
      const dob = new Date('1990-01-01');
      const dtoWithDob = { ...createDto, dateOfBirth: dob.toISOString() };

      await service.create(dtoWithDob);

      expect(prisma.guest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dateOfBirth: dob,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated guests', async () => {
      mockPrismaService.guest.findMany.mockResolvedValue([{ id: 'guest-1' }]);
      mockPrismaService.guest.count.mockResolvedValue(1);

      const result = await service.findAll(
        undefined,
        undefined,
        undefined,
        10,
        0,
      );

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        }),
      );
    });

    it('should filter by search term', async () => {
      await service.findAll('John');
      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { firstName: { contains: 'John', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should filter by isBlacklist', async () => {
      await service.findAll(undefined, true);
      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isBlacklist: true }),
        }),
      );
    });

    it('should filter by vipLevel', async () => {
      await service.findAll(undefined, undefined, 5);
      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ vipLevel: 5 }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a guest', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      const result = await service.findOne('guest-1');
      expect(result.id).toBe('guest-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue(null);
      await expect(service.findOne('guest-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return guest by email', async () => {
      mockPrismaService.guest.findFirst.mockResolvedValue({
        email: 'test@example.com',
      });
      const result = await service.findByEmail('test@example.com');
      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('findByPhone', () => {
    it('should return guest by phone', async () => {
      mockPrismaService.guest.findFirst.mockResolvedValue({ phone: '123' });
      const result = await service.findByPhone('123');
      expect(result?.phone).toBe('123');
    });
  });

  describe('update', () => {
    const updateDto: UpdateGuestDto = { firstName: 'Jane' };

    it('should update guest', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.guest.update.mockResolvedValue({
        id: 'guest-1',
        firstName: 'Jane',
      });

      const result = await service.update('guest-1', updateDto);
      expect(result.firstName).toBe('Jane');
    });

    it('should handle dateOfBirth update', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      const dob = new Date('1995-01-01');

      await service.update('guest-1', { dateOfBirth: dob.toISOString() });

      expect(prisma.guest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ dateOfBirth: dob }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove guest if no reservations', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        _count: { reservations: 0 },
      });
      mockPrismaService.guest.delete.mockResolvedValue({ id: 'guest-1' });

      await service.remove('guest-1');
      expect(prisma.guest.delete).toHaveBeenCalledWith({
        where: { id: 'guest-1' },
      });
    });

    it('should throw BadRequestException if reservations exist', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        _count: { reservations: 1 },
      });

      await expect(service.remove('guest-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getGuestHistory', () => {
    it('should return history and statistics', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          nights: 2,
          totalAmount: 200,
          checkIn: new Date('2024-01-01'),
        },
      ]);

      const result = await service.getGuestHistory('guest-1');

      expect(result.statistics.totalStays).toBe(1);
      expect(result.statistics.totalNights).toBe(2);
      expect(result.statistics.totalRevenue).toBe(200);
      expect(result.statistics.totalRevenue).toBe(200);
      expect(result.statistics.avgRate).toBe(100);
    });

    it('should handle no reservations', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);

      const result = await service.getGuestHistory('guest-1');

      expect(result.statistics.totalStays).toBe(0);
      expect(result.statistics.avgRate).toBe(0);
      expect(result.statistics.lastStay).toBeNull();
    });
  });

  describe('updateVipLevel', () => {
    it('should update vip level', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      await service.updateVipLevel('guest-1', 1);
      expect(prisma.guest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { vipLevel: 1 },
        }),
      );
    });
  });

  describe('toggleBlacklist', () => {
    it('should toggle blacklist status', async () => {
      mockPrismaService.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        isBlacklist: false,
      });

      await service.toggleBlacklist('guest-1');

      expect(prisma.guest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isBlacklist: true },
        }),
      );
    });
  });
});
