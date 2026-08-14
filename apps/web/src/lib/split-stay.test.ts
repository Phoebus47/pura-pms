import {
  buildSplitStayPayload,
  calendarNights,
  expandCalendarOccupancy,
  isSplitStay,
} from './split-stay';

describe('split-stay helpers', () => {
  it('detects split stays from two or more segments', () => {
    expect(isSplitStay({ stays: [] })).toBe(false);
    expect(isSplitStay({ stays: [{}, {}] })).toBe(true);
  });

  it('calculates calendar nights', () => {
    expect(calendarNights('2026-08-14', '2026-08-16')).toBe(2);
  });

  it('builds a two-segment create payload', () => {
    expect(
      buildSplitStayPayload({
        checkIn: '2026-08-14',
        splitDate: '2026-08-16',
        checkOut: '2026-08-18',
        firstRoomId: 'room-1',
        secondRoomId: 'room-2',
        firstRate: 1000,
        secondRate: 1500,
      }),
    ).toEqual([
      {
        startDate: '2026-08-14',
        endDate: '2026-08-16',
        roomId: 'room-1',
        roomRate: 1000,
      },
      {
        startDate: '2026-08-16',
        endDate: '2026-08-18',
        roomId: 'room-2',
        roomRate: 1500,
      },
    ]);
  });

  it('expands calendar occupancy per stay segment', () => {
    const items = expandCalendarOccupancy([
      {
        id: 'res-1',
        checkIn: '2026-08-14',
        checkOut: '2026-08-18',
        status: 'CONFIRMED',
        guest: { firstName: 'Ada', lastName: 'Lovelace' },
        room: { number: '101' },
        stays: [
          {
            sequence: 0,
            startDate: '2026-08-14',
            endDate: '2026-08-16',
            room: { number: '101' },
          },
          {
            sequence: 1,
            startDate: '2026-08-16',
            endDate: '2026-08-18',
            room: { number: '201' },
          },
        ],
      },
    ]);

    expect(items).toHaveLength(2);
    expect(items[1]).toEqual(
      expect.objectContaining({
        key: 'res-1-1',
        checkIn: '2026-08-16',
        roomNumber: '201',
        isSplitStay: true,
      }),
    );
  });
});
