import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HK_DND_CLEAN_MESSAGE, HK_NOT_DIRTY_MESSAGE } from './hk-rules';
import { createInspection, markRoomClean, setGuestRequest } from './hk-ops';

function roomRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'room-1',
    number: '101',
    floor: 1,
    status: 'VACANT_DIRTY',
    hkStage: 'DIRTY',
    guestRequest: 'NONE',
    guestRequestNote: null,
    guestRequestUpdatedAt: null,
    guestRequestUpdatedBy: null,
    propertyId: 'prop-1',
    roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX' },
    inspections: [],
    ...overrides,
  };
}

function allLines(passed = true) {
  return [
    { itemCode: 'BED', passed },
    { itemCode: 'BATH', passed: true },
    { itemCode: 'LINEN', passed: true },
    { itemCode: 'AMENITIES', passed: true },
    { itemCode: 'MINIBAR', passed: true },
  ];
}

function prismaMock() {
  const room = roomRow();
  return {
    property: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'prop-1',
        businessDate: new Date('2026-08-18T00:00:00.000Z'),
      }),
    },
    room: {
      findUnique: vi.fn().mockResolvedValue(room),
      findMany: vi.fn().mockResolvedValue([room]),
      update: vi
        .fn()
        .mockImplementation((args: { data: Record<string, unknown> }) => ({
          ...room,
          ...args.data,
        })),
    },
    housekeepingInspection: {
      create: vi
        .fn()
        .mockImplementation((args: { data: Record<string, unknown> }) => ({
          id: 'insp-1',
          result: args.data.result,
          lines: [],
        })),
      findMany: vi.fn().mockResolvedValue([]),
    },
  };
}

describe('hk-ops', () => {
  let prisma: ReturnType<typeof prismaMock>;

  beforeEach(() => {
    prisma = prismaMock();
  });

  it('marks a dirty room clean', async () => {
    await markRoomClean(prisma, 'room-1');
    expect(prisma.room.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VACANT_CLEAN',
          hkStage: 'CLEAN',
        }),
      }),
    );
  });

  it('rejects cleaning while DND is active', async () => {
    prisma.room.findUnique.mockResolvedValue(roomRow({ guestRequest: 'DND' }));
    await expect(markRoomClean(prisma, 'room-1')).rejects.toMatchObject({
      message: HK_DND_CLEAN_MESSAGE,
    });
  });

  it('sets MUR guest request', async () => {
    await setGuestRequest(prisma, 'room-1', {
      request: 'MUR',
      updatedBy: 'usr-1',
      note: 'Guest asked for service',
    });
    expect(prisma.room.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          guestRequest: 'MUR',
          guestRequestNote: 'Guest asked for service',
          guestRequestUpdatedBy: 'usr-1',
        }),
      }),
    );
  });

  it('rejects cleaning a ready room', async () => {
    prisma.room.findUnique.mockResolvedValue(
      roomRow({ hkStage: 'READY', status: 'VACANT_CLEAN' }),
    );
    await expect(markRoomClean(prisma, 'room-1')).rejects.toMatchObject({
      message: HK_NOT_DIRTY_MESSAGE,
    });
  });

  it('passes inspection and sets the room ready', async () => {
    prisma.room.findUnique.mockResolvedValue(
      roomRow({ hkStage: 'CLEAN', status: 'VACANT_CLEAN' }),
    );
    await createInspection(prisma, 'room-1', {
      inspectedBy: 'usr-1',
      lines: allLines(),
    });
    expect(prisma.housekeepingInspection.create).toHaveBeenCalled();
    expect(prisma.room.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ hkStage: 'READY' }),
      }),
    );
  });

  it('fails inspection and returns the room to dirty', async () => {
    prisma.room.findUnique.mockResolvedValue(
      roomRow({ hkStage: 'CLEAN', status: 'VACANT_CLEAN' }),
    );
    await createInspection(prisma, 'room-1', {
      inspectedBy: 'usr-1',
      lines: allLines(false),
    });
    expect(prisma.room.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          hkStage: 'DIRTY',
          status: 'VACANT_DIRTY',
        }),
      }),
    );
  });

  it('rejects inspection of a dirty room', async () => {
    await expect(
      createInspection(prisma, 'room-1', {
        inspectedBy: 'usr-1',
        lines: allLines(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
