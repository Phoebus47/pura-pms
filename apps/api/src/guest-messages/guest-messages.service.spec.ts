import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuestMessagesService } from './guest-messages.service';

const mockPrisma = {
  property: { findUnique: vi.fn() },
  guest: { findUnique: vi.fn() },
  reservation: { findUnique: vi.fn() },
  guestMessage: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('GuestMessagesService', () => {
  let service: GuestMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestMessagesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(GuestMessagesService);
    vi.clearAllMocks();
  });

  it('requires propertyId to list', async () => {
    await expect(service.findAll({} as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates an outbound in-app message', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrisma.guest.findUnique.mockResolvedValue({ id: 'gst-1' });
    mockPrisma.guestMessage.create.mockResolvedValue({ id: 'msg-1' });
    const row = await service.create({
      propertyId: 'prop-1',
      guestId: 'gst-1',
      direction: 'OUTBOUND',
      content: 'Welcome',
      sentBy: 'usr-1',
    });
    expect(row.id).toBe('msg-1');
    expect(mockPrisma.guestMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          channel: 'IN_APP',
          direction: 'OUTBOUND',
        }),
      }),
    );
  });

  it('rejects outbound without sentBy', async () => {
    await expect(
      service.create({
        propertyId: 'prop-1',
        guestId: 'gst-1',
        direction: 'OUTBOUND',
        content: 'Hi',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('marks unread messages as read', async () => {
    mockPrisma.guestMessage.findUnique.mockResolvedValue({
      id: 'msg-1',
      readAt: null,
    });
    mockPrisma.guestMessage.update.mockResolvedValue({
      id: 'msg-1',
      readAt: new Date(),
    });
    const row = await service.markRead('msg-1');
    expect(row.readAt).toBeTruthy();
  });

  it('throws when message is missing', async () => {
    mockPrisma.guestMessage.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
