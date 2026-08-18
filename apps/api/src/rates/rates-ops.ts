import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  RATE_DERIVE_AMOUNT_LOCKED_MESSAGE,
  RATE_DERIVE_CYCLE_MESSAGE,
  assertDerivationFields,
  createsDerivationCycle,
  derivedAmount,
  type RateDeriveMode as DeriveMode,
} from './rate-derive';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const RATE_INCLUDE = {
  roomType: { select: { id: true, name: true, code: true } },
  _count: { select: { childRates: true } },
};

export interface RateRow {
  id: string;
  amount: unknown;
  propertyId: string;
  parentRateId: string | null;
  deriveMode: DeriveMode | null;
  deriveValue: unknown;
}

export interface CreateRateInput {
  code: string;
  name: string;
  roomTypeId: string;
  propertyId: string;
  amount?: number;
  startDate: string;
  endDate: string;
  daysOfWeek?: number[];
  isActive?: boolean;
  parentRateId?: string;
  deriveMode?: DeriveMode;
  deriveValue?: number;
}

export interface UpdateRateInput {
  code?: string;
  name?: string;
  roomTypeId?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  daysOfWeek?: number[];
  isActive?: boolean;
  parentRateId?: string | null;
  deriveMode?: DeriveMode;
  deriveValue?: number;
}

interface RateStore {
  create: (args: Record<string, unknown>) => Promise<RateRow>;
  findMany: (args: Record<string, unknown>) => Promise<RateRow[]>;
  findUnique: (args: Record<string, unknown>) => Promise<RateRow | null>;
  update: (args: Record<string, unknown>) => Promise<RateRow>;
}

function db(prisma: unknown) {
  return prisma as {
    property: {
      findUnique: (
        args: Record<string, unknown>,
      ) => Promise<{ id: string } | null>;
    };
    roomType: {
      findUnique: (
        args: Record<string, unknown>,
      ) => Promise<{ id: string; propertyId: string } | null>;
    };
    rate: RateStore;
  };
}

function store(prisma: unknown): RateStore {
  return db(prisma).rate;
}

async function assertPropertyAndRoomType(
  prisma: unknown,
  propertyId: string,
  roomTypeId: string,
) {
  const property = await db(prisma).property.findUnique({
    where: { id: propertyId },
  });
  if (!property) {
    throw new NotFoundException(`Property with ID ${propertyId} not found`);
  }
  const roomType = await db(prisma).roomType.findUnique({
    where: { id: roomTypeId },
  });
  if (!roomType || roomType.propertyId !== propertyId) {
    throw new NotFoundException(
      `Room type with ID ${roomTypeId} not found for this property`,
    );
  }
}

async function loadParent(
  prisma: unknown,
  parentRateId: string,
  propertyId: string,
) {
  const parent = await store(prisma).findUnique({
    where: { id: parentRateId },
  });
  if (!parent || parent.propertyId !== propertyId) {
    throw new NotFoundException(
      `Parent rate with ID ${parentRateId} not found`,
    );
  }
  return parent;
}

async function assertNoCycle(
  prisma: unknown,
  rateId: string,
  parentRateId: string,
  propertyId: string,
) {
  const ancestors: string[] = [];
  let currentId: string | null = parentRateId;
  while (currentId) {
    ancestors.push(currentId);
    if (createsDerivationCycle(rateId, ancestors)) {
      throw new BadRequestException(RATE_DERIVE_CYCLE_MESSAGE);
    }
    const current = await store(prisma).findUnique({
      where: { id: currentId },
      select: { parentRateId: true, propertyId: true },
    });
    if (!current || current.propertyId !== propertyId) {
      throw new NotFoundException(`Parent rate with ID ${currentId} not found`);
    }
    currentId = current.parentRateId;
  }
}

