import { BadRequestException, NotFoundException } from '@nestjs/common';
import { checklistPayload, HK_ROOM_INCLUDE, hkStore } from './hk-db';
import {
  HK_CHECKLIST_MESSAGE,
  HK_CLOSED_MESSAGE,
  HK_NOT_CLEAN_MESSAGE,
  HK_NOT_DIRTY_MESSAGE,
  hasFullChecklist,
  inspectionPassed,
  isClosedRoomStatus,
  toCleanRoomStatus,
  toDirtyRoomStatus,
} from './hk-rules';

export interface InspectionLineInput {
  itemCode: string;
  passed: boolean;
  notes?: string;
}

export interface CreateInspectionInput {
  inspectedBy: string;
  notes?: string;
  lines: InspectionLineInput[];
}

async function requireRoom(prisma: unknown, id: string) {
  const room = await hkStore(prisma).room.findUnique({
    where: { id },
    include: HK_ROOM_INCLUDE,
  });
  if (!room) {
    throw new NotFoundException(`Room with ID ${id} not found`);
  }
  return room;
}

export async function getBoard(prisma: unknown, propertyId?: string) {
  return hkStore(prisma).room.findMany({
    where: propertyId ? { propertyId } : {},
    include: HK_ROOM_INCLUDE,
    orderBy: [{ number: 'asc' }],
  });
}

export function getChecklist() {
  return checklistPayload();
}

export async function markRoomClean(prisma: unknown, id: string) {
  const room = await requireRoom(prisma, id);
  if (isClosedRoomStatus(room.status)) {
    throw new BadRequestException(HK_CLOSED_MESSAGE);
  }
  if (room.hkStage === 'CLEAN') {
    return room;
  }
  if (room.hkStage !== 'DIRTY') {
    throw new BadRequestException(HK_NOT_DIRTY_MESSAGE);
  }
  return hkStore(prisma).room.update({
    where: { id },
    data: {
      status: toCleanRoomStatus(room.status),
      hkStage: 'CLEAN',
    },
    include: HK_ROOM_INCLUDE,
  });
}

export async function listInspections(prisma: unknown, roomId: string) {
  await requireRoom(prisma, roomId);
  return hkStore(prisma).housekeepingInspection.findMany({
    where: { roomId },
    include: { lines: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createInspection(
  prisma: unknown,
  roomId: string,
  dto: CreateInspectionInput,
) {
  const room = await requireRoom(prisma, roomId);
  if (isClosedRoomStatus(room.status)) {
    throw new BadRequestException(HK_CLOSED_MESSAGE);
  }
  if (room.hkStage !== 'CLEAN') {
    throw new BadRequestException(HK_NOT_CLEAN_MESSAGE);
  }
  if (!hasFullChecklist(dto.lines)) {
    throw new BadRequestException(HK_CHECKLIST_MESSAGE);
  }
  const property = await hkStore(prisma).property.findUnique({
    where: { id: room.propertyId },
  });
  if (!property) {
    throw new NotFoundException(
      `Property with ID ${room.propertyId} not found`,
    );
  }
  const passed = inspectionPassed(dto.lines);
  const inspection = await hkStore(prisma).housekeepingInspection.create({
    data: {
      propertyId: room.propertyId,
      roomId,
      businessDate: property.businessDate,
      result: passed ? 'PASSED' : 'FAILED',
      inspectedBy: dto.inspectedBy,
      notes: dto.notes,
      lines: {
        create: dto.lines.map((line) => ({
          itemCode: line.itemCode,
          passed: line.passed,
          notes: line.notes,
        })),
      },
    },
    include: { lines: true },
  });
  await hkStore(prisma).room.update({
    where: { id: roomId },
    data: passed
      ? { hkStage: 'READY' }
      : {
          hkStage: 'DIRTY',
          status: toDirtyRoomStatus(room.status),
        },
    include: HK_ROOM_INCLUDE,
  });
  return inspection;
}
