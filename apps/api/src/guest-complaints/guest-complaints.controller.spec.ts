import { Test, TestingModule } from '@nestjs/testing';
import { GuestComplaintsController } from './guest-complaints.controller';
import { GuestComplaintsService } from './guest-complaints.service';

const mockService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  start: vi.fn(),
  resolve: vi.fn(),
  close: vi.fn(),
};

describe('GuestComplaintsController', () => {
  let controller: GuestComplaintsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestComplaintsController],
      providers: [{ provide: GuestComplaintsService, useValue: mockService }],
    }).compile();
    controller = module.get(GuestComplaintsController);
    vi.clearAllMocks();
  });

  it('lists complaints', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll({ propertyId: 'prop-1' });
    expect(mockService.findAll).toHaveBeenCalledWith({ propertyId: 'prop-1' });
  });

  it('gets one complaint', async () => {
    await controller.findOne('gc-1');
    expect(mockService.findOne).toHaveBeenCalledWith('gc-1');
  });

  it('creates a complaint', async () => {
    mockService.create.mockResolvedValue({ id: 'gc-1' });
    await controller.create({
      propertyId: 'prop-1',
      category: 'Room',
      subject: 'Dirty bathroom',
      description: 'Hair in shower',
      openedBy: 'usr-1',
    });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('starts a complaint', async () => {
    await controller.start('gc-1', { assignedTo: 'usr-2' });
    expect(mockService.start).toHaveBeenCalledWith('gc-1', {
      assignedTo: 'usr-2',
    });
  });

  it('resolves a complaint', async () => {
    await controller.resolve('gc-1', {
      resolvedBy: 'usr-1',
      resolutionNote: 'Housekeeping re-cleaned',
    });
    expect(mockService.resolve).toHaveBeenCalledWith('gc-1', {
      resolvedBy: 'usr-1',
      resolutionNote: 'Housekeeping re-cleaned',
    });
  });

  it('closes a complaint', async () => {
    await controller.close('gc-1', { closedBy: 'usr-1' });
    expect(mockService.close).toHaveBeenCalledWith('gc-1', {
      closedBy: 'usr-1',
    });
  });
});
