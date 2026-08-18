import { describe, expect, it } from 'vitest';
import {
  pickCoveringRate,
  recommendAmount,
  roundMoney,
  type CoveringRate,
} from './yield-recommend';

function rate(overrides: Partial<CoveringRate> = {}): CoveringRate {
  return {
    id: 'rate-bar',
    roomTypeId: 'rt1',
    amount: 1000,
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-12-31T00:00:00.000Z'),
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    parentRateId: null,
    ...overrides,
  };
}

describe('recommendAmount', () => {
  it('raises the rate when occupancy is high', () => {
    expect(
      recommendAmount({
        currentAmount: 1000,
        occupancyPct: 90,
        lastYearOccupancyPct: 80,
        competitorAmount: null,
        isDerived: false,
      }),
    ).toEqual({ amount: 1100, reason: 'HIGH_DEMAND' });
  });

  it('matches a cheaper competitor when occupancy is soft', () => {
    expect(
      recommendAmount({
        currentAmount: 1000,
        occupancyPct: 50,
        lastYearOccupancyPct: 50,
        competitorAmount: 900,
        isDerived: false,
      }),
    ).toEqual({ amount: 900, reason: 'COMP_UNDERCUT' });
  });

  it('lowers the rate when pace is behind and occupancy is low', () => {
    expect(
      recommendAmount({
        currentAmount: 1000,
        occupancyPct: 30,
        lastYearOccupancyPct: 50,
        competitorAmount: null,
        isDerived: false,
      }),
    ).toEqual({ amount: 900, reason: 'SLOW_PACE' });
  });

  it('skips derived rates and zero-amount plans', () => {
    expect(
      recommendAmount({
        currentAmount: 1000,
        occupancyPct: 90,
        lastYearOccupancyPct: 80,
        competitorAmount: null,
        isDerived: true,
      }),
    ).toBeNull();
    expect(
      recommendAmount({
        currentAmount: 0,
        occupancyPct: 90,
        lastYearOccupancyPct: 80,
        competitorAmount: null,
        isDerived: false,
      }),
    ).toBeNull();
  });
});

describe('pickCoveringRate', () => {
  it('picks the first standalone rate that covers the stay date', () => {
    const day = new Date('2026-08-18T00:00:00.000Z');
    expect(
      pickCoveringRate(
        [
          rate({ id: 'child', parentRateId: 'rate-bar' }),
          rate({ id: 'weekend', daysOfWeek: [5, 6] }),
          rate({ id: 'bar' }),
        ],
        'rt1',
        day,
      )?.id,
    ).toBe('bar');
  });

  it('rounds money to two decimals', () => {
    expect(roundMoney(10.005)).toBe(10.01);
  });
});
