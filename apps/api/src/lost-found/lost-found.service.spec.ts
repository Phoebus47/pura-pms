import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LostFoundService } from './lost-found.service';

const mockPrisma = {
  property: { findUnique: vi.fn() },
  guest: { findUnique: vi.fn() },
  lostFoundItem: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('LostFoundService', () => {
  let service: LostFoundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LostFoundService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(LostFoundService);
    vi.clearAllMocks();
  });

  it('requires propertyId to list', async () => {
    await expect(service.findAll({} as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates a found item', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrisma.lostFoundItem.create.mockResolvedValue({ id: 'lf-1' });
    const row = await service.create({
      propertyId: 'prop-1',
      itemDescription: 'Black wallet',
      locationFound: 'Lobby',
      foundBy: 'user-1',
    });
    expect(row.id).toBe('lf-1');
    expect(mockPrisma.lostFoundItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          itemDescription: 'Black wallet',
          locationFound: 'Lobby',
          retentionDays: 90,
        }),
      }),
    );
  });

  it('claims a found item', async () => {
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue({
      id: 'lf-1',
      status: 'FOUND',
      guestId: null,
    });
    mockPrisma.lostFoundItem.update.mockResolvedValue({
      id: 'lf-1',
      status: 'CLAIMED',
    });
    const row = await service.claim('lf-1', { claimedBy: 'user-1' });
    expect(row.status).toBe('CLAIMED');
  });

  it('throws when item is missing', async () => {
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('throws when linked guest is missing', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrisma.guest.findUnique.mockResolvedValue(null);
    await expect(
      service.create({
        propertyId: 'prop-1',
        itemDescription: 'Umbrella',
        locationFound: 'Pool',
        foundBy: 'user-1',
        guestId: 'gst-missing',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('filters overdue found items', async () => {
    mockPrisma.lostFoundItem.findMany.mockResolvedValue([
      {
        id: 'old',
        status: 'FOUND',
        foundAt: new Date('2020-01-01T00:00:00.000Z'),
        retentionDays: 90,
      },
      {
        id: 'fresh',
        status: 'FOUND',
        foundAt: new Date(),
        retentionDays: 90,
      },
    ]);
    const rows = await service.findAll({
      propertyId: 'prop-1',
      overdue: 'true',
    });
    expect(rows.map((row) => row.id)).toEqual(['old']);
  });

  it('returns a claimed item', async () => {
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue({
      id: 'lf-1',
      status: 'CLAIMED',
    });
    mockPrisma.lostFoundItem.update.mockResolvedValue({
      id: 'lf-1',
      status: 'RETURNED',
    });
    const row = await service.returnItem('lf-1', { returnedTo: 'Ann Guest' });
    expect(row.status).toBe('RETURNED');
  });

  it('disposes a found item', async () => {
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue({
      id: 'lf-1',
      status: 'FOUND',
    });
    mockPrisma.lostFoundItem.update.mockResolvedValue({
      id: 'lf-1',
      status: 'DISPOSED',
    });
    const row = await service.dispose('lf-1', {
      disposedBy: 'user-1',
      disposeReason: 'Expired',
    });
    expect(row.status).toBe('DISPOSED');
  });
});
