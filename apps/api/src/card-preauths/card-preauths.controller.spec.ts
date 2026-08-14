import { Test, TestingModule } from '@nestjs/testing';
import { CardPreauthsController } from './card-preauths.controller';
import { CardPreauthsService } from './card-preauths.service';

const mockService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  increment: vi.fn(),
  capture: vi.fn(),
  release: vi.fn(),
};

describe('CardPreauthsController', () => {
  let controller: CardPreauthsController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardPreauthsController],
      providers: [{ provide: CardPreauthsService, useValue: mockService }],
    }).compile();
    controller = module.get<CardPreauthsController>(CardPreauthsController);
  });

  it('should list and create holds', async () => {
    mockService.findAll.mockResolvedValue([]);
    mockService.create.mockResolvedValue({ id: 'pa-1' });
    await controller.findAll({ reservationId: 'res-1' });
    await controller.create({
      reservationId: 'res-1',
      amount: 1000,
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2028,
      manualRef: 'AUTH-1',
      createdBy: 'user-1',
    });
    expect(mockService.findAll).toHaveBeenCalledWith('res-1');
    expect(mockService.create).toHaveBeenCalled();
  });

  it('should increment, capture, and release', async () => {
    mockService.increment.mockResolvedValue({ id: 'pa-1' });
    mockService.capture.mockResolvedValue({ id: 'pa-1' });
    mockService.release.mockResolvedValue({ id: 'pa-1' });
    await controller.increment('pa-1', { amount: 1500 });
    await controller.capture('pa-1', { folioId: 'fol-1', userId: 'user-1' });
    await controller.release('pa-1');
    expect(mockService.increment).toHaveBeenCalledWith('pa-1', {
      amount: 1500,
    });
    expect(mockService.capture).toHaveBeenCalled();
    expect(mockService.release).toHaveBeenCalledWith('pa-1');
  });
});
