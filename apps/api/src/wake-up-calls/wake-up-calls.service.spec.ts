import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WakeUpCallsService } from './wake-up-calls.service';

const reservationRow = {
  id: 'res-1',
  status: 'CHECKED_IN',
  roomId: 'room-1',
  room: {
    property: { id: 'prop-1' },
  },
};

const mockPrisma = {
  wakeUpCall: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  reservation: {
    findUnique: vi.fn(),
  },
};

describe('WakeUpCallsService', () => {
  let service: WakeUpCallsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WakeUpCallsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(WakeUpCallsService);
    vi.clearAllMocks();
  });

  it('lists by property and date', async () => {
    mockPrisma.wakeUpCall.findMany.mockResolvedValue([]);
    await service.findAll({
      propertyId: 'prop-1',
      scheduledDate: '2026-08-19',
    });
    expect(mockPrisma.wakeUpCall.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ propertyId: 'prop-1' }),
      }),
    );
  });

  it('requires propertyId or reservationId', () => {
    expect(() => service.findAll({})).toThrow(BadRequestException);
  });

  it('creates a scheduled wake-up call', async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue(reservationRow);
    mockPrisma.wakeUpCall.create.mockResolvedValue({ id: 'wu-1' });
    const row = await service.create({
      reservationId: 'res-1',
      scheduledAt: '2026-08-19T06:00:00.000Z',
      scheduledBy: 'user-1',
    });
    expect(row.id).toBe('wu-1');
    expect(mockPrisma.wakeUpCall.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'SCHEDULED',
          propertyId: 'prop-1',
          roomId: 'room-1',
        }),
      }),
    );
  });

  it('rejects create when reservation has no room', async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue({
      ...reservationRow,
      roomId: null,
      room: null,
    });
    await expect(
      service.create({
        reservationId: 'res-1',
        scheduledAt: '2026-08-19T06:00:00.000Z',
        scheduledBy: 'user-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects create for cancelled reservation', async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue({
      ...reservationRow,
      status: 'CANCELLED',
    });
    await expect(
      service.create({
        reservationId: 'res-1',
        scheduledAt: '2026-08-19T06:00:00.000Z',
        scheduledBy: 'user-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('completes a scheduled call', async () => {
    mockPrisma.wakeUpCall.findUnique.mockResolvedValue({
      id: 'wu-1',
      status: 'SCHEDULED',
    });
    mockPrisma.wakeUpCall.update.mockResolvedValue({
      id: 'wu-1',
      status: 'COMPLETED',
    });
    const row = await service.complete('wu-1', { completedBy: 'user-1' });
    expect(row.status).toBe('COMPLETED');
  });

  it('throws when call not found', async () => {
    mockPrisma.wakeUpCall.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
