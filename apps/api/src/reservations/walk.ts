import { BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '@pura/database';

export interface WalkReservationLike {
  status: ReservationStatus;
}

/**
 * Overbooking recovery happens before arrival, when the property has no
 * room for a guest with a CONFIRMED reservation. A guest already
 * CHECKED_IN has a room; use Room Move instead of Walk.
 */
export function assertCanWalk(reservation: WalkReservationLike): void {
  if (reservation.status !== ReservationStatus.CONFIRMED) {
    throw new BadRequestException(
      'Only confirmed reservations can be walked to another hotel',
    );
  }
}

export function assertWalkAmountsValid(
  cost: number,
  compensationAmount: number,
): void {
  if (cost < 0) {
    throw new BadRequestException('Walk cost cannot be negative');
  }
  if (compensationAmount < 0) {
    throw new BadRequestException('Compensation amount cannot be negative');
  }
}
