import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { RoomsService } from '../rooms/rooms.service';
import { MobileCheckInService } from './mobile-check-in.service';

const mockReservationsService = {
  findByConfirmNumber: vi.fn(),
  update: vi.fn(),
  checkIn: vi.fn(),
};

const mockRoomsService = {
  getAvailability: vi.fn(),
};

function makeReservation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'res-1',
    confirmNumber: 'CN-123',
    status: 'CONFIRMED',
    checkIn: new Date('2026-09-01'),
    checkOut: new Date('2026-09-03'),
    nights: 2,
    adults: 2,
    children: 0,
    guest: { firstName: 'Jane', lastName: 'Doe' },
    room: {
      id: 'room-1',
      number: '101',
      floor: 1,
      propertyId: 'prop-1',
      roomTypeId: 'type-1',
      roomType: { id: 'type-1', name: 'Deluxe', code: 'DLX' },
    },
    ...overrides,
  };
}

describe('MobileCheckInService', () => {
  let service: MobileCheckInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileCheckInService,
        { provide: ReservationsService, useValue: mockReservationsService },
        { provide: RoomsService, useValue: mockRoomsService },
      ],
    }).compile();
    service = module.get(MobileCheckInService);
    vi.clearAllMocks();
  });

  describe('lookup', () => {
    it('returns a safe view of the reservation', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation(),
      );

      const result = await service.lookup('CN-123');

      expect(mockReservationsService.findByConfirmNumber).toHaveBeenCalledWith(
        'CN-123',
      );
      expect(result).toEqual({
        confirmNumber: 'CN-123',
        status: 'CONFIRMED',
        checkIn: new Date('2026-09-01'),
        checkOut: new Date('2026-09-03'),
        nights: 2,
        adults: 2,
        children: 0,
        guestFirstName: 'Jane',
        guestLastName: 'Doe',
        room: {
          id: 'room-1',
          number: '101',
          floor: 1,
          roomType: { id: 'type-1', name: 'Deluxe', code: 'DLX' },
        },
        propertyId: 'prop-1',
      });
    });

    it('rejects when last name does not match', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation(),
      );

      await expect(service.lookup('CN-123', 'Smith')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows lookup when last name matches case-insensitively', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation(),
      );

      await expect(service.lookup('CN-123', 'doe')).resolves.toBeDefined();
    });
  });

  describe('listAvailableRooms', () => {
    it('delegates to rooms availability for the reservation window', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation(),
      );
      mockRoomsService.getAvailability.mockResolvedValue({
        checkIn: new Date('2026-09-01'),
        checkOut: new Date('2026-09-03'),
        availability: [{ roomType: {}, availableCount: 1, rooms: [] }],
        totalAvailable: 1,
      });

      const result = await service.listAvailableRooms('CN-123');

      expect(mockRoomsService.getAvailability).toHaveBeenCalledWith(
        'prop-1',
        new Date('2026-09-01'),
        new Date('2026-09-03'),
        'type-1',
      );
      expect(result).toEqual([{ roomType: {}, availableCount: 1, rooms: [] }]);
    });

    it('rejects when reservation is already checked in', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation({ status: 'CHECKED_IN' }),
      );

      await expect(service.listAvailableRooms('CN-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('selectRoom', () => {
    it('updates the reservation room via ReservationsService.update', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation(),
      );
      mockReservationsService.update.mockResolvedValue(
        makeReservation({
          room: {
            id: 'room-2',
            number: '102',
            floor: 1,
            propertyId: 'prop-1',
            roomTypeId: 'type-1',
            roomType: { id: 'type-1', name: 'Deluxe', code: 'DLX' },
          },
        }),
      );

      const result = await service.selectRoom('CN-123', {
        roomId: 'room-2',
      });

      expect(mockReservationsService.update).toHaveBeenCalledWith('res-1', {
        roomId: 'room-2',
      });
      expect(result.room.id).toBe('room-2');
    });

    it('rejects room changes after check-in', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation({ status: 'CHECKED_IN' }),
      );

      await expect(
        service.selectRoom('CN-123', { roomId: 'room-2' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockReservationsService.update).not.toHaveBeenCalled();
    });
  });

  describe('checkIn', () => {
    it('checks in and returns a digital key stub', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation(),
      );
      mockReservationsService.checkIn.mockResolvedValue(
        makeReservation({ status: 'CHECKED_IN' }),
      );

      const result = await service.checkIn('CN-123', 'Doe');

      expect(mockReservationsService.checkIn).toHaveBeenCalledWith('res-1');
      expect(result.reservation.status).toBe('CHECKED_IN');
      expect(result.digitalKey).toEqual({
        status: 'UNAVAILABLE',
        message: expect.stringContaining('front desk'),
      });
    });

    it('rejects when last name does not match', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        makeReservation(),
      );

      await expect(service.checkIn('CN-123', 'Smith')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockReservationsService.checkIn).not.toHaveBeenCalled();
    });
  });
});
