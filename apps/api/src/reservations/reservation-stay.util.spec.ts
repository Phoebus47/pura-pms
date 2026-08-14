import {
  addCalendarDays,
  buildRoomConflictWhere,
  buildStaySegmentConflictWhere,
  calculateNights,
  calculateSplitStayTotal,
  calculateStayTotal,
  findStayCoveringBusinessDate,
  isSameCalendarDay,
  occupancyEnd,
  resolveNightAuditRoomCharge,
  splitStayError,
  stayDatesError,
  toCalendarDate,
  type SplitStayDraft,
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
        stays: { none: {} },
        OR: [
          expect.objectContaining({ isDayUse: false }),
          expect.objectContaining({ isDayUse: true }),
        ],
      }),
    );
  });

  const checkIn = new Date('2026-08-14T00:00:00.000Z');
  const splitDate = new Date('2026-08-16T00:00:00.000Z');
  const checkOut = new Date('2026-08-18T00:00:00.000Z');
  const validStays: SplitStayDraft[] = [
    {
      startDate: checkIn,
      endDate: splitDate,
      roomId: 'room-1',
      roomTypeId: 'type-a',
      roomRate: 1000,
    },
    {
      startDate: splitDate,
      endDate: checkOut,
      roomId: 'room-2',
      roomTypeId: 'type-b',
      roomRate: 1500,
    },
  ];

  it('accepts a contiguous two-type split stay', () => {
    expect(
      splitStayError(checkIn, checkOut, false, 'room-1', validStays),
    ).toBeNull();
  });

  it('treats empty stays as header-only', () => {
    expect(splitStayError(checkIn, checkOut, false, 'room-1', [])).toBeNull();
  });

  it('rejects day-use reservations that include stays', () => {
    expect(
      splitStayError(checkIn, checkIn, true, 'room-1', validStays),
    ).toContain('Day-use');
  });

  it('rejects a single stay segment', () => {
    expect(
      splitStayError(checkIn, splitDate, false, 'room-1', [validStays[0]]),
    ).toContain('at least two stay segments');
  });

  it('rejects split stays that use one room type', () => {
    const sameType = [
      validStays[0],
      { ...validStays[1], roomTypeId: 'type-a' },
    ];
    expect(
      splitStayError(checkIn, checkOut, false, 'room-1', sameType),
    ).toContain('two different room types');
  });

  it('rejects adjacent segments in the same room', () => {
    const sameRoom = [validStays[0], { ...validStays[1], roomId: 'room-1' }];
    expect(
      splitStayError(checkIn, checkOut, false, 'room-1', sameRoom),
    ).toContain('different rooms');
  });

  it('rejects a gap between stay segments', () => {
    const gapped = [
      validStays[0],
      {
        ...validStays[1],
        startDate: new Date('2026-08-17T00:00:00.000Z'),
      },
    ];
    expect(
      splitStayError(checkIn, checkOut, false, 'room-1', gapped),
    ).toContain('contiguous');
  });

  it('rejects a first segment that does not match header room or check-in', () => {
    expect(
      splitStayError(checkIn, checkOut, false, 'room-9', validStays),
    ).toContain('First stay segment room');
    expect(
      splitStayError(
        new Date('2026-08-13T00:00:00.000Z'),
        checkOut,
        false,
        'room-1',
        validStays,
      ),
    ).toContain('check-in date');
  });

  it('rejects a last segment that does not match check-out', () => {
    expect(
      splitStayError(
        checkIn,
        new Date('2026-08-19T00:00:00.000Z'),
        false,
        'room-1',
        validStays,
      ),
    ).toContain('check-out date');
  });

  it('rejects a segment that does not end after it starts', () => {
    const inverted = [{ ...validStays[0], endDate: checkIn }, validStays[1]];
    expect(
      splitStayError(checkIn, checkOut, false, 'room-1', inverted),
    ).toContain('end after it starts');
  });

  it('sums split stay totals from segment nights and rates', () => {
    expect(calculateSplitStayTotal(validStays)).toBe(5000);
  });

  it('builds a stay-segment conflict filter', () => {
    expect(
      buildStaySegmentConflictWhere('room-2', splitDate, checkOut, 'res-1'),
    ).toEqual(
      expect.objectContaining({
        roomId: 'room-2',
        reservationId: { not: 'res-1' },
        startDate: { lt: checkOut },
        endDate: { gt: splitDate },
      }),
    );
  });

  it('finds the stay covering a business date and skips checkout day', () => {
    expect(findStayCoveringBusinessDate(validStays, splitDate)?.roomId).toBe(
      'room-2',
    );
    expect(findStayCoveringBusinessDate(validStays, checkOut)).toBeNull();
    expect(findStayCoveringBusinessDate([], checkIn)).toBeNull();
  });

  it('resolves night audit room charges from the covering stay', () => {
    expect(resolveNightAuditRoomCharge(1000, validStays, checkIn)).toBe(1000);
    expect(resolveNightAuditRoomCharge(1000, validStays, splitDate)).toBe(1500);
    expect(resolveNightAuditRoomCharge(1000, validStays, checkOut)).toBeNull();
    expect(resolveNightAuditRoomCharge(1000, [], checkIn)).toBe(1000);
  });
});
