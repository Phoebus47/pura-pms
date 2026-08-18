import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { occupiesDate } from '../financial/reports-flash';
import {
  occupancyEnd,
  toCalendarDate,
} from '../reservations/reservation-stay.util';
import { findBlock } from './block-ops';
import {
  BLOCK_INCLUDE,
  blockStore,
  loadPickupReservations,
  type BlockRow,
  type ReservationRow,
} from './block-db';
import {
  BLOCK_OVER_ALLOTMENT_MESSAGE,
  BLOCK_RELEASED_MESSAGE,
  datesOverlap,
  isPickupReservation,
  pickupCount,
  remainingRooms,
} from './block-rules';

export interface PickupNight {
  stayDate: string;
  allotted: number;
  pickedUp: number;
  remaining: number;
}

export function summarizePickup(
  block: Pick<
    BlockRow,
    'startDate' | 'endDate' | 'allottedRooms' | 'releasedRooms' | 'status'
  >,
  reservations: ReservationRow[],
): PickupNight[] {
  const nights: PickupNight[] = [];
  let cursor = new Date(`${toCalendarDate(block.startDate)}T00:00:00.000Z`);
  const end = new Date(`${toCalendarDate(block.endDate)}T00:00:00.000Z`);
  const active = reservations.filter((row) => isPickupReservation(row.status));
  while (cursor < end) {
    const pickedUp = active.filter((row) => occupiesDate(row, cursor)).length;
    const remaining =
      block.status === 'OPEN'
        ? remainingRooms(block.allottedRooms, block.releasedRooms, pickedUp)
        : 0;
    nights.push({
      stayDate: toCalendarDate(cursor),
      allotted: block.allottedRooms,
      pickedUp,
      remaining,
    });
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return nights;
}

export async function getPickupReport(prisma: unknown, id: string) {
  const block = await findBlock(prisma, id);
  const reservations = await loadPickupReservations(prisma, id);
  const nights = summarizePickup(block, reservations);
  const pickedUp = pickupCount(reservations);
  return {
    blockId: block.id,
    allottedRooms: block.allottedRooms,
    releasedRooms: block.releasedRooms,
    pickedUp,
    remaining: remainingRooms(
      block.allottedRooms,
      block.releasedRooms,
      pickedUp,
    ),
    nights,
  };
}

export async function attachReservation(
  prisma: unknown,
  blockId: string,
  reservationId: string,
) {
  const block = await findBlock(prisma, blockId);
  if (block.status !== 'OPEN') {
    throw new BadRequestException(BLOCK_RELEASED_MESSAGE);
  }
  const reservation = await blockStore(prisma).reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      status: true,
      checkIn: true,
      checkOut: true,
      isDayUse: true,
      blockId: true,
      roomId: true,
      room: { select: { propertyId: true, roomTypeId: true } },
    },
  });
  if (!reservation) {
    throw new NotFoundException(
      `Reservation with ID ${reservationId} not found`,
    );
  }
  if (reservation.blockId && reservation.blockId !== blockId) {
    throw new ConflictException(
      'Reservation is already attached to another block',
    );
  }
  if (reservation.room.propertyId !== block.propertyId) {
    throw new BadRequestException(
      'Reservation does not belong to this property',
    );
  }
  if (reservation.room.roomTypeId !== block.roomTypeId) {
    throw new BadRequestException(
      'Reservation room type does not match this block',
    );
  }
  const stayEnd = occupancyEnd(
    reservation.checkIn,
    reservation.checkOut,
    reservation.isDayUse,
  );
  if (
    !datesOverlap(reservation.checkIn, stayEnd, block.startDate, block.endDate)
  ) {
    throw new BadRequestException(
      'Reservation stay does not overlap the block dates',
    );
  }
  const reservations = await loadPickupReservations(prisma, blockId);
  const remaining = remainingRooms(
    block.allottedRooms,
    block.releasedRooms,
    pickupCount(reservations.filter((row) => row.id !== reservationId)),
  );
  if (remaining < 1 && reservation.blockId !== blockId) {
    throw new ConflictException(BLOCK_OVER_ALLOTMENT_MESSAGE);
  }
  await blockStore(prisma).reservation.update({
    where: { id: reservationId },
    data: { blockId },
  });
  return getPickupReport(prisma, blockId);
}

export async function detachReservation(
  prisma: unknown,
  blockId: string,
  reservationId: string,
) {
  await findBlock(prisma, blockId);
  const reservation = await blockStore(prisma).reservation.findUnique({
    where: { id: reservationId },
    select: { id: true, blockId: true },
  });
  if (!reservation || reservation.blockId !== blockId) {
    throw new NotFoundException(
      `Reservation with ID ${reservationId} is not on this block`,
    );
  }
  await blockStore(prisma).reservation.update({
    where: { id: reservationId },
    data: { blockId: null },
  });
  return getPickupReport(prisma, blockId);
}

export async function releaseBlock(prisma: unknown, id: string) {
  const block = await findBlock(prisma, id);
  if (block.status !== 'OPEN') {
    throw new BadRequestException(BLOCK_RELEASED_MESSAGE);
  }
  const reservations = await loadPickupReservations(prisma, id);
  const unused = remainingRooms(
    block.allottedRooms,
    block.releasedRooms,
    pickupCount(reservations),
  );
  return blockStore(prisma).roomBlock.update({
    where: { id },
    data: {
      releasedRooms: block.releasedRooms + unused,
      status: 'RELEASED',
    },
    include: BLOCK_INCLUDE,
  });
}