async function cascadeChildren(
  prisma: unknown,
  parentId: string,
  parentAmount: number,
) {
  const children = await store(prisma).findMany({
    where: { parentRateId: parentId },
    select: { id: true, deriveMode: true, deriveValue: true },
  });
  for (const child of children) {
    if (!child.deriveMode || child.deriveValue === null) {
      continue;
    }
    const amount = derivedAmount(
      parentAmount,
      child.deriveMode,
      Number(child.deriveValue),
    );
    await store(prisma).update({
      where: { id: child.id },
      data: { amount },
    });
    await cascadeChildren(prisma, child.id, amount);
  }
}

export async function createRate(prisma: unknown, dto: CreateRateInput) {
  await assertPropertyAndRoomType(prisma, dto.propertyId, dto.roomTypeId);
  assertDerivationFields({
    parentRateId: dto.parentRateId,
    deriveMode: dto.deriveMode,
    deriveValue: dto.deriveValue,
  });
  const parent = dto.parentRateId
    ? await loadParent(prisma, dto.parentRateId, dto.propertyId)
    : null;
  const amount = parent
    ? derivedAmount(
        Number(parent.amount),
        dto.deriveMode as DeriveMode,
        dto.deriveValue as number,
      )
    : (dto.amount as number);
  return store(prisma).create({
    data: {
      code: dto.code,
      name: dto.name,
      roomTypeId: dto.roomTypeId,
      propertyId: dto.propertyId,
      amount,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      daysOfWeek: dto.daysOfWeek ?? ALL_DAYS,
      isActive: dto.isActive ?? true,
      parentRateId: dto.parentRateId,
      deriveMode: dto.deriveMode,
      deriveValue: dto.deriveValue,
    },
    include: RATE_INCLUDE,
  });
}

export async function findRates(
  prisma: unknown,
  propertyId?: string,
  roomTypeId?: string,
) {
  return store(prisma).findMany({
    where: {
      ...(propertyId ? { propertyId } : {}),
      ...(roomTypeId ? { roomTypeId } : {}),
    },
    include: RATE_INCLUDE,
    orderBy: [{ code: 'asc' }],
  });
}

export async function findRate(prisma: unknown, id: string) {
  const rate = await store(prisma).findUnique({
    where: { id },
    include: RATE_INCLUDE,
  });
  if (!rate) {
    throw new NotFoundException(`Rate with ID ${id} not found`);
  }
  return rate;
}

export async function updateRate(
  prisma: unknown,
  id: string,
  dto: UpdateRateInput,
) {
  const existing = await findRate(prisma, id);
  const nextParentId =
    dto.parentRateId === undefined
      ? existing.parentRateId
      : dto.parentRateId || null;
  const nextMode =
    dto.deriveMode === undefined ? existing.deriveMode : dto.deriveMode;
  const nextValue =
    dto.deriveValue === undefined
      ? existing.deriveValue === null
        ? null
        : Number(existing.deriveValue)
      : dto.deriveValue;

  assertDerivationFields({
    parentRateId: nextParentId,
    deriveMode: nextMode,
    deriveValue: nextValue,
  });

  if (nextParentId && dto.amount !== undefined) {
    throw new BadRequestException(RATE_DERIVE_AMOUNT_LOCKED_MESSAGE);
  }

  if (nextParentId) {
    await assertNoCycle(prisma, id, nextParentId, existing.propertyId);
  }

  const parent = nextParentId
    ? await loadParent(prisma, nextParentId, existing.propertyId)
    : null;
  const amount = parent
    ? derivedAmount(
        Number(parent.amount),
        nextMode as DeriveMode,
        nextValue as number,
      )
    : (dto.amount ?? Number(existing.amount));

  const updated = await store(prisma).update({
    where: { id },
    data: {
      code: dto.code,
      name: dto.name,
      roomTypeId: dto.roomTypeId,
      amount,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      daysOfWeek: dto.daysOfWeek,
      isActive: dto.isActive,
      parentRateId: dto.parentRateId === undefined ? undefined : nextParentId,
      deriveMode: nextParentId ? nextMode : null,
      deriveValue: nextParentId ? nextValue : null,
    },
    include: RATE_INCLUDE,
  });
  await cascadeChildren(prisma, updated.id, Number(updated.amount));
  return findRate(prisma, updated.id);
}
