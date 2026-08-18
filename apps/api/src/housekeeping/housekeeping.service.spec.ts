import { HousekeepingService } from './housekeeping.service';
import { PrismaService } from '../prisma/prisma.service';
import * as ops from './hk-ops';

vi.mock('./hk-ops', () => ({
  getBoard: vi.fn(),
  getChecklist: vi.fn(),
  markRoomClean: vi.fn(),
  listInspections: vi.fn(),
  createInspection: vi.fn(),
}));

describe('HousekeepingService', () => {
  const prisma = {} as PrismaService;
  const service = new HousekeepingService(prisma);

  it('delegates board and inspect to ops', async () => {
    vi.mocked(ops.getBoard).mockResolvedValue([]);
    vi.mocked(ops.createInspection).mockResolvedValue({ id: 'insp-1' });
    await service.board('prop-1');
    await service.inspect('room-1', {
      inspectedBy: 'usr-1',
      lines: [],
    });
    expect(ops.getBoard).toHaveBeenCalledWith(prisma, 'prop-1');
    expect(ops.createInspection).toHaveBeenCalledWith(
      prisma,
      'room-1',
      expect.objectContaining({ inspectedBy: 'usr-1' }),
    );
  });
});
