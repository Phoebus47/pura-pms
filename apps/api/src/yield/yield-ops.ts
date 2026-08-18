import { BadRequestException, NotFoundException } from '@nestjs/common';
import { toCalendarDate } from '../reservations/reservation-stay.util';
import { updateRate } from '../rates/rates-ops';
import { requireProperty, toStays, yieldStore } from './yield-db';
import {
  YIELD_HORIZON_DAYS,
  addHorizon,
  buildPaceDays,
  lastYearComparable,
  occupiedRoomCount,
  occupancyPct,
  sellableCapacity,
} from './yield-pace';
import {
  lowestCompetitorAmount,
  pickCoveringRate,
  recommendAmount,
} from './yield-recommend';

export {
  createCompetitorRate,
  listCompetitorRates,
  updateCompetitorRate,
} from './yield-competitors';
export type {
  CompetitorRateInput,
  UpdateCompetitorRateInput,
} from './yield-competitors';

async function loadStays(
  prisma: unknown,
  propertyId: string,
  from: Date,
  to: Date,
) {
  const lookback = lastYearComparable(from);
  const rows = await yieldStore(prisma).reservation.findMany({
    where: {
      room: { propertyId },
      checkIn: { lt: to },
      checkOut: { gt: lookback },
    },
    select: {
      roomId: true,
      status: true,
      checkIn: true,
      checkOut: true,
      isDayUse: true,
      room: { select: { roomTypeId: true } },
    },
  });
  return toStays(rows);
}

export async function getPace(
  prisma: unknown,
  propertyId: string,
  from?: string,
  to?: string,
) {
  const property = await requireProperty(prisma, propertyId);
  const start = from ? new Date(from) : new Date(property.businessDate);
  const end = to ? new Date(to) : addHorizon(start, YIELD_HORIZON_DAYS - 1);
  const rooms = await yieldStore(prisma).room.findMany({
    where: { propertyId },
    select: { id: true, roomTypeId: true, status: true },
  });
  const stays = await loadStays(prisma, propertyId, start, addHorizon(end, 1));
  return {
    from: toCalendarDate(start),
    to: toCalendarDate(end),
    days: buildPaceDays(rooms, stays, start, end),
  };
}

function competitorFor(
  rows: Array<{ roomTypeId: string | null; stayDate: Date; amount: unknown }>,
  stayDate: string,
  roomTypeId: string,
): number | null {
  const matching = rows.filter((row) => {
    const dateKey = toCalendarDate(new Date(row.stayDate));
    if (dateKey !== stayDate) {
      return false;
    }
    return row.roomTypeId == null || row.roomTypeId === roomTypeId;
  });
  return lowestCompetitorAmount(matching.map((row) => Number(row.amount)));
}

export async function generateRecommendations(
  prisma: unknown,
  propertyId: string,
) {
  const property = await requireProperty(prisma, propertyId);
  const start = new Date(property.businessDate);
  const end = addHorizon(start, YIELD_HORIZON_DAYS - 1);
  const rooms = await yieldStore(prisma).room.findMany({
    where: { propertyId },
    select: { id: true, roomTypeId: true, status: true },
  });
  const stays = await loadStays(prisma, propertyId, start, addHorizon(end, 1));
  const rates = await yieldStore(prisma).rate.findMany({
    where: { propertyId, isActive: true, parentRateId: null },
  });
  const competitors = await yieldStore(prisma).competitorRate.findMany({
    where: {
      propertyId,
      stayDate: { gte: start, lte: end },
    },
  });
  const pending = await yieldStore(prisma).yieldRecommendation.findMany({
    where: { propertyId, status: 'PENDING' },
  });
  const pendingKeys = new Set(
    pending.map(
      (row) => `${row.rateId}:${toCalendarDate(new Date(row.stayDate))}`,
    ),
  );

  const created: unknown[] = [];
  const roomTypeIds = [...new Set(rooms.map((room) => room.roomTypeId))];
  for (const day of buildPaceDays(rooms, stays, start, end)) {
    const stayDate = new Date(`${day.stayDate}T00:00:00.000Z`);
    for (const roomTypeId of roomTypeIds) {
      const rate = pickCoveringRate(rates, roomTypeId, stayDate);
      if (!rate) {
        continue;
      }
      const key = `${rate.id}:${day.stayDate}`;
      if (pendingKeys.has(key)) {
        continue;
      }
      const capacity = sellableCapacity(rooms, roomTypeId);
      const occupied = occupiedRoomCount(stays, stayDate, roomTypeId);
      const lastYearOccupied = occupiedRoomCount(
        stays,
        lastYearComparable(stayDate),
        roomTypeId,
      );
      const occ = occupancyPct(occupied, capacity);
      const lastYearOcc = occupancyPct(lastYearOccupied, capacity);
      const competitorAmount = competitorFor(
        competitors,
        day.stayDate,
        roomTypeId,
      );
      const suggestion = recommendAmount({
        currentAmount: Number(rate.amount),
        occupancyPct: occ,
        lastYearOccupancyPct: lastYearOcc,
        competitorAmount,
        isDerived: Boolean(rate.parentRateId),
      });
      if (!suggestion) {
        continue;
      }
      const row = await yieldStore(prisma).yieldRecommendation.create({
        data: {
          propertyId,
          roomTypeId,
          rateId: rate.id,
          stayDate,
          currentAmount: Number(rate.amount),
          recommendedAmount: suggestion.amount,
          occupancyPct: occ,
          paceDeltaPct: Math.round((occ - lastYearOcc) * 100) / 100,
          competitorAmount,
          reason: suggestion.reason,
        },
      });
      pendingKeys.add(key);
      created.push(row);
    }
  }
  return created;
}

export async function listRecommendations(
  prisma: unknown,
  propertyId: string,
  status?: string,
) {
  await requireProperty(prisma, propertyId);
  return yieldStore(prisma).yieldRecommendation.findMany({
    where: {
      propertyId,
      ...(status ? { status } : {}),
    },
    include: {
      rate: { select: { id: true, code: true, name: true } },
      roomType: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ stayDate: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function applyRecommendation(prisma: unknown, id: string) {
  const rec = await yieldStore(prisma).yieldRecommendation.findUnique({
    where: { id },
  });
  if (!rec) {
    throw new NotFoundException(`Recommendation with ID ${id} not found`);
  }
  if (rec.status !== 'PENDING') {
    throw new BadRequestException(
      'Only a pending recommendation can be applied',
    );
  }
  await updateRate(prisma, rec.rateId, {
    amount: Number(rec.recommendedAmount),
  });
  return yieldStore(prisma).yieldRecommendation.update({
    where: { id },
    data: { status: 'APPLIED', appliedAt: new Date() },
  });
}

export async function dismissRecommendation(prisma: unknown, id: string) {
  const rec = await yieldStore(prisma).yieldRecommendation.findUnique({
    where: { id },
  });
  if (!rec) {
    throw new NotFoundException(`Recommendation with ID ${id} not found`);
  }
  if (rec.status !== 'PENDING') {
    throw new BadRequestException(
      'Only a pending recommendation can be dismissed',
    );
  }
  return yieldStore(prisma).yieldRecommendation.update({
    where: { id },
    data: { status: 'DISMISSED' },
  });
}
