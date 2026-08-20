import { Test, TestingModule } from '@nestjs/testing';
import { GuestFeedbackController } from './guest-feedback.controller';
import { GuestFeedbackService } from './guest-feedback.service';

const mockService = {
  findAll: vi.fn(),
  create: vi.fn(),
  review: vi.fn(),
};

describe('GuestFeedbackController', () => {
  let controller: GuestFeedbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestFeedbackController],
      providers: [{ provide: GuestFeedbackService, useValue: mockService }],
    }).compile();
    controller = module.get(GuestFeedbackController);
    vi.clearAllMocks();
  });

  it('lists feedback', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll({ propertyId: 'prop-1' });
    expect(mockService.findAll).toHaveBeenCalledWith({ propertyId: 'prop-1' });
  });

  it('creates feedback', async () => {
    mockService.create.mockResolvedValue({ id: 'fb-1' });
    await controller.create({
      propertyId: 'prop-1',
      guestId: 'gst-1',
      score: 4,
    });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('marks feedback reviewed', async () => {
    await controller.review('fb-1', { reviewedBy: 'usr-1' });
    expect(mockService.review).toHaveBeenCalledWith('fb-1', {
      reviewedBy: 'usr-1',
    });
  });
});
