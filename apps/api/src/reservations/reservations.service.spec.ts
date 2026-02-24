import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { FoliosService } from '../folios/folios.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationStatus } from '@pura/database';
import { CreateReservationDto } from './dto/create-reservation.dto';

const mockPrismaService = {
  reservation: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  room: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  guest: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

const mockFoliosService = {
  create: vi.fn(),
  findByReservationId: vi.fn().mockResolvedValue([]),
  postTransaction: vi.fn(),
};

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FoliosService,
          useValue: mockFoliosService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get<PrismaService>(PrismaService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateReservationDto = {
      checkIn: new Date(
        new Date().setDate(new Date().getDate() + 1),
      ).toISOString(),
      checkOut: new Date(
        new Date().setDate(new Date().getDate() + 3),
      ).toISOString(),
      roomId: 'room-1',
      guestId: 'guest-1',
      adults: 2,
      roomRate: 100,
    };

    it('should create a reservation successfully', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.create.mockResolvedValue({
        id: 'res-1',
        ...createDto,
      });
      mockPrismaService.guest.update.mockResolvedValue({});

      const result = await service.create(createDto);

      expect(result).toBeDefined();

      expect(prisma.reservation.create).toHaveBeenCalled();

      expect(prisma.guest.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if check-out is before check-in', async () => {
      const invalidDto = { ...createDto, checkOut: createDto.checkIn };
      await expect(
        service.create(invalidDto as unknown as CreateReservationDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if check-in is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const invalidDto = { ...createDto, checkIn: pastDate.toISOString() };
      await expect(
        service.create(invalidDto as unknown as CreateReservationDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if room not found', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if guest not found', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      mockPrismaService.guest.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if room is not available', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.reservation.findMany.mockResolvedValue([
        { id: 'conflict-1' },
      ]);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of reservations', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        { id: 'res-1' },
        { id: 'res-2' },
      ]);

      const result = await service.findAll();
      expect(result).toHaveLength(2);

      expect(prisma.reservation.findMany).toHaveBeenCalled();
    });

    it('should filter by propertyId', async () => {
      await service.findAll('prop-1');
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ room: { propertyId: 'prop-1' } }),
        }),
      );
    });

    it('should filter by multiple params', async () => {
      const checkIn = new Date();
      const checkOut = new Date();
      await service.findAll(
        undefined,
        ReservationStatus.CONFIRMED,
        checkIn,
        checkOut,
        'guest-1',
      );
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ReservationStatus.CONFIRMED,
            guestId: 'guest-1',
          }),
        }),
      );
    });
    it('should filter by checkIn only', async () => {
      const checkIn = new Date();
      await service.findAll(undefined, undefined, checkIn);
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ checkIn: { gte: checkIn } }],
          }),
        }),
      );
    });

    it('should filter by checkOut only', async () => {
      const checkOut = new Date();
      await service.findAll(undefined, undefined, undefined, checkOut);
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ checkOut: { lte: checkOut } }],
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
      });
      const result = await service.findOne('res-1');
      expect(result).toEqual({ id: 'res-1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);
      await expect(service.findOne('res-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByConfirmNumber', () => {
    it('should return a reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        confirmNumber: 'CN-123',
      });
      const result = await service.findByConfirmNumber('CN-123');
      expect(result).toEqual({ id: 'res-1', confirmNumber: 'CN-123' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);
      await expect(service.findByConfirmNumber('CN-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const existingReservation = {
      id: 'res-1',
      roomId: 'room-1',
      checkIn: new Date('2024-01-01'),
      checkOut: new Date('2024-01-05'),
      roomRate: 100,
    };

    it('should update simple fields without checks', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );
      mockPrismaService.reservation.update.mockResolvedValue({
        ...existingReservation,
        notes: 'Updated',
      });

      const result = await service.update('res-1', { notes: 'Updated' });
      expect(result.notes).toBe('Updated');
    });

    it('should validate dates and throw ConflictException if conflict exists', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );
      mockPrismaService.reservation.findMany.mockResolvedValue([
        { id: 'conflict' },
      ]);

      await expect(
        service.update('res-1', {
          checkIn: new Date('2024-01-02').toISOString(),
          checkOut: new Date('2024-01-06').toISOString(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if update checkIn >= checkOut', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );
      await expect(
        service.update('res-1', {
          checkIn: new Date('2024-01-06').toISOString(),
          checkOut: new Date('2024-01-06').toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should recalculate totals if dates change', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        ...existingReservation,
        roomRate: 100,
      });
      mockPrismaService.reservation.findMany.mockResolvedValue([]); // No conflicts
      mockPrismaService.reservation.update.mockResolvedValue({});

      await service.update('res-1', {
        checkIn: new Date('2024-01-01').toISOString(),
        checkOut: new Date('2024-01-03').toISOString(), // 2 nights
      });

      expect(prisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nights: 2,
            totalAmount: 200,
          }),
        }),
      );
    });
    it('should update partial dates (checkIn only)', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.update.mockResolvedValue({});

      await service.update('res-1', {
        checkIn: new Date('2024-01-02').toISOString(),
      });

      expect(prisma.reservation.update).toHaveBeenCalled();
    });

    it('should update partial dates (checkOut only)', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.update.mockResolvedValue({});

      await service.update('res-1', {
        checkOut: new Date('2024-01-04').toISOString(),
      });

      expect(prisma.reservation.update).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CONFIRMED,
      });
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CANCELLED,
      });

      const result = await service.cancel('res-1', 'reason');
      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should throw BadRequestException if already cancelled', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CANCELLED,
      });
      await expect(service.cancel('res-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if checked out', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CHECKED_OUT,
      });
      await expect(service.cancel('res-1')).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should cancel without reason', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CONFIRMED,
        notes: 'Original Note',
      });
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CANCELLED,
      });

      await service.cancel('res-1');
      expect(prisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notes: 'Original Note',
          }),
        }),
      );
    });
  });

  describe('checkIn', () => {
    it('should check in a reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CONFIRMED,
        roomId: 'room-1',
      });
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CHECKED_IN,
      });
      mockPrismaService.room.update.mockResolvedValue({});

      const result = await service.checkIn('res-1');
      expect(result.status).toBe(ReservationStatus.CHECKED_IN);
    });

    it('should check in a reservation and not create folio if one exists', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CONFIRMED,
        roomId: 'room-1',
      });
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CHECKED_IN,
      });
      mockPrismaService.room.update.mockResolvedValue({});
      mockFoliosService.findByReservationId.mockResolvedValueOnce([
        { id: 'folio-1' },
      ]);

      await service.checkIn('res-1');
      expect(mockFoliosService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if not confirmed', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.TENTATIVE,
      });
      await expect(service.checkIn('res-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkOut', () => {
    it('should check out a reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CHECKED_IN,
        roomId: 'room-1',
      });
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CHECKED_OUT,
      });
      mockPrismaService.room.update.mockResolvedValue({});

      const result = await service.checkOut('res-1');
      expect(result.status).toBe(ReservationStatus.CHECKED_OUT);
    });

    it('should throw BadRequestException if not checked in', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: ReservationStatus.CONFIRMED,
      });
      await expect(service.checkOut('res-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getCalendar', () => {
    it('should return calendar data', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'res-1',
          roomId: 'room-1',
          checkIn: new Date(),
          checkOut: new Date(),
        },
      ]);
      mockPrismaService.room.findMany.mockResolvedValue([
        { id: 'room-1', number: '101' },
      ]);

      const result = await service.getCalendar(
        'prop-1',
        new Date(),
        new Date(),
      );

      expect(result.calendar).toHaveLength(1);
      expect(result.calendar[0].reservations).toHaveLength(1);
      expect(result.totalRooms).toBe(1);
      expect(result.totalReservations).toBe(1);
    });

    it('should filter by roomTypeId', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.room.findMany.mockResolvedValue([]);
      await service.getCalendar('prop-1', new Date(), new Date(), 'type-1');

      expect(prisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ roomTypeId: 'type-1' }),
        }),
      );
    });
  });
});
