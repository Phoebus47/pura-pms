import { NotFoundException } from '@nestjs/common';
import type { OccupancyStay, SellableRoom } from './yield-pace';
import type { CoveringRate } from './yield-recommend';

export interface YieldStore {
  property: {
    findUnique: (args: Record<string, unknown>) => Promise<{
      id: string;
      businessDate: Date;
    } | null>;
  };
  room: {
    findMany: (args: Record<string, unknown>) => Promise<SellableRoom[]>;
  };
  roomType: {
    findUnique: (
      args: Record<string, unknown>,
    ) => Promise<{ id: string; propertyId: string } | null>;
  };
  reservation: {
    findMany: (args: Record<string, unknown>) => Promise<
      Array<{
        roomId: string;
        status: string;
        checkIn: Date;
        checkOut: Date;
        isDayUse: boolean;
        room: { roomTypeId: string } | null;
      }>
    >;
  };
  rate: {
    findMany: (args: Record<string, unknown>) => Promise<CoveringRate[]>;
  };
  competitorRate: {
    create: (args: Record<string, unknown>) => Promise<unknown>;
    findMany: (args: Record<string, unknown>) => Promise<
      Array<{
        id: string;
        roomTypeId: string | null;
        stayDate: Date;
        amount: unknown;
      }>
    >;
    findUnique: (args: Record<string, unknown>) => Promise<{
      id: string;
      propertyId: string;
    } | null>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
  };
  yieldRecommendation: {
    create: (args: Record<string, unknown>) => Promise<unknown>;
    findMany: (args: Record<string, unknown>) => Promise<
      Array<{
        id: string;
        rateId: string;
        stayDate: Date;
        status: string;
      }>
    >;
    findUnique: (args: Record<string, unknown>) => Promise<{
      id: string;
      propertyId: string;
      rateId: string;
      recommendedAmount: unknown;
      status: string;
    } | null>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
  };
}

export function yieldStore(prisma: unknown): YieldStore {
  return prisma as YieldStore;
}

export async function requireProperty(prisma: unknown, propertyId: string) {
  const property = await yieldStore(prisma).property.findUnique({
    where: { id: propertyId },
  });
  if (!property) {
    throw new NotFoundException(`Property with ID ${propertyId} not found`);
  }
  return property;
}

export function toStays(
  rows: Awaited<ReturnType<YieldStore['reservation']['findMany']>>,
): OccupancyStay[] {
  return rows.flatMap((row) => {
    if (!row.room) {
      return [];
    }
    return [
      {
        roomId: row.roomId,
        roomTypeId: row.room.roomTypeId,
        status: row.status,
        checkIn: new Date(row.checkIn),
        checkOut: new Date(row.checkOut),
        isDayUse: row.isDayUse,
      },
    ];
  });
}
