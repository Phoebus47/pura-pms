import { toCalendarDate } from '../reservations/reservation-stay.util';

export const BLOCK_INACTIVE_STATUSES = [
  'CANCELLED',
  'NO_SHOW',
  'WALKED',
  'TENTATIVE',
] as const;

export const BLOCK_KINDS = ['ALLOTMENT', 'GROUP'] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

export const BLOCK_INVENTORY_MODES = ['GENERAL', 'DEDICATED'] as const;
export type BlockInventoryMode = (typeof BLOCK_INVENTORY_MODES)[number];

export const BLOCK_STATUSES = ['OPEN', 'RELEASED', 'CLOSED'] as const;
export type BlockStatus = (typeof BLOCK_STATUSES)[number];

export const BLOCK_OVER_ALLOTMENT_MESSAGE =
  'No remaining rooms on this allotment or block';
export const BLOCK_RELEASED_MESSAGE =
  'Only an open block can be released or receive pickup';
export const BLOCK_DATE_MESSAGE = 'Block end date must be after the start date';
export const BLOCK_CUTOFF_MESSAGE =
  'Cutoff date must be on or before the block end date';

export function remainingRooms(
  allottedRooms: number,
  releasedRooms: number,
  pickupCount: number,
): number {
  return Math.max(0, allottedRooms - releasedRooms - pickupCount);
}

export function isPickupReservation(status: string): boolean {
  return !(BLOCK_INACTIVE_STATUSES as readonly string[]).includes(status);
}

export function pickupCount(reservations: { status: string }[]): number {
  return reservations.filter((row) => isPickupReservation(row.status)).length;
}

export function isPastCutoff(cutoffDate: Date, businessDate: Date): boolean {
  return toCalendarDate(cutoffDate) <= toCalendarDate(businessDate);
}

export function datesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return (
    toCalendarDate(startA) < toCalendarDate(endB) &&
    toCalendarDate(startB) < toCalendarDate(endA)
  );
}

export function assertBlockDates(
  startDate: string,
  endDate: string,
  cutoffDate: string,
): string | null {
  if (startDate >= endDate) {
    return BLOCK_DATE_MESSAGE;
  }
  if (cutoffDate > endDate) {
    return BLOCK_CUTOFF_MESSAGE;
  }
  return null;
}
