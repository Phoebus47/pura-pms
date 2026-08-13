import type { Prisma, ReservationStatus } from '@pura/database';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const INACTIVE_STATUSES: ReservationStatus[] = ['CANCELLED', 'NO_SHOW'];

export function toCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isSameCalendarDay(left: Date, right: Date): boolean {
  return toCalendarDate(left) === toCalendarDate(right);
}

export function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function occupancyEnd(
  checkIn: Date,
  checkOut: Date,
  isDayUse: boolean,
): Date {
  if (isDayUse && isSameCalendarDay(checkIn, checkOut)) {
    return addCalendarDays(checkIn, 1);
  }
  return checkOut;
}

export function calculateNights(
  checkIn: Date,
  checkOut: Date,
  isDayUse: boolean,
): number {
  if (isDayUse) {
    return 0;
  }
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY);
}

export function calculateStayTotal(
  nights: number,
  roomRate: number,
  isDayUse: boolean,
  providedTotal?: number,
): number {
  if (providedTotal !== undefined) {
    return providedTotal;
  }
  if (isDayUse) {
    return roomRate;
  }
  return nights * roomRate;
}

export function stayDatesError(
  checkIn: Date,
  checkOut: Date,
  isDayUse: boolean,
): string | null {
  if (isDayUse) {
    return isSameCalendarDay(checkIn, checkOut)
      ? null
      : 'Day-use reservations must check in and out on the same calendar day';
  }
  return checkIn >= checkOut
    ? 'Check-out date must be after check-in date'
    : null;
}

export function buildRoomConflictWhere(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  isDayUse: boolean,
  excludeId?: string,
): Prisma.ReservationWhereInput {
  const occupancyEndDate = occupancyEnd(checkIn, checkOut, isDayUse);

  const where: Prisma.ReservationWhereInput = {
    roomId,
    status: { notIn: INACTIVE_STATUSES },
    OR: [
      {
        isDayUse: false,
        checkIn: { lt: occupancyEndDate },
        checkOut: { gt: checkIn },
      },
      {
        isDayUse: true,
        checkIn: { gte: checkIn, lt: occupancyEndDate },
      },
    ],
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  return where;
}
