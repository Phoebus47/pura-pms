import { BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '@pura/database';
import { addCalendarDays, toCalendarDate } from './reservation-stay.util';

export const NO_SHOW_TRX_CODE = '1006';

export interface NoShowReservationLike {
  status: ReservationStatus;
  checkIn: Date;
  roomRate: unknown;
}

export function noShowChargeAmount(roomRate: unknown): number {
  return Number(roomRate);
}

export function noShowArrivalCutoff(asOf: Date): Date {
  return addCalendarDays(new Date(`${toCalendarDate(asOf)}T00:00:00.000Z`), 1);
}

export function assertCanMarkNoShow(
  reservation: NoShowReservationLike,
  asOf: Date,
): void {
  if (reservation.status !== ReservationStatus.CONFIRMED) {
    throw new BadRequestException(
      'Only confirmed reservations can be marked no-show',
    );
  }

  if (toCalendarDate(reservation.checkIn) > toCalendarDate(asOf)) {
    throw new BadRequestException(
      'Cannot mark no-show before the arrival date',
    );
  }

  if (noShowChargeAmount(reservation.roomRate) < 0) {
    throw new BadRequestException('No-show charge cannot be negative');
  }
}
