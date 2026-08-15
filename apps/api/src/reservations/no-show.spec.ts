import { BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '@pura/database';
import {
  assertCanMarkNoShow,
  noShowArrivalCutoff,
  noShowChargeAmount,
} from './no-show';

describe('no-show helpers', () => {
  const confirmed = {
    status: ReservationStatus.CONFIRMED,
    checkIn: new Date('2026-08-14T00:00:00.000Z'),
    roomRate: 1500,
  };

  it('allows a confirmed arrival on or before the as-of date', () => {
    expect(() =>
      assertCanMarkNoShow(confirmed, new Date('2026-08-14T00:00:00.000Z')),
    ).not.toThrow();
    expect(() =>
      assertCanMarkNoShow(confirmed, new Date('2026-08-15T00:00:00.000Z')),
    ).not.toThrow();
  });

  it('rejects a future arrival', () => {
    expect(() =>
      assertCanMarkNoShow(confirmed, new Date('2026-08-13T00:00:00.000Z')),
    ).toThrow(BadRequestException);
  });

  it('rejects statuses other than confirmed', () => {
    expect(() =>
      assertCanMarkNoShow(
        { ...confirmed, status: ReservationStatus.CHECKED_IN },
        new Date('2026-08-14T00:00:00.000Z'),
      ),
    ).toThrow(BadRequestException);
  });

  it('uses the header room rate as the charge', () => {
    expect(noShowChargeAmount(1500)).toBe(1500);
  });

  it('uses the next UTC calendar day as the arrival cutoff', () => {
    expect(
      noShowArrivalCutoff(new Date('2026-03-15T17:00:00.000Z')).toISOString(),
    ).toBe('2026-03-16T00:00:00.000Z');
  });
});
