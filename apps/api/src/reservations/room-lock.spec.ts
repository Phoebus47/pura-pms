import { BadRequestException } from '@nestjs/common';
import {
  assertRoomChangeAllowed,
  assertRoomLockCompatible,
  assertRoomLockFields,
  assertRoomMoveAllowedWhenLocked,
  reservationRoomChanging,
  ROOM_LOCKED_MOVE_MESSAGE,
} from './room-lock';

describe('room-lock', () => {
  it('requires a note when locking a room', () => {
    expect(() => assertRoomLockFields({ isRoomLocked: true })).toThrow(
      BadRequestException,
    );
    expect(() =>
      assertRoomLockFields({ isRoomLocked: true, roomLockNote: 'VIP arrival' }),
    ).not.toThrow();
  });

  it('blocks split stays with a room lock', () => {
    expect(() => assertRoomLockCompatible(true, 2)).toThrow(
      BadRequestException,
    );
  });

  it('blocks room changes while locked', () => {
    expect(() => assertRoomChangeAllowed(true, false, true)).toThrow(
      BadRequestException,
    );
    expect(() => assertRoomChangeAllowed(true, true, true)).not.toThrow();
  });

  it('blocks room moves while locked', () => {
    expect(() => assertRoomMoveAllowedWhenLocked(true)).toThrow(
      ROOM_LOCKED_MOVE_MESSAGE,
    );
  });

  it('detects stay segment room changes', () => {
    expect(
      reservationRoomChanging(
        'room-1',
        undefined,
        [{ sequence: 0, roomId: 'room-1' }],
        [{ sequence: 0, roomId: 'room-2' }],
      ),
    ).toBe(true);
  });
});
