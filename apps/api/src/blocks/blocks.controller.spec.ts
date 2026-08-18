import { Test, TestingModule } from '@nestjs/testing';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

const mockBlocksService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  pickup: vi.fn(),
  attach: vi.fn(),
  detach: vi.fn(),
  release: vi.fn(),
};

describe('BlocksController', () => {
  let controller: BlocksController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocksController],
      providers: [{ provide: BlocksService, useValue: mockBlocksService }],
    }).compile();
    controller = module.get<BlocksController>(BlocksController);
  });

  it('creates and lists blocks', async () => {
    const dto = {
      propertyId: 'prop-1',
      roomTypeId: 'rt-1',
      code: 'OTA-AUG',
      name: 'Booking.com Aug',
      kind: 'ALLOTMENT' as const,
      startDate: '2026-08-18',
      endDate: '2026-08-20',
      cutoffDate: '2026-08-17',
      allottedRooms: 2,
    };
    mockBlocksService.create.mockResolvedValue({ id: 'block-1' });
    mockBlocksService.findAll.mockResolvedValue([]);
    await controller.create(dto);
    await controller.findAll({ propertyId: 'prop-1' });
    expect(mockBlocksService.create).toHaveBeenCalledWith(dto);
    expect(mockBlocksService.findAll).toHaveBeenCalledWith('prop-1');
  });

  it('returns pickup, attaches, detaches, and releases', async () => {
    await controller.pickup('block-1');
    await controller.attach('block-1', { reservationId: 'res-1' });
    await controller.detach('block-1', 'res-1');
    await controller.release('block-1');
    expect(mockBlocksService.pickup).toHaveBeenCalledWith('block-1');
    expect(mockBlocksService.attach).toHaveBeenCalledWith('block-1', {
      reservationId: 'res-1',
    });
    expect(mockBlocksService.detach).toHaveBeenCalledWith('block-1', 'res-1');
    expect(mockBlocksService.release).toHaveBeenCalledWith('block-1');
  });

  it('updates a block', async () => {
    await controller.findOne('block-1');
    await controller.update('block-1', { name: 'Updated' });
    expect(mockBlocksService.findOne).toHaveBeenCalledWith('block-1');
    expect(mockBlocksService.update).toHaveBeenCalledWith('block-1', {
      name: 'Updated',
    });
  });
});
