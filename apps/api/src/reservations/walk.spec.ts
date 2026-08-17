import { BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '@pura/database';
import { assertCanWalk, assertWalkAmountsValid } from './walk';

describe('assertCanWalk', () => {
  it('allows a confirmed reservation', () => {
    expect(() =>
      assertCanWalk({ status: ReservationStatus.CONFIRMED }),
    ).not.toThrow();
  });

  it.each([
    ReservationStatus.TENTATIVE,
    ReservationStatus.CHECKED_IN,
    ReservationStatus.CHECKED_OUT,
    ReservationStatus.CANCELLED,
    ReservationStatus.NO_SHOW,
    ReservationStatus.WALKED,
  ])('rejects a %s reservation', (status) => {
    expect(() => assertCanWalk({ status })).toThrow(BadRequestException);
  });
});

describe('assertWalkAmountsValid', () => {
  it('allows zero and positive amounts', () => {
    expect(() => assertWalkAmountsValid(0, 0)).not.toThrow();
    expect(() => assertWalkAmountsValid(1500, 500)).not.toThrow();
  });

  it('rejects a negative cost', () => {
    expect(() => assertWalkAmountsValid(-1, 0)).toThrow(BadRequestException);
  });

  it('rejects a negative compensation amount', () => {
    expect(() => assertWalkAmountsValid(0, -1)).toThrow(BadRequestException);
  });
});
