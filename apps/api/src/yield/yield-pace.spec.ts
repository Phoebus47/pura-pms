import { describe, expect, it } from 'vitest';
import {
  PACE_BEHIND_PP,
  addHorizon,
  buildPaceDays,
  lastYearComparable,
  occupiedRoomCount,
  occupancyPct,
  occupiesStayDate,
  sellableCapacity,
  type OccupancyStay,
  type SellableRoom,
} from './yield-pace';

const rooms: SellableRoom[] = [
  { id: 'r1', roomTypeId: 'rt1', status: 'VACANT_CLEAN' },
  { id: 'r2', roomTypeId: 'rt1', status: 'OCCUPIED_CLEAN' },
  { id: 'r3', roomTypeId: 'rt1', status: 'OUT_OF_ORDER' },
  { id: 'r4', roomTypeId: 'rt2', status: 'VACANT_CLEAN' },
];

function stay(overrides: Partial<OccupancyStay> = {}): OccupancyStay {
  return {
    roomId: 'r2',
    roomTypeId: 'rt1',
    status: 'CONFIRMED',
    checkIn: new Date('2026-08-18T00:00:00.000Z'),
    checkOut: new Date('2026-08-20T00:00:00.000Z'),
    isDayUse: false,
    ...overrides,
  };
}

describe('yield-pace', () => {
  it('excludes out-of-order rooms from sellable capacity', () => {
    expect(sellableCapacity(rooms)).toBe(3);
    expect(sellableCapacity(rooms, 'rt1')).toBe(2);
  });

  it('counts unique occupied rooms on a stay date', () => {
    const day = new Date('2026-08-18T00:00:00.000Z');
    expect(occupiedRoomCount([stay(), stay({ roomId: 'r1' })], day)).toBe(2);
    expect(occupiedRoomCount([stay({ status: 'CANCELLED' })], day)).toBe(0);
    expect(occupiesStayDate(stay(), new Date('2026-08-20T00:00:00.000Z'))).toBe(
      false,
    );
  });

  it('builds pace days with a last-year comparable weekday', () => {
    const from = new Date('2026-08-18T00:00:00.000Z');
    const lastYearStay = stay({
      checkIn: lastYearComparable(from),
      checkOut: addHorizon(lastYearComparable(from), 1),
      roomId: 'r4',
      roomTypeId: 'rt2',
    });
    const days = buildPaceDays(rooms, [stay(), lastYearStay], from, from);
    expect(days).toHaveLength(1);
    expect(days[0].stayDate).toBe('2026-08-18');
    expect(days[0].lastYearDate).toBe('2025-08-19');
    expect(days[0].occupied).toBe(1);
    expect(days[0].lastYearOccupied).toBe(1);
    expect(days[0].capacity).toBe(3);
    expect(days[0].occupancyPct).toBe(occupancyPct(1, 3));
  });

  it('flags pace that is behind last year', () => {
    const from = new Date('2026-08-18T00:00:00.000Z');
    const lastYear = lastYearComparable(from);
    const lastYearStays: OccupancyStay[] = rooms
      .filter((room) => room.status !== 'OUT_OF_ORDER')
      .map((room) =>
        stay({
          roomId: room.id,
          roomTypeId: room.roomTypeId,
          checkIn: lastYear,
          checkOut: addHorizon(lastYear, 1),
        }),
      );
    const days = buildPaceDays(rooms, lastYearStays, from, from);
    expect(days[0].alert).toBe(true);
    expect(days[0].paceDeltaPct).toBeLessThanOrEqual(-PACE_BEHIND_PP);
  });
});
