import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservationStatus, RoomStatus } from '@pura/database';
import {
  assertRoomMoveAllowed,
  occupancyWindowForMove,
  occupiedStatusForVacant,
} from './room-move';

describe('room-move helpers', () => {
  const header = {
    status: ReservationStatus.CHECKED_IN,
    roomId: 'room-1',
    checkIn: new Date('2026-08-14T00:00:00.000Z'),
    checkOut: new Date('2026-08-18T00:00:00.000Z'),
    isDayUse: false,
  };

  const vacant = {
    id: 'room-2',
    propertyId: 'prop-1',
    status: RoomStatus.VACANT_CLEAN,
    roomTypeId: 'type-1',
  };

  it('maps vacant dirty to occupied dirty', () => {
    expect(occupiedStatusForVacant(RoomStatus.VACANT_DIRTY)).toBe(
      RoomStatus.OCCUPIED_DIRTY,
    );
  });

  it('maps other vacant rooms to occupied clean', () => {
    expect(occupiedStatusForVacant(RoomStatus.VACANT_CLEAN)).toBe(
      RoomStatus.OCCUPIED_CLEAN,
    );
  });

  it('uses header dates when there are no stay segments', () => {
    expect(occupancyWindowForMove(header)).toEqual({
      startDate: header.checkIn,
      endDate: header.checkOut,
      isDayUse: false,
    });
  });

  it('uses the stay covering now', () => {
    const window = occupancyWindowForMove(
      {
        ...header,
        stays: [
          {
            id: 'stay-1',
            startDate: new Date('2026-08-14T00:00:00.000Z'),
            endDate: new Date('2026-08-16T00:00:00.000Z'),
            roomId: 'room-1',
          },
          {
            id: 'stay-2',
            startDate: new Date('2026-08-16T00:00:00.000Z'),
            endDate: new Date('2026-08-18T00:00:00.000Z'),
            roomId: 'room-9',
          },
        ],
      },
      new Date('2026-08-15T12:00:00.000Z'),
    );

    expect(window.stayId).toBe('stay-1');
    expect(window.endDate).toEqual(new Date('2026-08-16T00:00:00.000Z'));
  });

  it('falls back to the stay matching the current room', () => {
    const window = occupancyWindowForMove(
      {
        ...header,
        stays: [
          {
            id: 'stay-1',
            startDate: new Date('2026-08-14T00:00:00.000Z'),
            endDate: new Date('2026-08-16T00:00:00.000Z'),
            roomId: 'room-9',
          },
          {
            id: 'stay-2',
            startDate: new Date('2026-08-16T00:00:00.000Z'),
            endDate: new Date('2026-08-18T00:00:00.000Z'),
            roomId: 'room-1',
          },
        ],
      },
      new Date('2026-08-20T12:00:00.000Z'),
    );

    expect(window.stayId).toBe('stay-2');
  });

  it('rejects moves that are not checked in', () => {
    expect(() =>
      assertRoomMoveAllowed(
        { ...header, status: ReservationStatus.CONFIRMED },
        'prop-1',
        vacant,
        'room-2',
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects moving into the same room', () => {
    expect(() =>
      assertRoomMoveAllowed(header, 'prop-1', vacant, 'room-1'),
    ).toThrow(BadRequestException);
  });

  it('rejects moves when the room assignment is locked', () => {
    expect(() =>
      assertRoomMoveAllowed(
        { ...header, isRoomLocked: true },
        'prop-1',
        vacant,
        'room-2',
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects a missing target room', () => {
    expect(() =>
      assertRoomMoveAllowed(header, 'prop-1', null, 'room-2'),
    ).toThrow(NotFoundException);
  });

  it('rejects a room on another property', () => {
    expect(() =>
      assertRoomMoveAllowed(
        header,
        'prop-1',
        { ...vacant, propertyId: 'prop-2' },
        'room-2',
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects occupied and out-of-order rooms', () => {
    expect(() =>
      assertRoomMoveAllowed(
        header,
        'prop-1',
        { ...vacant, status: RoomStatus.OCCUPIED_CLEAN },
        'room-2',
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertRoomMoveAllowed(
        header,
        'prop-1',
        { ...vacant, status: RoomStatus.OUT_OF_ORDER },
        'room-2',
      ),
    ).toThrow(BadRequestException);
  });

  it('allows a vacant room on the same property', () => {
    expect(assertRoomMoveAllowed(header, 'prop-1', vacant, 'room-2')).toEqual(
      vacant,
    );
  });
});
