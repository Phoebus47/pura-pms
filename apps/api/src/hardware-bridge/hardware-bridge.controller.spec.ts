import { Test, TestingModule } from '@nestjs/testing';
import { HardwareBridgeController } from './hardware-bridge.controller';
import { HardwareBridgeService } from './hardware-bridge.service';

const mockHardwareBridgeService = {
  catalog: vi.fn(),
  listAgents: vi.fn(),
  registerAgent: vi.fn(),
  heartbeat: vi.fn(),
  listJobs: vi.fn(),
  createJob: vi.fn(),
  completeJob: vi.fn(),
  failJob: vi.fn(),
  simulateJob: vi.fn(),
};

describe('HardwareBridgeController', () => {
  let controller: HardwareBridgeController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HardwareBridgeController],
      providers: [
        {
          provide: HardwareBridgeService,
          useValue: mockHardwareBridgeService,
        },
      ],
    }).compile();
    controller = module.get<HardwareBridgeController>(HardwareBridgeController);
  });

  it('returns the catalog', () => {
    mockHardwareBridgeService.catalog.mockReturnValue({
      deviceTypes: ['PRINTER'],
      vendors: ['GENERIC'],
      jobTypes: ['PRINT'],
    });
    const catalog = controller.catalog();
    expect(mockHardwareBridgeService.catalog).toHaveBeenCalled();
    expect(catalog).toMatchObject({ deviceTypes: ['PRINTER'] });
  });

  it('creates an agent', async () => {
    await controller.registerAgent({
      propertyId: 'prop-1',
      name: 'Front desk PC',
      machineId: 'pc-1',
    });
    expect(mockHardwareBridgeService.registerAgent).toHaveBeenCalledWith({
      propertyId: 'prop-1',
      name: 'Front desk PC',
      machineId: 'pc-1',
    });
  });

  it('simulates a job and wires remaining routes', async () => {
    await controller.simulateJob('job-1');
    await controller.listAgents({ propertyId: 'prop-1' });
    await controller.heartbeat('agent-1');
    await controller.listJobs({ propertyId: 'prop-1', status: 'PENDING' });
    await controller.createJob({
      propertyId: 'prop-1',
      type: 'PRINT',
      requestedBy: 'usr-1',
      payload: {},
    });
    await controller.completeJob('job-1', { result: { printed: true } });
    await controller.failJob('job-1', { errorMessage: 'jam' });
    expect(mockHardwareBridgeService.simulateJob).toHaveBeenCalledWith('job-1');
    expect(mockHardwareBridgeService.listAgents).toHaveBeenCalledWith('prop-1');
    expect(mockHardwareBridgeService.createJob).toHaveBeenCalled();
  });
});
