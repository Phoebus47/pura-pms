import { BadRequestException } from '@nestjs/common';
import { ReservationStatus, StayPurpose } from '@pura/database';
import {
  assertCanChangeStayPurpose,
  assertStayPurposeFields,
  COMP_RATE_CODE,
  defaultRateCodeForPurpose,
  HOUSE_RATE_CODE,
  isNonRevenueStay,
  zeroNonRevenueAmount,
} from './stay-purpose';

describe('isNonRevenueStay', () => {
  it('is false for standard stays', () => {
    expect(isNonRevenueStay(StayPurpose.STANDARD)).toBe(false);
    expect(isNonRevenueStay(undefined)).toBe(false);
  });

  it('is true for complimentary and house-use stays', () => {
    expect(isNonRevenueStay(StayPurpose.COMPLIMENTARY)).toBe(true);
    expect(isNonRevenueStay(StayPurpose.HOUSE_USE)).toBe(true);
  });
});

describe('defaultRateCodeForPurpose', () => {
  it('keeps an explicit rate code', () => {
    expect(
      defaultRateCodeForPurpose(StayPurpose.COMPLIMENTARY, 'VIP-COMP'),
    ).toBe('VIP-COMP');
  });

  it('defaults complimentary and house-use codes', () => {
    expect(defaultRateCodeForPurpose(StayPurpose.COMPLIMENTARY)).toBe(
      COMP_RATE_CODE,
    );
    expect(defaultRateCodeForPurpose(StayPurpose.HOUSE_USE)).toBe(
      HOUSE_RATE_CODE,
    );
    expect(defaultRateCodeForPurpose(StayPurpose.STANDARD)).toBeUndefined();
  });
});

describe('assertStayPurposeFields', () => {
  it('allows a standard stay without authority', () => {
    expect(() =>
      assertStayPurposeFields({ stayPurpose: StayPurpose.STANDARD }),
    ).not.toThrow();
  });

  it('requires authority for complimentary stays', () => {
    expect(() =>
      assertStayPurposeFields({ stayPurpose: StayPurpose.COMPLIMENTARY }),
    ).toThrow(BadRequestException);
  });

  it('requires authority and department for house-use stays', () => {
    expect(() =>
      assertStayPurposeFields({
        stayPurpose: StayPurpose.HOUSE_USE,
        approvedBy: 'GM',
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      assertStayPurposeFields({
        stayPurpose: StayPurpose.HOUSE_USE,
        approvedBy: 'GM',
        department: 'Sales',
      }),
    ).not.toThrow();
  });
});

describe('assertCanChangeStayPurpose', () => {
  it('allows no-op updates after check-in', () => {
    expect(() =>
      assertCanChangeStayPurpose(
        ReservationStatus.CHECKED_IN,
        StayPurpose.COMPLIMENTARY,
        StayPurpose.COMPLIMENTARY,
      ),
    ).not.toThrow();
  });

  it('allows a change on confirmed reservations', () => {
    expect(() =>
      assertCanChangeStayPurpose(
        ReservationStatus.CONFIRMED,
        StayPurpose.STANDARD,
        StayPurpose.COMPLIMENTARY,
      ),
    ).not.toThrow();
  });

  it('rejects a change after check-in', () => {
    expect(() =>
      assertCanChangeStayPurpose(
        ReservationStatus.CHECKED_IN,
        StayPurpose.STANDARD,
        StayPurpose.HOUSE_USE,
      ),
    ).toThrow(BadRequestException);
  });
});

describe('zeroNonRevenueAmount', () => {
  it('zeros complimentary amounts and keeps standard rates', () => {
    expect(zeroNonRevenueAmount(StayPurpose.COMPLIMENTARY, 3500)).toBe(0);
    expect(zeroNonRevenueAmount(StayPurpose.STANDARD, 3500)).toBe(3500);
  });
});
