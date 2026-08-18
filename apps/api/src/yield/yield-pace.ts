import {
  addCalendarDays,
  occupancyEnd,
  toCalendarDate,
} from '../reservations/reservation-stay.util';

export const PACE_BEHIND_PP = 10;
export const YIELD_HORIZON_DAYS = 14;
export const LAST_YEAR_OFFSET_DAYS = 364;

const INACTIVE_STATUSES = new Set([
  'CANCELLED',
  'NO_SHOW',
  'WALKED',
  'TENTATIVE',
]);

export interface OccupancyStay {
  roomId: string;
  roomTypeId: string;
  status: string;
  checkIn: Date;
  checkOut: Date;
  isDayUse: boolean;
}

export interface SellableRoom {
  id: string;
  roomTypeId: string;
  status: string;
}

export interface PaceDay {
  stayDate: string;
  lastYearDate: string;
  capacity: number;
  occupied: number;
  occupancyPct: number;
  lastYearOccupied: number;
  lastYearOccupancyPct: number;
  paceDeltaPct: number;
  alert: boolean;
}

export function occupancyPct(occupied: number, capacity: number): number {
  if (capacity <= 0) {
    return 0;
  }
  return Math.round((occupied / capacity) * 10000) / 100;
}

export function lastYearComparable(date: Date): Date {
  return addCalendarDays(date, -LAST_YEAR_OFFSET_DAYS);
}

export function addHorizon(start: Date, extraDays: number): Date {
  return addCalendarDays(
    new Date(`${toCalendarDate(start)}T00:00:00.000Z`),
    extraDays,
  );
}

export function eachCalendarDay(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  let cursor = new Date(toCalendarDate(from) + 'T00:00:00.000Z');
  const end = new Date(toCalendarDate(to) + 'T00:00:00.000Z');
  while (cursor.getTime() <= end.getTime()) {
    days.push(new Date(cursor));
    cursor = addCalendarDays(cursor, 1);
  }
  return days;
}

export function isSellable(room: SellableRoom): boolean {
  return room.status !== 'OUT_OF_ORDER';
}

export function sellableCapacity(
  rooms: readonly SellableRoom[],
  roomTypeId?: string,
): number {
  return rooms.filter(
    (room) =>
      isSellable(room) && (!roomTypeId || room.roomTypeId === roomTypeId),
  ).length;
}

export function occupiesStayDate(stay: OccupancyStay, day: Date): boolean {
  if (INACTIVE_STATUSES.has(stay.status)) {
    return false;
  }
  const dayKey = toCalendarDate(day);
  const end = occupancyEnd(stay.checkIn, stay.checkOut, stay.isDayUse);
  return toCalendarDate(stay.checkIn) <= dayKey && dayKey < toCalendarDate(end);
}

export function occupiedRoomCount(
  stays: readonly OccupancyStay[],
  day: Date,
  roomTypeId?: string,
): number {
  const occupying = stays.filter(
    (stay) =>
      occupiesStayDate(stay, day) &&
      (!roomTypeId || stay.roomTypeId === roomTypeId),
  );
  return new Set(occupying.map((stay) => stay.roomId)).size;
}

export function buildPaceDays(
  rooms: readonly SellableRoom[],
  stays: readonly OccupancyStay[],
  from: Date,
  to: Date,
): PaceDay[] {
  const capacity = sellableCapacity(rooms);
  return eachCalendarDay(from, to).map((day) => {
    const lastYear = lastYearComparable(day);
    const occupied = occupiedRoomCount(stays, day);
    const lastYearOccupied = occupiedRoomCount(stays, lastYear);
    const currentPct = occupancyPct(occupied, capacity);
    const lastYearPct = occupancyPct(lastYearOccupied, capacity);
    const paceDeltaPct = Math.round((currentPct - lastYearPct) * 100) / 100;
    return {
      stayDate: toCalendarDate(day),
      lastYearDate: toCalendarDate(lastYear),
      capacity,
      occupied,
      occupancyPct: currentPct,
      lastYearOccupied,
      lastYearOccupancyPct: lastYearPct,
      paceDeltaPct,
      alert: paceDeltaPct <= -PACE_BEHIND_PP,
    };
  });
}
