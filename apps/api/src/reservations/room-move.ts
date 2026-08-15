import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservationStatus, RoomStatus } from '@pura/database';

export const BLOCKED_MOVE_STATUSES: ReadonlySet<RoomStatus> = new Set([
  RoomStatus.OUT_OF_ORDER,
  RoomStatus.OUT_OF_SERVICE,
  RoomStatus.OCCUPIED_CLEAN,
  RoomStatus.OCCUPIED_DIRTY,
]);

export interface MoveOccupancyWindow {
  startDate: Date;
  endDate: Date;
  isDayUse: boolean;
  stayId?: string;
}

export interface StayLike {
  id: string;
  startDate: Date;
  endDate: Date;
  roomId: string;
}

export interface ReservationLike {
  status: ReservationStatus;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  isDayUse: boolean;
  stays?: StayLike[];
}

export interface TargetRoomLike {
  id: string;
  propertyId: string;
  status: RoomStatus;
  roomTypeId: string;
}

export function occupiedStatusForVacant(status: RoomStatus): RoomStatus {
  return status === RoomStatus.VACANT_DIRTY
    ? RoomStatus.OCCUPIED_DIRTY
    : RoomStatus.OCCUPIED_CLEAN;
}

export function occupancyWindowForMove(
  reservation: ReservationLike,
  now = new Date(),
): MoveOccupancyWindow {
  const stays = reservation.stays ?? [];
  if (stays.length === 0) {
    return {
      startDate: reservation.checkIn,
      endDate: reservation.checkOut,
      isDayUse: reservation.isDayUse,
    };
  }

  const covering = stays.find(
    (stay) => stay.startDate <= now && now < stay.endDate,
  );
  const matchingRoom = stays.find((stay) => stay.roomId === reservation.roomId);
  const current = covering ?? matchingRoom ?? stays[0];

  return {
    startDate: current.startDate,
    endDate: current.endDate,
    isDayUse: false,
    stayId: current.id,
  };
}

export function assertRoomMoveAllowed(
  reservation: ReservationLike,
  fromPropertyId: string,
  toRoom: TargetRoomLike | null,
  toRoomId: string,
): TargetRoomLike {
  if (reservation.status !== ReservationStatus.CHECKED_IN) {
    throw new BadRequestException(
      'Only checked-in reservations can be moved to another room',
    );
  }

  if (toRoomId === reservation.roomId) {
    throw new BadRequestException(
      'Target room must be different from the current room',
    );
  }

  if (!toRoom) {
    throw new NotFoundException(`Room with ID ${toRoomId} not found`);
  }

  if (toRoom.propertyId !== fromPropertyId) {
    throw new BadRequestException(
      'Target room must belong to the same property',
    );
  }

  if (BLOCKED_MOVE_STATUSES.has(toRoom.status)) {
    throw new BadRequestException(
      'Target room is not vacant and cannot receive a mid-stay move',
    );
  }

  return toRoom;
}
