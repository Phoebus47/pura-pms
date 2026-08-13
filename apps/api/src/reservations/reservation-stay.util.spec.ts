import {
  addCalendarDays,
  buildRoomConflictWhere,
  calculateNights,
  calculateStayTotal,
  isSameCalendarDay,
  occupancyEnd,
  stayDatesError,
  toCalendarDate,
} from './reservation-stay.util';

describe('reservation-stay.util', () => {
  const dayUseCheckIn = new Date('2026-08-13T00:00:00.000Z');
  const sameDayCheckOut = new Date('2026-08-13T00:00:00.000Z');
  const overnightCheckOut = new Date('2026-08-15T00:00:00.000Z');

  it('formats calendar dates as YYYY-MM-DD', () => {
    expect(toCalendarDate(dayUseCheckIn)).toBe('2026-08-13');
  });

  it('detects same calendar day', () => {
    expect(isSameCalendarDay(dayUseCheckIn, sameDayCheckOut)).toBe(true);
    expect(isSameCalendarDay(dayUseCheckIn, overnightCheckOut)).toBe(false);
  });

  it('adds calendar days in UTC', () => {
    expect(addCalendarDays(dayUseCheckIn, 1).toISOString()).toBe(
      '2026-08-14T00:00:00.000Z',
    );
  });

  it('uses next calendar day as occupancy end for day-use', () => {
    expect(
      occupancyEnd(dayUseCheckIn, sameDayCheckOut, true).toISOString(),
    ).toBe('2026-08-14T00:00:00.000Z');
  });

  it('keeps checkout as occupancy end for overnight stays', () => {
    expect(
      occupancyEnd(dayUseCheckIn, overnightCheckOut, false).toISOString(),
    ).toBe('2026-08-15T00:00:00.000Z');
  });

  it('calculates 0 nights for day-use and calendar nights otherwise', () => {
    expect(calculateNights(dayUseCheckIn, sameDayCheckOut, true)).toBe(0);
    expect(calculateNights(dayUseCheckIn, overnightCheckOut, false)).toBe(2);
  });

  it('bills one room rate for day-use when total is not provided', () => {
    expect(calculateStayTotal(0, 1500, true)).toBe(1500);
    expect(calculateStayTotal(2, 1500, false)).toBe(3000);
    expect(calculateStayTotal(0, 1500, true, 900)).toBe(900);
  });

  it('returns stay date validation errors', () => {
    expect(stayDatesError(dayUseCheckIn, overnightCheckOut, true)).toContain(
      'same calendar day',
    );
    expect(stayDatesError(dayUseCheckIn, sameDayCheckOut, false)).toContain(
      'after check-in',
    );
    expect(stayDatesError(dayUseCheckIn, sameDayCheckOut, true)).toBeNull();
    expect(stayDatesError(dayUseCheckIn, overnightCheckOut, false)).toBeNull();
  });

  it('builds a conflict filter that covers overnight and day-use occupancy', () => {
    const where = buildRoomConflictWhere(
      'room-1',
      dayUseCheckIn,
      sameDayCheckOut,
      true,
      'res-1',
    );

    expect(where).toEqual(
      expect.objectContaining({
        roomId: 'room-1',
        id: { not: 'res-1' },
        OR: [
          expect.objectContaining({ isDayUse: false }),
          expect.objectContaining({ isDayUse: true }),
        ],
      }),
    );
  });
});
