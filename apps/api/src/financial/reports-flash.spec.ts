import {
  occupiesDate,
  summarizeFlash,
  type FlashReservation,
} from './reports-flash';

describe('reports-flash', () => {
  const day = new Date('2026-08-14T00:00:00.000Z');

  const overnight: FlashReservation = {
    id: 'r1',
    status: 'CHECKED_IN',
    checkIn: new Date('2026-08-13T00:00:00.000Z'),
    checkOut: new Date('2026-08-15T00:00:00.000Z'),
    isDayUse: false,
    roomId: 'rm-1',
  };

  it('counts overnight stay-overs as occupied but not arrivals', () => {
    const summary = summarizeFlash([overnight], day, 10, 3500, 4000);
    expect(summary.occupancy.occupiedRooms).toBe(1);
    expect(summary.arrivals).toBe(0);
    expect(summary.departures).toBe(0);
    expect(summary.stayOvers).toBe(1);
    expect(summary.occupancy.occupancyRate).toBe(10);
    expect(summary.roomRevenue).toBe(3500);
  });

  it('counts same-day arrivals and day-use occupancy', () => {
    const arrival: FlashReservation = {
      ...overnight,
      id: 'r2',
      checkIn: day,
      checkOut: new Date('2026-08-16T00:00:00.000Z'),
      roomId: 'rm-2',
    };
    const dayUse: FlashReservation = {
      id: 'r3',
      status: 'CHECKED_IN',
      checkIn: day,
      checkOut: day,
      isDayUse: true,
      roomId: 'rm-3',
    };
    expect(occupiesDate(dayUse, day)).toBe(true);
    const summary = summarizeFlash([arrival, dayUse], day, 10, 0, 0);
    expect(summary.arrivals).toBe(2);
    expect(summary.departures).toBe(1);
    expect(summary.occupancy.occupiedRooms).toBe(2);
  });
});
