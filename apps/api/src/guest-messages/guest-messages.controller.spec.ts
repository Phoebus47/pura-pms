import { Test, TestingModule } from '@nestjs/testing';
import { GuestMessagesController } from './guest-messages.controller';
import { GuestMessagesService } from './guest-messages.service';

const mockService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  markRead: vi.fn(),
};

describe('GuestMessagesController', () => {
  let controller: GuestMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestMessagesController],
      providers: [{ provide: GuestMessagesService, useValue: mockService }],
    }).compile();
    controller = module.get(GuestMessagesController);
    vi.clearAllMocks();
  });

  it('lists messages', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll({ propertyId: 'prop-1' });
    expect(mockService.findAll).toHaveBeenCalledWith({ propertyId: 'prop-1' });
  });

  it('creates a message', async () => {
    mockService.create.mockResolvedValue({ id: 'msg-1' });
    await controller.create({
      propertyId: 'prop-1',
      guestId: 'gst-1',
      direction: 'OUTBOUND',
      content: 'Hello',
      sentBy: 'usr-1',
    });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('marks a message read', async () => {
    await controller.markRead('msg-1');
    expect(mockService.markRead).toHaveBeenCalledWith('msg-1');
  });
});
