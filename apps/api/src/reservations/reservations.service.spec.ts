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
  reservationStay: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
    createMany: vi.fn(),
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
  $transaction: vi.fn(),
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
    mockPrismaService.reservationStay.findMany.mockResolvedValue([]);
    mockPrismaService.reservationStay.deleteMany.mockResolvedValue({
      count: 0,
    });
    mockPrismaService.reservationStay.createMany.mockResolvedValue({
      count: 0,
    });
    mockPrismaService.$transaction.mockImplementation(
      async (callback: (tx: typeof mockPrismaService) => Promise<unknown>) =>
        callback(mockPrismaService),
    );
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

    it('should create a day-use reservation with 0 nights', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 1);
      checkIn.setHours(0, 0, 0, 0);
      const dayUseDto: CreateReservationDto = {
        ...createDto,
        checkIn: checkIn.toISOString(),
        checkOut: checkIn.toISOString(),
        isDayUse: true,
        roomRate: 1500,
      };

      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.create.mockResolvedValue({
        id: 'res-day-use',
        ...dayUseDto,
        nights: 0,
      });
      mockPrismaService.guest.update.mockResolvedValue({});

      await service.create(dayUseDto);

      expect(prisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isDayUse: true,
            nights: 0,
            totalAmount: 1500,
          }),
        }),
      );
    });

    it('should reject day-use reservations that span overnight', async () => {
      const dayUseDto: CreateReservationDto = {
        ...createDto,
        isDayUse: true,
      };

      await expect(service.create(dayUseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject day-use reservations that include split stays', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 1);
      checkIn.setHours(0, 0, 0, 0);
      const dayUseDto: CreateReservationDto = {
        ...createDto,
        checkIn: checkIn.toISOString(),
        checkOut: checkIn.toISOString(),
        isDayUse: true,
        stays: [
          {
            startDate: checkIn.toISOString(),
            endDate: checkIn.toISOString(),
            roomId: 'room-1',
            roomRate: 1500,
          },
          {
            startDate: checkIn.toISOString(),
            endDate: checkIn.toISOString(),
            roomId: 'room-2',
            roomRate: 1800,
          },
        ],
      };

      mockPrismaService.room.findUnique
        .mockResolvedValueOnce({ id: 'room-1' })
        .mockResolvedValueOnce({
          id: 'room-1',
          roomTypeId: 'type-a',
        })
        .mockResolvedValueOnce({
          id: 'room-2',
          roomTypeId: 'type-b',
        });
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });

      await expect(service.create(dayUseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a split stay with nested stay segments', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 1);
      checkIn.setHours(0, 0, 0, 0);
      const splitDate = new Date(checkIn);
      splitDate.setDate(splitDate.getDate() + 2);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 4);

      const splitDto: CreateReservationDto = {
        ...createDto,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        roomId: 'room-1',
        roomRate: 1000,
        stays: [
          {
            startDate: checkIn.toISOString(),
            endDate: splitDate.toISOString(),
            roomId: 'room-1',
            roomRate: 1000,
          },
          {
            startDate: splitDate.toISOString(),
            endDate: checkOut.toISOString(),
            roomId: 'room-2',
            roomRate: 1500,
          },
        ],
      };

      mockPrismaService.room.findUnique
        .mockResolvedValueOnce({ id: 'room-1' })
        .mockResolvedValueOnce({
          id: 'room-1',
          roomTypeId: 'type-a',
        })
        .mockResolvedValueOnce({
          id: 'room-2',
          roomTypeId: 'type-b',
        });
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.create.mockResolvedValue({
        id: 'res-split',
        ...splitDto,
      });
      mockPrismaService.guest.update.mockResolvedValue({});

      await service.create(splitDto);

      expect(prisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            roomId: 'room-1',
            isDayUse: false,
            nights: 4,
            totalAmount: 5000,
            stays: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  sequence: 0,
                  roomId: 'room-1',
                  roomTypeId: 'type-a',
                }),
                expect.objectContaining({
                  sequence: 1,
                  roomId: 'room-2',
                  roomTypeId: 'type-b',
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('should reject a split stay that overlaps another stay segment', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 1);
      checkIn.setHours(0, 0, 0, 0);
      const splitDate = new Date(checkIn);
      splitDate.setDate(splitDate.getDate() + 2);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 4);

      mockPrismaService.room.findUnique
        .mockResolvedValueOnce({ id: 'room-1', propertyId: 'prop-1' })
        .mockResolvedValueOnce({
          id: 'room-1',
          roomTypeId: 'type-a',
          propertyId: 'prop-1',
        })
        .mockResolvedValueOnce({
          id: 'room-2',
          roomTypeId: 'type-b',
          propertyId: 'prop-1',
        });
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservationStay.findMany.mockResolvedValue([
        { id: 'stay-conflict' },
      ]);

      await expect(
        service.create({
          ...createDto,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          stays: [
            {
              startDate: checkIn.toISOString(),
              endDate: splitDate.toISOString(),
              roomId: 'room-1',
              roomRate: 1000,
            },
            {
              startDate: splitDate.toISOString(),
              endDate: checkOut.toISOString(),
              roomId: 'room-2',
              roomRate: 1500,
            },
          ],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject a header-only create that overlaps a stay segment', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      mockPrismaService.guest.findUnique.mockResolvedValue({ id: 'guest-1' });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservationStay.findMany.mockResolvedValue([
        { id: 'stay-conflict' },
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
        stays: [],
      });
      const result = await service.findOne('res-1');
      expect(result).toEqual({ id: 'res-1', stays: [] });
      expect(prisma.reservation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            stays: expect.objectContaining({
              orderBy: { sequence: 'asc' },
            }),
          }),
        }),
      );
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
      isDayUse: false,
      stays: [],
      room: { propertyId: 'prop-1' },
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

    it('should reject marking an overnight stay as day-use', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );

      await expect(service.update('res-1', { isDayUse: true })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should convert a same-day stay to day-use and bill one night rate', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        ...existingReservation,
        checkOut: new Date('2024-01-01'),
      });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.update.mockResolvedValue({});

      await service.update('res-1', { isDayUse: true });

      expect(prisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isDayUse: true,
            nights: 0,
            totalAmount: 100,
          }),
        }),
      );
    });

    it('should reject date changes on a split stay without replacement stays', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        ...existingReservation,
        stays: [{ id: 'stay-1' }, { id: 'stay-2' }],
      });

      await expect(
        service.update('res-1', {
          checkOut: new Date('2024-01-08').toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should replace stay segments on update', async () => {
      const checkIn = new Date('2024-01-01T00:00:00.000Z');
      const splitDate = new Date('2024-01-03T00:00:00.000Z');
      const checkOut = new Date('2024-01-05T00:00:00.000Z');

      mockPrismaService.reservation.findUnique.mockResolvedValue({
        ...existingReservation,
        stays: [{ id: 'stay-1' }, { id: 'stay-2' }],
      });
      mockPrismaService.room.findUnique
        .mockResolvedValueOnce({
          id: 'room-1',
          roomTypeId: 'type-a',
          propertyId: 'prop-1',
        })
        .mockResolvedValueOnce({
          id: 'room-2',
          roomTypeId: 'type-b',
          propertyId: 'prop-1',
        });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
      });

      await service.update('res-1', {
        stays: [
          {
            startDate: checkIn.toISOString(),
            endDate: splitDate.toISOString(),
            roomId: 'room-1',
            roomRate: 1000,
          },
          {
            startDate: splitDate.toISOString(),
            endDate: checkOut.toISOString(),
            roomId: 'room-2',
            roomRate: 1500,
          },
        ],
      });

      expect(prisma.reservationStay.deleteMany).toHaveBeenCalledWith({
        where: { reservationId: 'res-1' },
      });
      expect(prisma.reservationStay.createMany).toHaveBeenCalled();
    });

    it('should replace the first stay room on update', async () => {
      const checkIn = new Date('2024-01-01T00:00:00.000Z');
      const splitDate = new Date('2024-01-03T00:00:00.000Z');
      const checkOut = new Date('2024-01-05T00:00:00.000Z');

      mockPrismaService.reservation.findUnique.mockResolvedValue({
        ...existingReservation,
        stays: [{ id: 'stay-1' }, { id: 'stay-2' }],
      });
      mockPrismaService.room.findUnique
        .mockResolvedValueOnce({
          id: 'room-3',
          roomTypeId: 'type-c',
          propertyId: 'prop-1',
        })
        .mockResolvedValueOnce({
          id: 'room-2',
          roomTypeId: 'type-b',
          propertyId: 'prop-1',
        });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
        roomId: 'room-3',
      });

      await service.update('res-1', {
        roomId: 'room-3',
        stays: [
          {
            startDate: checkIn.toISOString(),
            endDate: splitDate.toISOString(),
            roomId: 'room-3',
            roomRate: 1200,
          },
          {
            startDate: splitDate.toISOString(),
            endDate: checkOut.toISOString(),
            roomId: 'room-2',
            roomRate: 1500,
          },
        ],
      });

      expect(prisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            room: { connect: { id: 'room-3' } },
            roomRate: 1200,
          }),
        }),
      );
      expect(prisma.reservationStay.deleteMany).toHaveBeenCalled();
    });

    it('should not replace stays when only notes change on a split reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        ...existingReservation,
        stays: [{ id: 'stay-1' }, { id: 'stay-2' }],
        notes: 'Old',
      });
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
        notes: 'Quiet room',
      });

      await service.update('res-1', { notes: 'Quiet room' });

      expect(prisma.reservationStay.deleteMany).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should clear stay segments when stays is an empty array', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        ...existingReservation,
        stays: [{ id: 'stay-1' }, { id: 'stay-2' }],
      });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservation.update.mockResolvedValue({
        id: 'res-1',
      });

      await service.update('res-1', { stays: [] });

      expect(prisma.reservationStay.deleteMany).toHaveBeenCalledWith({
        where: { reservationId: 'res-1' },
      });
      expect(prisma.reservationStay.createMany).not.toHaveBeenCalled();
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

    it('should paint split occupancy on the segment room only', async () => {
      const startDate = new Date('2026-08-14T00:00:00.000Z');
      const splitDate = new Date('2026-08-16T00:00:00.000Z');
      const endDate = new Date('2026-08-18T00:00:00.000Z');

      mockPrismaService.room.findMany.mockResolvedValue([
        { id: 'room-1', number: '101', roomType: { id: 'type-a' } },
        { id: 'room-2', number: '201', roomType: { id: 'type-b' } },
      ]);
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.reservationStay.findMany.mockResolvedValue([
        {
          sequence: 0,
          startDate,
          endDate: splitDate,
          nights: 2,
          roomId: 'room-1',
          roomRate: 1000,
          reservation: {
            id: 'res-split',
            confirmNumber: 'PURA-1',
            status: 'CONFIRMED',
            totalAmount: 5000,
            guest: { id: 'guest-1', firstName: 'Ada', lastName: 'Lovelace' },
          },
        },
        {
          sequence: 1,
          startDate: splitDate,
          endDate,
          nights: 2,
          roomId: 'room-2',
          roomRate: 1500,
          reservation: {
            id: 'res-split',
            confirmNumber: 'PURA-1',
            status: 'CONFIRMED',
            totalAmount: 5000,
            guest: { id: 'guest-1', firstName: 'Ada', lastName: 'Lovelace' },
          },
        },
      ]);

      const result = await service.getCalendar('prop-1', startDate, endDate);

      expect(result.calendar[0].reservations).toEqual([
        expect.objectContaining({
          id: 'res-split',
          checkIn: startDate,
          checkOut: splitDate,
          staySequence: 0,
        }),
      ]);
      expect(result.calendar[1].reservations).toEqual([
        expect.objectContaining({
          id: 'res-split',
          checkIn: splitDate,
          checkOut: endDate,
          staySequence: 1,
          roomRate: 1500,
        }),
      ]);
    });
  });
});
