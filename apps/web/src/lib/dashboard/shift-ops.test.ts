import { describe, expect, it } from 'vitest';
import type { Reservation } from '@/lib/api/reservations';
import type { Room } from '@/lib/api/rooms';
import { buildShiftOpsSnapshot, todayDateKey } from './shift-ops';

function reservation(
  overrides: Partial<Reservation> & Pick<Reservation, 'id' | 'status'>,
): Reservation {
  return {
    confirmNumber: `CN-${overrides.id}`,
    checkIn: '2024-01-15T14:00:00.000Z',
    checkOut: '2024-01-16T12:00:00.000Z',
    nights: 1,
    adults: 1,
    children: 0,
    numberOfGuests: 1,
    roomRate: 1000,
    totalAmount: 1000,
    paidAmount: 0,
    roomId: 'room-1',
    guestId: 'guest-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    guest: { id: 'guest-1', firstName: 'Ada', lastName: 'Lovelace' },
    room: {
      id: 'room-1',
      number: '101',
      roomType: {
        id: 'rt-1',
        name: 'Deluxe',
        code: 'DLX',
        baseRate: 1000,
      },
      property: { id: 'prop-1', name: 'Pura Resort' },
    },
    ...overrides,
  };
}

function room(overrides: Partial<Room> & Pick<Room, 'id' | 'status'>): Room {
  return {
    number: '101',
    roomTypeId: 'rt-1',
    propertyId: 'prop-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    property: { id: 'prop-1', name: 'Pura Resort' },
    ...overrides,
  };
}

describe('buildShiftOpsSnapshot', () => {
  const now = new Date('2024-01-15T12:00:00.000Z');

  it('computes remaining/total arrivals and departures for business date', () => {
    const snapshot = buildShiftOpsSnapshot(
      [
        reservation({ id: 'a1', status: 'CONFIRMED' }),
        reservation({ id: 'a2', status: 'CHECKED_IN' }),
        reservation({
          id: 'd1',
          status: 'CHECKED_IN',
          checkIn: '2024-01-14T14:00:00.000Z',
          checkOut: '2024-01-15T12:00:00.000Z',
        }),
      ],
      [room({ id: 'room-1', status: 'VACANT_CLEAN', hkStage: 'READY' })],
      now,
    );

    expect(todayDateKey(now)).toBe('2024-01-15');
    expect(snapshot.arrivals).toEqual({ remaining: 1, total: 2 });
    expect(snapshot.departures).toEqual({ remaining: 1, total: 1 });
    expect(snapshot.propertyName).toBe('Pura Resort');
    expect(snapshot.readyToSell).toBe(1);
  });

  it('flags unassigned and vip blockers on work items', () => {
    const snapshot = buildShiftOpsSnapshot(
      [
        reservation({
          id: 'u1',
          status: 'CONFIRMED',
          roomId: '',
          room: undefined,
          isRoomLocked: true,
        }),
      ],
      [room({ id: 'room-2', status: 'VACANT_DIRTY', hkStage: 'DIRTY' })],
      now,
    );

    expect(snapshot.unassigned.remaining).toBe(1);
    expect(snapshot.vipCount).toBe(1);
    expect(snapshot.dirtyRooms).toBe(1);
    expect(snapshot.workItems[0]?.blockers).toEqual(
      expect.arrayContaining(['unassigned', 'vip']),
    );
  });
});
