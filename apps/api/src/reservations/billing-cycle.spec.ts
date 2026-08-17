import { BillingCycle } from '@pura/database';
import {
  calculateExtendedStayTotal,
  countBillingCycles,
  cycleLengthDays,
  daysSinceCheckIn,
  isBillingCycleEnd,
  isExtendedBillingCycle,
  MONTHLY_CYCLE_DAYS,
  WEEKLY_CYCLE_DAYS,
} from './billing-cycle';

describe('billing-cycle helpers', () => {
  const checkIn = new Date('2026-08-01T00:00:00.000Z');

  it('counts weekly billing cycles', () => {
    expect(countBillingCycles(10, BillingCycle.WEEKLY)).toBe(2);
    expect(calculateExtendedStayTotal(10, 5000, BillingCycle.WEEKLY)).toBe(
      10000,
    );
  });

  it('counts monthly billing cycles', () => {
    expect(countBillingCycles(45, BillingCycle.MONTHLY)).toBe(2);
    expect(calculateExtendedStayTotal(45, 12000, BillingCycle.MONTHLY)).toBe(
      24000,
    );
  });

  it('detects weekly cycle end dates', () => {
    expect(
      isBillingCycleEnd(
        checkIn,
        new Date('2026-08-08T00:00:00.000Z'),
        BillingCycle.WEEKLY,
      ),
    ).toBe(true);
    expect(
      isBillingCycleEnd(
        checkIn,
        new Date('2026-08-07T00:00:00.000Z'),
        BillingCycle.WEEKLY,
      ),
    ).toBe(false);
  });

  it('detects monthly cycle end dates', () => {
    expect(
      isBillingCycleEnd(
        checkIn,
        new Date('2026-08-31T00:00:00.000Z'),
        BillingCycle.MONTHLY,
      ),
    ).toBe(true);
  });

  it('treats nightly stays as posting every night', () => {
    expect(
      isBillingCycleEnd(
        checkIn,
        new Date('2026-08-02T00:00:00.000Z'),
        BillingCycle.NIGHTLY,
      ),
    ).toBe(true);
  });

  it('computes days since check-in', () => {
    expect(
      daysSinceCheckIn(checkIn, new Date('2026-08-08T00:00:00.000Z')),
    ).toBe(7);
  });

  it('flags extended billing cycles', () => {
    expect(isExtendedBillingCycle(BillingCycle.WEEKLY)).toBe(true);
    expect(isExtendedBillingCycle(BillingCycle.NIGHTLY)).toBe(false);
  });

  it('returns cycle lengths', () => {
    expect(cycleLengthDays(BillingCycle.WEEKLY)).toBe(WEEKLY_CYCLE_DAYS);
    expect(cycleLengthDays(BillingCycle.MONTHLY)).toBe(MONTHLY_CYCLE_DAYS);
  });
});
