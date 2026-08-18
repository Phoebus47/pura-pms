import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateRate } from '../rates/rates-ops';
import {
  applyRecommendation,
  createCompetitorRate,
  dismissRecommendation,
  generateRecommendations,
  getPace,
} from './yield-ops';

vi.mock('../rates/rates-ops', () => ({
  updateRate: vi.fn().mockResolvedValue({ id: 'rate-bar', amount: 1100 }),
}));

function prismaMock() {
  return {
    property: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'prop-1',
        businessDate: new Date('2026-08-18T00:00:00.000Z'),
      }),
    },
    room: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'r1', roomTypeId: 'rt1', status: 'VACANT_CLEAN' },
        { id: 'r2', roomTypeId: 'rt1', status: 'OCCUPIED_CLEAN' },
      ]),
    },
    roomType: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: 'rt1', propertyId: 'prop-1' }),
    },
    reservation: {
      findMany: vi.fn().mockResolvedValue([
        {
          roomId: 'r1',
          status: 'CONFIRMED',
          checkIn: new Date('2026-08-18T00:00:00.000Z'),
          checkOut: new Date('2026-08-19T00:00:00.000Z'),
          isDayUse: false,
          room: { roomTypeId: 'rt1' },
        },
        {
          roomId: 'r2',
          status: 'CONFIRMED',
          checkIn: new Date('2026-08-18T00:00:00.000Z'),
          checkOut: new Date('2026-08-19T00:00:00.000Z'),
          isDayUse: false,
          room: { roomTypeId: 'rt1' },
        },
      ]),
    },
    rate: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'rate-bar',
          roomTypeId: 'rt1',
          amount: 1000,
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-12-31T00:00:00.000Z'),
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          isActive: true,
          parentRateId: null,
        },
      ]),
    },
    competitorRate: {
      create: vi
        .fn()
        .mockImplementation((args: { data: Record<string, unknown> }) => ({
          id: 'comp-1',
          ...args.data,
        })),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    yieldRecommendation: {
      create: vi
        .fn()
        .mockImplementation((args: { data: Record<string, unknown> }) => ({
          id: 'rec-1',
          ...args.data,
        })),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
}

describe('yield-ops', () => {
  let prisma: ReturnType<typeof prismaMock>;

  beforeEach(() => {
    prisma = prismaMock();
  });

  it('returns pace for the business-date horizon', async () => {
    const result = await getPace(prisma, 'prop-1');
    expect(result.from).toBe('2026-08-18');
    expect(result.days).toHaveLength(14);
    expect(result.days[0].occupied).toBe(2);
    expect(result.days[0].occupancyPct).toBe(100);
  });

  it('generates a high-demand recommendation when occupancy is full', async () => {
    const created = await generateRecommendations(prisma, 'prop-1');
    expect(created.length).toBeGreaterThan(0);
    expect(prisma.yieldRecommendation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          rateId: 'rate-bar',
          reason: 'HIGH_DEMAND',
          recommendedAmount: 1100,
        }),
      }),
    );
  });

  it('does not duplicate a pending recommendation for the same rate and date', async () => {
    prisma.yieldRecommendation.findMany.mockResolvedValue([
      {
        id: 'rec-existing',
        rateId: 'rate-bar',
        stayDate: new Date('2026-08-18T00:00:00.000Z'),
        status: 'PENDING',
      },
    ]);
    await generateRecommendations(prisma, 'prop-1');
    const createdDates = prisma.yieldRecommendation.create.mock.calls.map(
      (call) => {
        const args = call[0] as { data: { stayDate: Date } };
        return args.data.stayDate.toISOString().slice(0, 10);
      },
    );
    expect(createdDates).not.toContain('2026-08-18');
  });

  it('applies a pending recommendation onto the parent rate', async () => {
    prisma.yieldRecommendation.findUnique.mockResolvedValue({
      id: 'rec-1',
      propertyId: 'prop-1',
      rateId: 'rate-bar',
      recommendedAmount: 1100,
      status: 'PENDING',
    });
    prisma.yieldRecommendation.update.mockResolvedValue({
      id: 'rec-1',
      status: 'APPLIED',
    });
    await applyRecommendation(prisma, 'rec-1');
    expect(updateRate).toHaveBeenCalledWith(prisma, 'rate-bar', {
      amount: 1100,
    });
    expect(prisma.yieldRecommendation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'APPLIED' }),
      }),
    );
  });

  it('rejects apply and dismiss when the recommendation is not pending', async () => {
    prisma.yieldRecommendation.findUnique.mockResolvedValue({
      id: 'rec-1',
      status: 'APPLIED',
      rateId: 'rate-bar',
      recommendedAmount: 1100,
      propertyId: 'prop-1',
    });
    await expect(applyRecommendation(prisma, 'rec-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(dismissRecommendation(prisma, 'rec-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates a competitor rate after validating the property', async () => {
    await createCompetitorRate(prisma, {
      propertyId: 'prop-1',
      competitorName: 'Hotel B',
      stayDate: '2026-08-20',
      amount: 900,
    });
    expect(prisma.competitorRate.create).toHaveBeenCalled();
  });

  it('throws when the property is missing', async () => {
    prisma.property.findUnique.mockResolvedValue(null);
    await expect(getPace(prisma, 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
