export type BillingCycle = 'NIGHTLY' | 'WEEKLY' | 'MONTHLY';

const WEEKLY_CYCLE_DAYS = 7;
const MONTHLY_CYCLE_DAYS = 30;

export function isExtendedBillingCycle(
  cycle: BillingCycle | null | undefined,
): boolean {
  return cycle === 'WEEKLY' || cycle === 'MONTHLY';
}

export function cycleLengthDays(cycle: BillingCycle): number {
  if (cycle === 'WEEKLY') {
    return WEEKLY_CYCLE_DAYS;
  }
  if (cycle === 'MONTHLY') {
    return MONTHLY_CYCLE_DAYS;
  }
  return 1;
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
  if (cycle === 'NIGHTLY') {
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
