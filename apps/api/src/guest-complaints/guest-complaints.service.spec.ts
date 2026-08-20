import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuestComplaintsService } from './guest-complaints.service';

const mockPrisma = {
  property: { findUnique: vi.fn() },
  guest: { findUnique: vi.fn() },
  reservation: { findUnique: vi.fn() },
  guestComplaint: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('GuestComplaintsService', () => {
  let service: GuestComplaintsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestComplaintsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(GuestComplaintsService);
    vi.clearAllMocks();
  });

  it('requires propertyId to list', async () => {
    await expect(service.findAll({} as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates a complaint with default severity', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrisma.guestComplaint.create.mockResolvedValue({ id: 'gc-1' });
    const row = await service.create({
      propertyId: 'prop-1',
      category: 'Room',
      subject: 'Noisy AC',
      description: 'AC unit rattles all night',
      openedBy: 'usr-1',
    });
    expect(row.id).toBe('gc-1');
    expect(mockPrisma.guestComplaint.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          severity: 'MEDIUM',
          status: 'OPEN',
        }),
      }),
    );
  });

  it('starts an open complaint', async () => {
    mockPrisma.guestComplaint.findUnique.mockResolvedValue({
      id: 'gc-1',
      status: 'OPEN',
      assignedTo: null,
    });
    mockPrisma.guestComplaint.update.mockResolvedValue({
      id: 'gc-1',
      status: 'IN_PROGRESS',
    });
    const row = await service.start('gc-1', { assignedTo: 'usr-2' });
    expect(row.status).toBe('IN_PROGRESS');
  });

  it('returns already in-progress complaint without update', async () => {
    mockPrisma.guestComplaint.findUnique.mockResolvedValue({
      id: 'gc-1',
      status: 'IN_PROGRESS',
    });
    const row = await service.start('gc-1', {});
    expect(row.status).toBe('IN_PROGRESS');
    expect(mockPrisma.guestComplaint.update).not.toHaveBeenCalled();
  });

  it('resolves an in-progress complaint', async () => {
    mockPrisma.guestComplaint.findUnique.mockResolvedValue({
      id: 'gc-1',
      status: 'IN_PROGRESS',
    });
    mockPrisma.guestComplaint.update.mockResolvedValue({
      id: 'gc-1',
      status: 'RESOLVED',
    });
    const row = await service.resolve('gc-1', {
      resolvedBy: 'usr-1',
      resolutionNote: 'Moved guest to quiet room',
    });
    expect(row.status).toBe('RESOLVED');
  });

  it('closes a resolved complaint', async () => {
    mockPrisma.guestComplaint.findUnique.mockResolvedValue({
      id: 'gc-1',
      status: 'RESOLVED',
    });
    mockPrisma.guestComplaint.update.mockResolvedValue({
      id: 'gc-1',
      status: 'CLOSED',
    });
    const row = await service.close('gc-1', { closedBy: 'usr-1' });
    expect(row.status).toBe('CLOSED');
  });

  it('throws when complaint is missing', async () => {
    mockPrisma.guestComplaint.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('throws when linked guest is missing', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrisma.guest.findUnique.mockResolvedValue(null);
    await expect(
      service.create({
        propertyId: 'prop-1',
        guestId: 'gst-missing',
        category: 'Service',
        subject: 'Slow check-in',
        description: 'Waited 30 minutes',
        openedBy: 'usr-1',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
