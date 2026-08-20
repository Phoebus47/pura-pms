import { Test, TestingModule } from '@nestjs/testing';
import { LostFoundController } from './lost-found.controller';
import { LostFoundService } from './lost-found.service';

const mockService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  claim: vi.fn(),
  returnItem: vi.fn(),
  dispose: vi.fn(),
};

describe('LostFoundController', () => {
  let controller: LostFoundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LostFoundController],
      providers: [{ provide: LostFoundService, useValue: mockService }],
    }).compile();
    controller = module.get(LostFoundController);
    vi.clearAllMocks();
  });

  it('lists items', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll({ propertyId: 'prop-1' });
    expect(mockService.findAll).toHaveBeenCalledWith({ propertyId: 'prop-1' });
  });

  it('creates an item', async () => {
    mockService.create.mockResolvedValue({ id: 'lf-1' });
    await controller.create({
      propertyId: 'prop-1',
      itemDescription: 'Umbrella',
      locationFound: 'Pool',
      foundBy: 'user-1',
    });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('claims an item', async () => {
    await controller.claim('lf-1', { claimedBy: 'user-1' });
    expect(mockService.claim).toHaveBeenCalledWith('lf-1', {
      claimedBy: 'user-1',
    });
  });

  it('returns an item', async () => {
    await controller.returnItem('lf-1', { returnedTo: 'Ann Guest' });
    expect(mockService.returnItem).toHaveBeenCalledWith('lf-1', {
      returnedTo: 'Ann Guest',
    });
  });

  it('disposes an item', async () => {
    await controller.dispose('lf-1', {
      disposedBy: 'user-1',
      disposeReason: 'Expired',
    });
    expect(mockService.dispose).toHaveBeenCalledWith('lf-1', {
      disposedBy: 'user-1',
      disposeReason: 'Expired',
    });
  });
});
