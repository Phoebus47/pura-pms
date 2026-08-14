import {
  occupancyEnd,
  toCalendarDate,
} from '../reservations/reservation-stay.util';

export interface FlashReservation {
  id: string;
  status: string;
  checkIn: Date;
  checkOut: Date;
  isDayUse: boolean;
  roomId: string;
}

export function occupiesDate(
  reservation: FlashReservation,
  day: Date,
): boolean {
  const dayKey = toCalendarDate(day);
  const end = occupancyEnd(
    reservation.checkIn,
    reservation.checkOut,
    reservation.isDayUse,
  );
  return (
    toCalendarDate(reservation.checkIn) <= dayKey &&
    dayKey < toCalendarDate(end)
  );
}

export function isArrival(reservation: FlashReservation, day: Date): boolean {
  return toCalendarDate(reservation.checkIn) === toCalendarDate(day);
}

export function isDeparture(reservation: FlashReservation, day: Date): boolean {
  if (reservation.isDayUse) {
    return isArrival(reservation, day);
  }
  return toCalendarDate(reservation.checkOut) === toCalendarDate(day);
}

export function summarizeFlash(
  reservations: readonly FlashReservation[],
  day: Date,
  totalRooms: number,
  roomRevenue: number,
  totalRevenue: number,
) {
  const occupying = reservations.filter((row) => occupiesDate(row, day));
  const occupiedRooms = new Set(occupying.map((row) => row.roomId)).size;
  const arrivals = reservations.filter((row) => isArrival(row, day)).length;
  const departures = reservations.filter((row) => isDeparture(row, day)).length;
  const stayOvers = occupying.filter((row) => !isArrival(row, day)).length;
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 10000) / 100 : 0;

  return {
    occupancy: {
      totalRooms,
      occupiedRooms,
      occupancyRate,
    },
    arrivals,
    departures,
    stayOvers,
    roomRevenue,
    totalRevenue,
  };
}
