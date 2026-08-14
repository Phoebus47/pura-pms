import { round2 } from '../folios/folio-posting';

export type AgingBucket = 'current' | 'days30' | 'days60' | 'days90';

export interface AgingTotals {
  current: number;
  days30: number;
  days60: number;
  days90: number;
}

export function emptyAging(): AgingTotals {
  return { current: 0, days30: 0, days60: 0, days90: 0 };
}

export function toUtcDateOnly(value: Date | string): Date {
  const ymd =
    typeof value === 'string'
      ? value.slice(0, 10)
      : value.toISOString().slice(0, 10);
  return new Date(`${ymd}T00:00:00.000Z`);
}

export function daysPastDue(
  dueDate: Date | string,
  asOf: Date | string,
): number {
  const due = toUtcDateOnly(dueDate).getTime();
  const asOfDay = toUtcDateOnly(asOf).getTime();
  return Math.floor((asOfDay - due) / 86_400_000);
}

export function agingBucket(
  dueDate: Date | string,
  asOf: Date | string,
): AgingBucket {
  const days = daysPastDue(dueDate, asOf);
  if (days <= 0) return 'current';
  if (days <= 30) return 'days30';
  if (days <= 60) return 'days60';
  return 'days90';
}

export function addToAging(
  totals: AgingTotals,
  bucket: AgingBucket,
  amount: number,
): AgingTotals {
  return {
    ...totals,
    [bucket]: round2(totals[bucket] + amount),
  };
}

export function outstandingOf(amount: unknown, paidAmount: unknown): number {
  return round2(Number(amount) - Number(paidAmount));
}
