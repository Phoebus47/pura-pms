import { BillingCycle } from '@pura/database';
import { toCalendarDate } from '../reservations/reservation-stay.util';

export const WEEKLY_CYCLE_DAYS = 7;
export const MONTHLY_CYCLE_DAYS = 30;

export function daysSinceCheckIn(checkIn: Date, businessDate: Date): number {
  const start = toCalendarDate(checkIn);
  const end = toCalendarDate(businessDate);
  const startMs = new Date(`${start}T00:00:00.000Z`).getTime();
  const endMs = new Date(`${end}T00:00:00.000Z`).getTime();
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
}

export function isExtendedBillingCycle(
  cycle: BillingCycle | null | undefined,
): boolean {
  return cycle === BillingCycle.WEEKLY || cycle === BillingCycle.MONTHLY;
}

export function cycleLengthDays(cycle: BillingCycle): number {
  if (cycle === BillingCycle.WEEKLY) {
    return WEEKLY_CYCLE_DAYS;
  }
  if (cycle === BillingCycle.MONTHLY) {
    return MONTHLY_CYCLE_DAYS;
  }
  return 1;
}

export function isBillingCycleEnd(
  checkIn: Date,
  businessDate: Date,
  cycle: BillingCycle,
): boolean {
  if (cycle === BillingCycle.NIGHTLY) {
    return true;
  }
  const days = daysSinceCheckIn(checkIn, businessDate);
  if (days <= 0) {
    return false;
  }
  const length = cycleLengthDays(cycle);
  return days % length === 0;
}

export function countBillingCycles(
  nights: number,
  cycle: BillingCycle,
  isDayUse = false,
): number {
  if (isDayUse) {
    return 1;
  }
  if (nights <= 0) {
    return 0;
  }
  if (cycle === BillingCycle.NIGHTLY) {
    return nights;
  }
  const length = cycleLengthDays(cycle);
  return Math.ceil(nights / length);
}

export function calculateExtendedStayTotal(
  nights: number,
  cycleRate: number,
  cycle: BillingCycle,
  isDayUse = false,
): number {
  return countBillingCycles(nights, cycle, isDayUse) * cycleRate;
}
