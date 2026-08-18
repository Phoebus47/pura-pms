import { HK_CHECKLIST } from './hk-rules';
import type { HkStage } from './hk-rules';

export interface HkRoomRow {
  id: string;
  number: string;
  floor: number | null;
  status: string;
  hkStage: HkStage;
  propertyId: string;
  roomType: { id: string; name: string; code: string };
  inspections: Array<{
    id: string;
    result: string;
    inspectedBy: string;
    createdAt: Date;
  }>;
}

export interface HkStore {
  property: {
    findUnique: (
      args: Record<string, unknown>,
    ) => Promise<{ id: string; businessDate: Date } | null>;
  };
  room: {
    findUnique: (args: Record<string, unknown>) => Promise<HkRoomRow | null>;
    findMany: (args: Record<string, unknown>) => Promise<HkRoomRow[]>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
  };
  housekeepingInspection: {
    create: (args: Record<string, unknown>) => Promise<unknown>;
    findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
  };
}

export const HK_ROOM_INCLUDE = {
  roomType: { select: { id: true, name: true, code: true } },
  inspections: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: {
      id: true,
      result: true,
      inspectedBy: true,
      createdAt: true,
    },
  },
};

export function hkStore(prisma: unknown): HkStore {
  return prisma as HkStore;
}

export function checklistPayload() {
  return HK_CHECKLIST.map((item) => ({
    code: item.code,
    required: item.required,
  }));
}
