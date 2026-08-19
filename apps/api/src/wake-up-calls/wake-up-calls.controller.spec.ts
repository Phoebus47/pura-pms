import { Test, TestingModule } from '@nestjs/testing';
import { WakeUpCallsController } from './wake-up-calls.controller';
import { WakeUpCallsService } from './wake-up-calls.service';

const mockService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  complete: vi.fn(),
  miss: vi.fn(),
  cancel: vi.fn(),
};

describe('WakeUpCallsController', () => {
  let controller: WakeUpCallsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WakeUpCallsController],
      providers: [{ provide: WakeUpCallsService, useValue: mockService }],
    }).compile();
    controller = module.get(WakeUpCallsController);
    vi.clearAllMocks();
  });

  it('lists calls', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll({ propertyId: 'prop-1' });
    expect(mockService.findAll).toHaveBeenCalledWith({ propertyId: 'prop-1' });
  });

  it('creates a call', async () => {
    mockService.create.mockResolvedValue({ id: 'wu-1' });
    await controller.create({
      reservationId: 'res-1',
      scheduledAt: '2026-08-19T06:00:00.000Z',
      scheduledBy: 'user-1',
    });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('completes a call', async () => {
    await controller.complete('wu-1', { completedBy: 'user-1' });
    expect(mockService.complete).toHaveBeenCalledWith('wu-1', {
      completedBy: 'user-1',
    });
  });
});
