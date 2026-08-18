import { BlocksService } from './blocks.service';
import { PrismaService } from '../prisma/prisma.service';
import * as ops from './block-ops';
import * as pickup from './block-pickup';

vi.mock('./block-ops', () => ({
  createBlock: vi.fn(),
  findBlocks: vi.fn(),
  findBlock: vi.fn(),
  updateBlock: vi.fn(),
}));

vi.mock('./block-pickup', () => ({
  getPickupReport: vi.fn(),
  attachReservation: vi.fn(),
  detachReservation: vi.fn(),
  releaseBlock: vi.fn(),
}));

describe('BlocksService', () => {
  const prisma = {} as PrismaService;
  const service = new BlocksService(prisma);

  it('delegates create and pickup to ops', async () => {
    vi.mocked(ops.createBlock).mockResolvedValue({ id: 'block-1' });
    await service.create({
      propertyId: 'prop-1',
      roomTypeId: 'rt-1',
      code: 'OTA',
      name: 'OTA',
      kind: 'ALLOTMENT',
      startDate: '2026-08-18',
      endDate: '2026-08-20',
      cutoffDate: '2026-08-17',
      allottedRooms: 2,
    });
    expect(ops.createBlock).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ code: 'OTA' }),
    );
    await service.pickup('block-1');
    expect(pickup.getPickupReport).toHaveBeenCalledWith(prisma, 'block-1');
  });
});
