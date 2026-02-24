/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomStatus } from '@pura/database';

const mockPrismaService = {
  property: {
    findUnique: vi.fn(),
  },
  roomType: {
    findUnique: vi.fn(),
  },
  room: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  reservation: {
    count: vi.fn(),
  },
};

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPrismaService.room.findUnique.mockReset();
    mockPrismaService.room.create.mockReset();
    mockPrismaService.room.findMany.mockReset();
    mockPrismaService.room.update.mockReset();
    mockPrismaService.room.delete.mockReset();
    mockPrismaService.property.findUnique.mockReset();
    mockPrismaService.roomType.findUnique.mockReset();
    mockPrismaService.reservation.count.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      propertyId: 'prop-1',
      roomTypeId: 'type-1',
      number: '101',
      floor: 1,
    };

    it('should create a room successfully', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.roomType.findUnique.mockResolvedValue({ id: 'type-1' });
      mockPrismaService.room.findUnique.mockResolvedValue(null);
      mockPrismaService.room.create.mockResolvedValue({
        id: 'room-1',
        ...createDto,
      });

      const result = await service.create(createDto);
      expect(result).toBeDefined();

      expect(prisma.room.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if roomType not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.roomType.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if room number exists', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrismaService.roomType.findUnique.mockResolvedValue({ id: 'type-1' });
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return array of rooms', async () => {
      mockPrismaService.room.findMany.mockResolvedValue([{ id: 'room-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by params', async () => {
      await service.findAll('prop-1', 'type-1', RoomStatus.VACANT_CLEAN);

      expect(prisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            propertyId: 'prop-1',
            roomTypeId: 'type-1',
            status: RoomStatus.VACANT_CLEAN,
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a room', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      const result = await service.findOne('room-1');
      expect(result).toEqual({ id: 'room-1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);
      await expect(service.findOne('room-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update room', async () => {
      mockPrismaService.room.findUnique
        .mockResolvedValueOnce({
          id: 'room-1',
          number: '101',
          propertyId: 'prop-1',
        })
        .mockResolvedValueOnce(null); // No duplicate found

      mockPrismaService.room.update.mockResolvedValue({
        id: 'room-1',
        number: '102',
      });

      const result = await service.update('room-1', { number: '102' });
      expect(result.number).toBe('102');
    });

    it('should update without checking duplicates if number not changed', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({
        id: 'room-1',
        number: '101',
      });
      mockPrismaService.room.update.mockResolvedValue({
        id: 'room-1',
        status: RoomStatus.VACANT_DIRTY,
      });

      await service.update('room-1', { status: RoomStatus.VACANT_DIRTY });
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1); // Only finding the room, not checking dupes
    });

    it('should check for duplicate number if number changed', async () => {
      mockPrismaService.room.findUnique
        .mockResolvedValueOnce({
          id: 'room-1',
          number: '101',
          propertyId: 'prop-1',
        }) // for findOne
        .mockResolvedValueOnce({ id: 'existing' }); // for duplicate check

      try {
        await service.update('room-1', { number: '102' });
        // If we get here, it failed to throw
        throw new Error('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).message).toBe(
          'Room number 102 already exists for this property',
        );
      }
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      mockPrismaService.room.update.mockResolvedValue({
        id: 'room-1',
        status: RoomStatus.OCCUPIED_CLEAN,
      });

      const result = await service.updateStatus(
        'room-1',
        RoomStatus.OCCUPIED_CLEAN,
      );
      expect(result.status).toBe(RoomStatus.OCCUPIED_CLEAN);
    });
  });

  describe('remove', () => {
    it('should remove room if no active reservations', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      mockPrismaService.reservation.count.mockResolvedValue(0);
      mockPrismaService.room.delete.mockResolvedValue({ id: 'room-1' });

      await service.remove('room-1');

      expect(prisma.room.delete).toHaveBeenCalledWith({
        where: { id: 'room-1' },
      });
    });

    it('should throw BadRequestException if active reservations exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 'room-1' });
      mockPrismaService.reservation.count.mockResolvedValue(1);

      await expect(service.remove('room-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAvailability', () => {
    it('should return available rooms correctly aggregated', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          roomTypeId: 'type-1',
          roomType: { id: 'type-1', name: 'Deluxe' },
          reservations: [], // No conflict
          status: RoomStatus.VACANT_CLEAN,
        },
        {
          id: 'room-2',
          roomTypeId: 'type-1',
          roomType: { id: 'type-1', name: 'Deluxe' },
          reservations: [{ id: 'res-1' }], // Conflict
          status: RoomStatus.OCCUPIED_CLEAN,
        },
      ];

      mockPrismaService.room.findMany.mockResolvedValue(mockRooms);

      const result = await service.getAvailability(
        'prop-1',
        new Date(),
        new Date(),
      );

      expect(result.totalAvailable).toBe(1);
      expect(result.availability).toHaveLength(1);
      expect(result.availability[0].availableCount).toBe(1);
      expect(result.availability[0].rooms[0].id).toBe('room-1');
    });

    it('should filter by roomTypeId', async () => {
      mockPrismaService.room.findMany.mockResolvedValue([]);
      await service.getAvailability('prop-1', new Date(), new Date(), 'type-1');

      expect(prisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({
            roomTypeId: 'type-1',
          }),
        }),
      );
    });

    it('should aggregate multiple available rooms of the same type', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          number: '101',
          floor: 1,
          roomTypeId: 'type-1',
          roomType: { id: 'type-1', name: 'Deluxe' },
          reservations: [], // Available
          status: RoomStatus.VACANT_CLEAN,
        },
        {
          id: 'room-2',
          number: '102',
          floor: 1,
          roomTypeId: 'type-1', // SAME type
          roomType: { id: 'type-1', name: 'Deluxe' },
          reservations: [], // Available
          status: RoomStatus.VACANT_CLEAN,
        },
        {
          id: 'room-3',
          number: '201',
          floor: 2,
          roomTypeId: 'type-2', // Different type
          roomType: { id: 'type-2', name: 'Suite' },
          reservations: [], // Available
          status: RoomStatus.VACANT_CLEAN,
        },
      ];

      mockPrismaService.room.findMany.mockResolvedValue(mockRooms);

      const result = await service.getAvailability(
        'prop-1',
        new Date(),
        new Date(),
      );

      expect(result.totalAvailable).toBe(3);
      expect(result.availability).toHaveLength(2); // Two types

      // Find the Deluxe type
      const deluxe = result.availability.find(
        (a: { roomType: { id: string } }) => a.roomType.id === 'type-1',
      );
      expect(deluxe?.availableCount).toBe(2); // Both room-1 and room-2
      expect(deluxe?.rooms).toHaveLength(2);
    });
  });
});
