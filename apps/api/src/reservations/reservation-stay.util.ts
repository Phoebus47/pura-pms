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
    stays: { none: {} },
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

export interface SplitStayDraft {
  startDate: Date;
  endDate: Date;
  roomId: string;
  roomTypeId: string;
  roomRate: number;
  rateCode?: string;
}

export function splitStayError(
  checkIn: Date,
  checkOut: Date,
  isDayUse: boolean,
  headerRoomId: string,
  stays: SplitStayDraft[],
): string | null {
  if (stays.length === 0) {
    return null;
  }

  if (isDayUse) {
    return 'Day-use reservations cannot include split stays';
  }

  if (stays.length < 2) {
    return 'Split stay requires at least two stay segments';
  }

  const roomTypeIds = new Set(stays.map((stay) => stay.roomTypeId));
  if (roomTypeIds.size < 2) {
    return 'Split stay requires at least two different room types';
  }

  if (stays[0].roomId !== headerRoomId) {
    return 'First stay segment room must match the reservation room';
  }

  if (stays[0].startDate.getTime() !== checkIn.getTime()) {
    return 'First stay segment must start on the reservation check-in date';
  }

  if (stays[stays.length - 1].endDate.getTime() !== checkOut.getTime()) {
    return 'Last stay segment must end on the reservation check-out date';
  }

  for (let index = 0; index < stays.length; index += 1) {
    const stay = stays[index];
    if (stay.startDate >= stay.endDate) {
      return 'Each stay segment must end after it starts';
    }

    if (index === 0) {
      continue;
    }

    const previous = stays[index - 1];
    if (previous.endDate.getTime() !== stay.startDate.getTime()) {
      return 'Stay segments must be contiguous with no gaps or overlaps';
    }

    if (previous.roomId === stay.roomId) {
      return 'Adjacent stay segments must use different rooms';
    }
  }

  return null;
}

export function calculateSplitStayTotal(stays: SplitStayDraft[]): number {
  return stays.reduce((sum, stay) => {
    const nights = calculateNights(stay.startDate, stay.endDate, false);
    return sum + nights * stay.roomRate;
  }, 0);
}

export function buildStaySegmentConflictWhere(
  roomId: string,
  startDate: Date,
  endDate: Date,
  excludeReservationId?: string,
): Prisma.ReservationStayWhereInput {
  const where: Prisma.ReservationStayWhereInput = {
    roomId,
    startDate: { lt: endDate },
    endDate: { gt: startDate },
    reservation: {
      status: { notIn: INACTIVE_STATUSES },
    },
  };

  if (excludeReservationId) {
    where.reservationId = { not: excludeReservationId };
  }

  return where;
}

export function findStayCoveringBusinessDate<
  T extends { startDate: Date | string; endDate: Date | string },
>(stays: T[], businessDate: Date): T | null {
  const businessTime = businessDate.getTime();
  return (
    stays.find((stay) => {
      const start = new Date(stay.startDate).getTime();
      const end = new Date(stay.endDate).getTime();
      return start <= businessTime && businessTime < end;
    }) ?? null
  );
}

export function resolveNightAuditRoomCharge(
  headerRate: number,
  stays: Array<{
    startDate: Date | string;
    endDate: Date | string;
    roomRate: unknown;
  }>,
  businessDate: Date,
): number | null {
  if (stays.length === 0) {
    return headerRate;
  }

  const covering = findStayCoveringBusinessDate(stays, businessDate);
  if (!covering) {
    return null;
  }

  return Number(covering.roomRate);
}
