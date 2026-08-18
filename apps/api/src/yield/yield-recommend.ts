import { PACE_BEHIND_PP } from './yield-pace';

export const HIGH_OCCUPANCY_PCT = 85;
export const LOW_OCCUPANCY_PCT = 40;
export const COMP_GAP_PCT = 8;
export const RAISE_PCT = 10;
export const LOWER_PCT = 10;
export const MATCH_OCCUPANCY_MAX_PCT = 70;

export const YIELD_RECOMMEND_REASONS = [
  'HIGH_DEMAND',
  'SLOW_PACE',
  'COMP_UNDERCUT',
] as const;

export type YieldRecommendReason = (typeof YIELD_RECOMMEND_REASONS)[number];

export interface RecommendInput {
  currentAmount: number;
  occupancyPct: number;
  lastYearOccupancyPct: number | null;
  competitorAmount: number | null;
  isDerived: boolean;
}

export interface RecommendResult {
  amount: number;
  reason: YieldRecommendReason;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isMeaningfulChange(current: number, next: number): boolean {
  return Math.abs(next - current) >= 0.01;
}

export function recommendAmount(input: RecommendInput): RecommendResult | null {
  if (input.isDerived || input.currentAmount <= 0) {
    return null;
  }

  if (input.occupancyPct >= HIGH_OCCUPANCY_PCT) {
    const amount = roundMoney(input.currentAmount * (1 + RAISE_PCT / 100));
    return isMeaningfulChange(input.currentAmount, amount)
      ? { amount, reason: 'HIGH_DEMAND' }
      : null;
  }

  const competitor = input.competitorAmount;
  if (
    competitor != null &&
    competitor > 0 &&
    input.occupancyPct < MATCH_OCCUPANCY_MAX_PCT
  ) {
    const gapPct =
      ((input.currentAmount - competitor) / input.currentAmount) * 100;
    if (gapPct >= COMP_GAP_PCT) {
      const amount = roundMoney(competitor);
      return isMeaningfulChange(input.currentAmount, amount)
        ? { amount, reason: 'COMP_UNDERCUT' }
        : null;
    }
  }

  if (input.lastYearOccupancyPct == null) {
    return null;
  }
  const paceDelta = input.occupancyPct - input.lastYearOccupancyPct;
  if (input.occupancyPct <= LOW_OCCUPANCY_PCT && paceDelta <= -PACE_BEHIND_PP) {
    const amount = roundMoney(input.currentAmount * (1 - LOWER_PCT / 100));
    if (amount <= 0) {
      return null;
    }
    return isMeaningfulChange(input.currentAmount, amount)
      ? { amount, reason: 'SLOW_PACE' }
      : null;
  }

  return null;
}

export interface CoveringRate {
  id: string;
  roomTypeId: string;
  amount: unknown;
  startDate: Date;
  endDate: Date;
  daysOfWeek: number[];
  isActive: boolean;
  parentRateId: string | null;
}

export function rateCoversDate(rate: CoveringRate, day: Date): boolean {
  if (!rate.isActive || rate.parentRateId) {
    return false;
  }
  const dayKey = day.toISOString().slice(0, 10);
  const start = rate.startDate.toISOString().slice(0, 10);
  const end = rate.endDate.toISOString().slice(0, 10);
  if (dayKey < start || dayKey > end) {
    return false;
  }
  if (rate.daysOfWeek.length === 0) {
    return true;
  }
  return rate.daysOfWeek.includes(day.getUTCDay());
}

export function pickCoveringRate(
  rates: readonly CoveringRate[],
  roomTypeId: string,
  day: Date,
): CoveringRate | null {
  const matching = rates.filter(
    (rate) => rate.roomTypeId === roomTypeId && rateCoversDate(rate, day),
  );
  matching.sort((left, right) => left.id.localeCompare(right.id));
  return matching[0] ?? null;
}

export function lowestCompetitorAmount(
  amounts: readonly number[],
): number | null {
  if (amounts.length === 0) {
    return null;
  }
  return Math.min(...amounts);
}
