import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { toCalendarDate } from '../reservations/reservation-stay.util';
import {
  BLOCK_INCLUDE,
  blockStore,
  loadPickupReservations,
  requireProperty,
  type BlockRow,
} from './block-db';
import {
  assertBlockDates,
  isPastCutoff,
  pickupCount,
  remainingRooms,
  type BlockInventoryMode,
  type BlockKind,
  type BlockStatus,
} from './block-rules';

export interface CreateBlockInput {
  propertyId: string;
  roomTypeId: string;
  code: string;
  name: string;
  kind: BlockKind;
  inventoryMode?: BlockInventoryMode;
  channel?: string;
  startDate: string;
  endDate: string;
  cutoffDate: string;
  allottedRooms: number;
  notes?: string;
}

export interface UpdateBlockInput {
  name?: string;
  channel?: string;
  cutoffDate?: string;
  allottedRooms?: number;
  notes?: string | null;
  status?: BlockStatus;
}

async function autoReleaseIfDue(prisma: unknown, block: BlockRow) {
  if (block.status !== 'OPEN') {
    return block;
  }
  const property = await requireProperty(prisma, block.propertyId);
  if (!isPastCutoff(block.cutoffDate, property.businessDate)) {
    return block;
  }
  const reservations = await loadPickupReservations(prisma, block.id);
  const unused = remainingRooms(
    block.allottedRooms,
    block.releasedRooms,
    pickupCount(reservations),
  );
  return (await blockStore(prisma).roomBlock.update({
    where: { id: block.id },
    data: {
      releasedRooms: block.releasedRooms + unused,
      status: 'RELEASED',
    },
    include: BLOCK_INCLUDE,
  })) as BlockRow;
}

export async function createBlock(prisma: unknown, dto: CreateBlockInput) {
  await requireProperty(prisma, dto.propertyId);
  const roomType = await blockStore(prisma).roomType.findUnique({
    where: { id: dto.roomTypeId },
  });
  if (!roomType || roomType.propertyId !== dto.propertyId) {
    throw new NotFoundException(
      `Room type with ID ${dto.roomTypeId} not found for this property`,
    );
  }
  const dateError = assertBlockDates(
    dto.startDate,
    dto.endDate,
    dto.cutoffDate,
  );
  if (dateError) {
    throw new BadRequestException(dateError);
  }
  const existing = await blockStore(prisma).roomBlock.findFirst({
    where: { propertyId: dto.propertyId, code: dto.code },
  });
  if (existing) {
    throw new ConflictException(
      `Block with code ${dto.code} already exists for this property`,
    );
  }
  return blockStore(prisma).roomBlock.create({
    data: {
      propertyId: dto.propertyId,
      roomTypeId: dto.roomTypeId,
      code: dto.code,
      name: dto.name,
      kind: dto.kind,
      inventoryMode: dto.inventoryMode ?? 'GENERAL',
      channel: dto.channel,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      cutoffDate: new Date(dto.cutoffDate),
      allottedRooms: dto.allottedRooms,
      notes: dto.notes,
    },
    include: BLOCK_INCLUDE,
  });
}

export async function findBlocks(prisma: unknown, propertyId?: string) {
  const rows = await blockStore(prisma).roomBlock.findMany({
    where: propertyId ? { propertyId } : {},
    include: BLOCK_INCLUDE,
    orderBy: [{ startDate: 'asc' }, { code: 'asc' }],
  });
  return Promise.all(rows.map((row) => autoReleaseIfDue(prisma, row)));
}

export async function findBlock(prisma: unknown, id: string) {
  const block = await blockStore(prisma).roomBlock.findUnique({
    where: { id },
    include: BLOCK_INCLUDE,
  });
  if (!block) {
    throw new NotFoundException(`Block with ID ${id} not found`);
  }
  return autoReleaseIfDue(prisma, block);
}

export async function updateBlock(
  prisma: unknown,
  id: string,
  dto: UpdateBlockInput,
) {
  const existing = await findBlock(prisma, id);
  if (dto.cutoffDate) {
    const dateError = assertBlockDates(
      toCalendarDate(existing.startDate),
      toCalendarDate(existing.endDate),
      dto.cutoffDate,
    );
    if (dateError) {
      throw new BadRequestException(dateError);
    }
  }
  return blockStore(prisma).roomBlock.update({
    where: { id },
    data: {
      name: dto.name,
      channel: dto.channel,
      cutoffDate: dto.cutoffDate ? new Date(dto.cutoffDate) : undefined,
      allottedRooms: dto.allottedRooms,
      notes: dto.notes === undefined ? undefined : dto.notes,
      status: dto.status,
    },
    include: BLOCK_INCLUDE,
  });
}
