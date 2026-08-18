import { HardwareBridgeService } from './hardware-bridge.service';
import { PrismaService } from '../prisma/prisma.service';
import * as ops from './hb-ops';

vi.mock('./hb-ops', () => ({
  getCatalog: vi.fn(),
  listAgents: vi.fn(),
  registerAgent: vi.fn(),
  heartbeat: vi.fn(),
  listJobs: vi.fn(),
  createJob: vi.fn(),
  completeJob: vi.fn(),
  failJob: vi.fn(),
  simulateJob: vi.fn(),
}));

describe('HardwareBridgeService', () => {
  const prisma = {} as PrismaService;
  const service = new HardwareBridgeService(prisma);

  it('delegates catalog register and simulate to ops', async () => {
    vi.mocked(ops.getCatalog).mockReturnValue({
      deviceTypes: [],
      vendors: [],
      jobTypes: [],
    });
    vi.mocked(ops.registerAgent).mockResolvedValue({ id: 'agent-1' });
    vi.mocked(ops.simulateJob).mockResolvedValue({ id: 'job-1' });
    service.catalog();
    await service.registerAgent({
      propertyId: 'prop-1',
      name: 'PC',
      machineId: 'pc-1',
    });
    await service.simulateJob('job-1');
    expect(ops.getCatalog).toHaveBeenCalled();
    expect(ops.registerAgent).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ machineId: 'pc-1' }),
    );
    expect(ops.simulateJob).toHaveBeenCalledWith(prisma, 'job-1');
  });
});
