import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tm30ReportsService } from './tm30-reports.service';

const stay = {
  id: 'res-1',
  guestId: 'gst-1',
  checkIn: new Date('2026-08-20T14:00:00.000Z'),
  checkOut: new Date('2026-08-22T12:00:00.000Z'),
  checkedInAt: new Date('2026-08-20T14:00:00.000Z'),
  guest: {
    firstName: 'Ann',
    lastName: 'Guest',
    nationality: 'US',
    idNumber: 'P123',
    dateOfBirth: new Date('1990-01-01T00:00:00.000Z'),
  },
  room: { number: '101' },
};

const mockPrisma = {
  property: { findUnique: vi.fn() },
  reservation: { findMany: vi.fn() },
  tm30Report: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('Tm30ReportsService', () => {
  let service: Tm30ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Tm30ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(Tm30ReportsService);
    vi.clearAllMocks();
  });

  it('requires propertyId to list', () => {
    expect(() => service.findAll({} as never)).toThrow(BadRequestException);
  });

  it('generates a pending report for a foreign in-house guest', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({
      id: 'prop-1',
      address: 'Bangkok',
    });
    mockPrisma.reservation.findMany.mockResolvedValue([stay]);
    mockPrisma.tm30Report.findUnique.mockResolvedValue(null);
    mockPrisma.tm30Report.create.mockResolvedValue({ id: 'tm-1' });

    const result = await service.generate({
      propertyId: 'prop-1',
      generatedBy: 'user-1',
    });

    expect(result.created).toHaveLength(1);
    expect(mockPrisma.tm30Report.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passportNumber: 'P123',
          nationality: 'US',
          roomNumber: '101',
        }),
      }),
    );
  });

  it('skips Thai nationals', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrisma.reservation.findMany.mockResolvedValue([
      { ...stay, guest: { ...stay.guest, nationality: 'TH' } },
    ]);

    const result = await service.generate({
      propertyId: 'prop-1',
      generatedBy: 'user-1',
    });

    expect(result.created).toHaveLength(0);
    expect(result.skipped[0].reason).toBe('THAI_NATIONAL');
  });

  it('submits a pending report', async () => {
    mockPrisma.tm30Report.findUnique.mockResolvedValue({
      id: 'tm-1',
      status: 'PENDING',
      referenceNo: null,
    });
    mockPrisma.tm30Report.update.mockResolvedValue({
      id: 'tm-1',
      status: 'SUBMITTED',
    });
    const row = await service.submit('tm-1', { submittedBy: 'user-1' });
    expect(row.status).toBe('SUBMITTED');
  });

  it('throws when report is missing', async () => {
    mockPrisma.tm30Report.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
