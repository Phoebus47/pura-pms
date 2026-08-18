import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BLOCK_OVER_ALLOTMENT_MESSAGE,
  pickupCount,
  type BlockStatus,
} from './block-rules';
import { createBlock, findBlock } from './block-ops';
import {
  attachReservation,
  releaseBlock,
  summarizePickup,
} from './block-pickup';

function blockRow(
  overrides: Partial<{
    cutoffDate: Date;
    allottedRooms: number;
    releasedRooms: number;
    status: BlockStatus;
  }> = {},
) {
  return {
    id: 'block-1',
    propertyId: 'prop-1',
    roomTypeId: 'rt-1',
    code: 'OTA-AUG',
    name: 'Booking.com Aug',
    kind: 'ALLOTMENT',
    inventoryMode: 'GENERAL',
    startDate: new Date('2026-08-18T00:00:00.000Z'),
    endDate: new Date('2026-08-20T00:00:00.000Z'),
    cutoffDate: new Date('2026-08-25T00:00:00.000Z'),
    allottedRooms: 2,
    releasedRooms: 0,
    status: 'OPEN' as BlockStatus,
    ...overrides,
  };
}

function prismaMock() {
  const block = blockRow();
  return {
    property: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'prop-1',
        businessDate: new Date('2026-08-10T00:00:00.000Z'),
      }),
    },
    roomType: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'rt-1',
        propertyId: 'prop-1',
      }),
    },
    roomBlock: {
      create: vi
        .fn()
        .mockImplementation(
          (args: { data: Record<string, unknown>; include?: unknown }) => ({
            id: 'block-1',
            releasedRooms: 0,
            status: 'OPEN',
            ...args.data,
            roomType: args.include
              ? { id: 'rt-1', name: 'Deluxe', code: 'DLX' }
              : undefined,
          }),
        ),
      findMany: vi.fn().mockResolvedValue([block]),
      findUnique: vi.fn().mockResolvedValue(block),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi
        .fn()
        .mockImplementation((args: { data: Record<string, unknown> }) => ({
          ...block,
          ...args.data,
        })),
    },
    reservation: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
    },
  };
}

describe('pickup helpers', () => {
  it('counts only active pickup reservations', () => {
    expect(
      pickupCount([
        { status: 'CONFIRMED' },
        { status: 'CANCELLED' },
        { status: 'CHECKED_IN' },
      ]),
    ).toBe(2);
  });

  it('builds a nightly pickup report', () => {
    const nights = summarizePickup(blockRow(), [
      {
        id: 'res-1',
        status: 'CONFIRMED',
        checkIn: new Date('2026-08-18T00:00:00.000Z'),
        checkOut: new Date('2026-08-19T00:00:00.000Z'),
        isDayUse: false,
        blockId: 'block-1',
        roomId: 'r1',
        room: { propertyId: 'prop-1', roomTypeId: 'rt-1' },
      },
    ]);
    expect(nights).toHaveLength(2);
    expect(nights[0]).toEqual({
      stayDate: '2026-08-18',
      allotted: 2,
      pickedUp: 1,
      remaining: 1,
    });
    expect(nights[1].pickedUp).toBe(0);
  });
});

describe('block-ops', () => {
  let prisma: ReturnType<typeof prismaMock>;

  beforeEach(() => {
    prisma = prismaMock();
  });

  it('creates an allotment for a room type', async () => {
    await createBlock(prisma, {
      propertyId: 'prop-1',
      roomTypeId: 'rt-1',
      code: 'OTA-AUG',
      name: 'Booking.com Aug',
      kind: 'ALLOTMENT',
      startDate: '2026-08-18',
      endDate: '2026-08-20',
      cutoffDate: '2026-08-17',
      allottedRooms: 2,
    });
    expect(prisma.roomBlock.create).toHaveBeenCalled();
  });

  it('rejects a duplicate block code', async () => {
    prisma.roomBlock.findFirst.mockResolvedValue(blockRow());
    await expect(
      createBlock(prisma, {
        propertyId: 'prop-1',
        roomTypeId: 'rt-1',
        code: 'OTA-AUG',
        name: 'Dup',
        kind: 'ALLOTMENT',
        startDate: '2026-08-18',
        endDate: '2026-08-20',
        cutoffDate: '2026-08-17',
        allottedRooms: 2,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('attaches a matching reservation and refuses over-allotment', async () => {
    prisma.reservation.findUnique.mockResolvedValue({
      id: 'res-1',
      status: 'CONFIRMED',
      checkIn: new Date('2026-08-18T00:00:00.000Z'),
      checkOut: new Date('2026-08-19T00:00:00.000Z'),
      isDayUse: false,
      blockId: null,
      roomId: 'r1',
      room: { propertyId: 'prop-1', roomTypeId: 'rt-1' },
    });
    prisma.reservation.findMany.mockResolvedValue([
      { id: 'res-a', status: 'CONFIRMED' },
      { id: 'res-b', status: 'CONFIRMED' },
    ]);
    await expect(
      attachReservation(prisma, 'block-1', 'res-1'),
    ).rejects.toMatchObject({ message: BLOCK_OVER_ALLOTMENT_MESSAGE });
    expect(prisma.reservation.update).not.toHaveBeenCalled();
  });

  it('releases unused rooms and marks the block released', async () => {
    prisma.reservation.findMany.mockResolvedValue([
      { id: 'res-a', status: 'CONFIRMED' },
    ]);
    await releaseBlock(prisma, 'block-1');
    expect(prisma.roomBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          releasedRooms: 1,
          status: 'RELEASED',
        }),
      }),
    );
  });

  it('auto-releases unused rooms when cutoff is due', async () => {
    prisma.property.findUnique.mockResolvedValue({
      id: 'prop-1',
      businessDate: new Date('2026-08-18T00:00:00.000Z'),
    });
    prisma.roomBlock.findUnique.mockResolvedValue(
      blockRow({ cutoffDate: new Date('2026-08-17T00:00:00.000Z') }),
    );
    prisma.reservation.findMany.mockResolvedValue([]);
    await findBlock(prisma, 'block-1');
    expect(prisma.roomBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          releasedRooms: 2,
          status: 'RELEASED',
        }),
      }),
    );
  });

  it('rejects inverted dates', async () => {
    await expect(
      createBlock(prisma, {
        propertyId: 'prop-1',
        roomTypeId: 'rt-1',
        code: 'BAD',
        name: 'Bad',
        kind: 'GROUP',
        startDate: '2026-08-20',
        endDate: '2026-08-18',
        cutoffDate: '2026-08-17',
        allottedRooms: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
