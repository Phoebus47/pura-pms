import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuestFeedbackService } from './guest-feedback.service';

const mockPrisma = {
  property: { findUnique: vi.fn() },
  guest: { findUnique: vi.fn() },
  reservation: { findUnique: vi.fn() },
  guestFeedback: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('GuestFeedbackService', () => {
  let service: GuestFeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestFeedbackService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(GuestFeedbackService);
    vi.clearAllMocks();
  });

  it('requires propertyId to list', async () => {
    await expect(service.findAll({} as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates feedback with score and comment', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrisma.guest.findUnique.mockResolvedValue({ id: 'gst-1' });
    mockPrisma.guestFeedback.create.mockResolvedValue({ id: 'fb-1' });
    const row = await service.create({
      propertyId: 'prop-1',
      guestId: 'gst-1',
      score: 5,
      comment: 'Great stay',
    });
    expect(row.id).toBe('fb-1');
    expect(mockPrisma.guestFeedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          score: 5,
          status: 'OPEN',
        }),
      }),
    );
  });

  it('rejects invalid score', async () => {
    await expect(
      service.create({
        propertyId: 'prop-1',
        guestId: 'gst-1',
        score: 0,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('marks open feedback as reviewed', async () => {
    mockPrisma.guestFeedback.findUnique.mockResolvedValue({
      id: 'fb-1',
      status: 'OPEN',
    });
    mockPrisma.guestFeedback.update.mockResolvedValue({
      id: 'fb-1',
      status: 'REVIEWED',
      reviewedAt: new Date(),
      reviewedBy: 'usr-1',
    });
    const row = await service.review('fb-1', { reviewedBy: 'usr-1' });
    expect(row.status).toBe('REVIEWED');
  });

  it('returns already reviewed feedback without update', async () => {
    mockPrisma.guestFeedback.findUnique.mockResolvedValue({
      id: 'fb-1',
      status: 'REVIEWED',
    });
    const row = await service.review('fb-1', { reviewedBy: 'usr-1' });
    expect(row.status).toBe('REVIEWED');
    expect(mockPrisma.guestFeedback.update).not.toHaveBeenCalled();
  });

  it('throws when feedback is missing', async () => {
    mockPrisma.guestFeedback.findUnique.mockResolvedValue(null);
    await expect(
      service.review('missing', { reviewedBy: 'usr-1' }),
    ).rejects.toThrow(NotFoundException);
  });
});
