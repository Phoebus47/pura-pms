import { NotFoundException } from '@nestjs/common';
import { BLOCK_INACTIVE_STATUSES, type BlockStatus } from './block-rules';

export interface BlockRow {
  id: string;
  propertyId: string;
  roomTypeId: string;
  startDate: Date;
  endDate: Date;
  cutoffDate: Date;
  allottedRooms: number;
  releasedRooms: number;
  status: BlockStatus;
}

export interface ReservationRow {
  id: string;
  status: string;
  checkIn: Date;
  checkOut: Date;
  isDayUse: boolean;
  blockId: string | null;
  roomId: string;
  room: { propertyId: string; roomTypeId: string };
}

export interface BlockStore {
  property: {
    findUnique: (
      args: Record<string, unknown>,
    ) => Promise<{ id: string; businessDate: Date } | null>;
  };
  roomType: {
    findUnique: (
      args: Record<string, unknown>,
    ) => Promise<{ id: string; propertyId: string } | null>;
  };
  roomBlock: {
    create: (args: Record<string, unknown>) => Promise<unknown>;
    findMany: (args: Record<string, unknown>) => Promise<BlockRow[]>;
    findUnique: (args: Record<string, unknown>) => Promise<BlockRow | null>;
    findFirst: (args: Record<string, unknown>) => Promise<BlockRow | null>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
  };
  reservation: {
    findUnique: (
      args: Record<string, unknown>,
    ) => Promise<ReservationRow | null>;
    findMany: (args: Record<string, unknown>) => Promise<ReservationRow[]>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
  };
}

export const BLOCK_INCLUDE = {
  roomType: { select: { id: true, name: true, code: true } },
  _count: {
    select: {
      reservations: {
        where: { status: { notIn: [...BLOCK_INACTIVE_STATUSES] } },
      },
    },
  },
};

export function blockStore(prisma: unknown): BlockStore {
  return prisma as BlockStore;
}

export async function requireProperty(prisma: unknown, propertyId: string) {
  const property = await blockStore(prisma).property.findUnique({
    where: { id: propertyId },
  });
  if (!property) {
    throw new NotFoundException(`Property with ID ${propertyId} not found`);
  }
  return property;
}

export async function loadPickupReservations(prisma: unknown, blockId: string) {
  return blockStore(prisma).reservation.findMany({
    where: { blockId },
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
}
