import { BadRequestException } from '@nestjs/common';

export const ROOM_LOCKED_CHANGE_MESSAGE =
  'Room is locked for this VIP reservation. Unlock the room before changing assignment or moving.';
export const ROOM_LOCKED_MOVE_MESSAGE =
  'Room is locked for this VIP reservation. Unlock the room before moving.';
export const ROOM_LOCK_SPLIT_STAY_MESSAGE =
  'VIP room lock cannot be used with split stays';

export interface RoomLockFields {
  isRoomLocked?: boolean | null;
  roomLockNote?: string | null;
}

export function assertRoomLockFields(input: RoomLockFields): void {
  if (!input.isRoomLocked) {
    return;
  }
  if (!input.roomLockNote?.trim()) {
    throw new BadRequestException(
      'A room lock note is required when locking a VIP room assignment',
    );
  }
}

export function assertRoomLockCompatible(
  isRoomLocked: boolean,
  splitStayCount: number,
): void {
  if (!isRoomLocked) {
    return;
  }
  if (splitStayCount > 0) {
    throw new BadRequestException(ROOM_LOCK_SPLIT_STAY_MESSAGE);
  }
}

export function assertRoomChangeAllowed(
  isRoomLocked: boolean,
  unlocking: boolean,
  roomChanging: boolean,
): void {
  if (!isRoomLocked || unlocking || !roomChanging) {
    return;
  }
  throw new BadRequestException(ROOM_LOCKED_CHANGE_MESSAGE);
}

export function assertRoomMoveAllowedWhenLocked(isRoomLocked: boolean): void {
  if (!isRoomLocked) {
    return;
  }
  throw new BadRequestException(ROOM_LOCKED_MOVE_MESSAGE);
}

export function reservationRoomChanging(
  currentRoomId: string,
  nextRoomId?: string,
  existingStays: Array<{ roomId: string; sequence: number }> = [],
  incomingStays: Array<{ roomId: string; sequence?: number }> = [],
): boolean {
  if (nextRoomId && nextRoomId !== currentRoomId) {
    return true;
  }
  if (incomingStays.length === 0) {
    return false;
  }
  if (existingStays.length !== incomingStays.length) {
    return true;
  }
  const existingBySequence = new Map(
    existingStays.map((stay) => [stay.sequence, stay.roomId]),
  );
  return incomingStays.some((stay, index) => {
    const sequence = stay.sequence ?? index;
    const previous = existingBySequence.get(sequence);
    return previous !== undefined && previous !== stay.roomId;
  });
}
