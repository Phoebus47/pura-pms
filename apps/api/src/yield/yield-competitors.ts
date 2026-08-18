import { NotFoundException } from '@nestjs/common';
import { requireProperty, yieldStore } from './yield-db';

export interface CompetitorRateInput {
  propertyId: string;
  competitorName: string;
  stayDate: string;
  amount: number;
  roomTypeId?: string;
  notes?: string;
}

export interface UpdateCompetitorRateInput {
  competitorName?: string;
  stayDate?: string;
  amount?: number;
  roomTypeId?: string | null;
  notes?: string | null;
}

export async function createCompetitorRate(
  prisma: unknown,
  dto: CompetitorRateInput,
) {
  await requireProperty(prisma, dto.propertyId);
  if (dto.roomTypeId) {
    const roomType = await yieldStore(prisma).roomType.findUnique({
      where: { id: dto.roomTypeId },
    });
    if (!roomType || roomType.propertyId !== dto.propertyId) {
      throw new NotFoundException(
        `Room type with ID ${dto.roomTypeId} not found for this property`,
      );
    }
  }
  return yieldStore(prisma).competitorRate.create({
    data: {
      propertyId: dto.propertyId,
      competitorName: dto.competitorName,
      roomTypeId: dto.roomTypeId,
      stayDate: new Date(dto.stayDate),
      amount: dto.amount,
      notes: dto.notes,
    },
  });
}

export async function listCompetitorRates(prisma: unknown, propertyId: string) {
  await requireProperty(prisma, propertyId);
  return yieldStore(prisma).competitorRate.findMany({
    where: { propertyId },
    include: {
      roomType: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ stayDate: 'asc' }, { competitorName: 'asc' }],
  });
}

export async function updateCompetitorRate(
  prisma: unknown,
  id: string,
  dto: UpdateCompetitorRateInput,
) {
  const existing = await yieldStore(prisma).competitorRate.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new NotFoundException(`Competitor rate with ID ${id} not found`);
  }
  if (dto.roomTypeId) {
    const roomType = await yieldStore(prisma).roomType.findUnique({
      where: { id: dto.roomTypeId },
    });
    if (!roomType || roomType.propertyId !== existing.propertyId) {
      throw new NotFoundException(
        `Room type with ID ${dto.roomTypeId} not found for this property`,
      );
    }
  }
  return yieldStore(prisma).competitorRate.update({
    where: { id },
    data: {
      competitorName: dto.competitorName,
      stayDate: dto.stayDate ? new Date(dto.stayDate) : undefined,
      amount: dto.amount,
      roomTypeId: dto.roomTypeId === undefined ? undefined : dto.roomTypeId,
      notes: dto.notes === undefined ? undefined : dto.notes,
    },
  });
}
