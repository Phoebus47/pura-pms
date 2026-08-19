import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationCardsController } from './registration-cards.controller';
import { RegistrationCardsService } from './registration-cards.service';

const mockService = {
  findByReservation: vi.fn(),
  findOne: vi.fn(),
  createDraft: vi.fn(),
  sign: vi.fn(),
  void: vi.fn(),
  createPrintJob: vi.fn(),
};

describe('RegistrationCardsController', () => {
  let controller: RegistrationCardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationCardsController],
      providers: [{ provide: RegistrationCardsService, useValue: mockService }],
    }).compile();
    controller = module.get(RegistrationCardsController);
    vi.clearAllMocks();
  });

  it('lists by reservation', async () => {
    mockService.findByReservation.mockResolvedValue([]);
    await controller.findByReservation({ reservationId: 'res-1' });
    expect(mockService.findByReservation).toHaveBeenCalledWith('res-1');
  });

  it('creates draft', async () => {
    mockService.createDraft.mockResolvedValue({ id: 'rc-1' });
    await controller.createDraft({
      reservationId: 'res-1',
      createdBy: 'user-1',
    });
    expect(mockService.createDraft).toHaveBeenCalled();
  });

  it('signs card', async () => {
    await controller.sign('rc-1', {
      signatureData: 'data:image/png;base64,abc',
      signedByGuestName: 'Guest',
    });
    expect(mockService.sign).toHaveBeenCalledWith('rc-1', expect.any(Object));
  });
});
