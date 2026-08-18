import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HardwareBridgeService } from '../hardware-bridge/hardware-bridge.service';
import { RegistrationCardsService } from './registration-cards.service';

const validSignature = 'data:image/png;base64,' + 'A'.repeat(120);

const reservationRow = {
  id: 'res-1',
  confirmNumber: 'CN-001',
  checkIn: new Date('2026-08-18T14:00:00.000Z'),
  checkOut: new Date('2026-08-20T12:00:00.000Z'),
  nights: 2,
  adults: 2,
  children: 0,
  rateCode: 'BAR',
  roomRate: 2500,
  guest: {
    firstName: 'Somchai',
    lastName: 'Test',
    email: 's@test.com',
    phone: '081',
    idType: 'PASSPORT',
    idNumber: 'P123',
    nationality: 'TH',
    dateOfBirth: new Date('1990-01-01'),
    address: 'Bangkok',
  },
  room: {
    number: '101',
    roomType: { name: 'Deluxe' },
    property: {
      id: 'prop-1',
      name: 'Pura Hotel',
      address: 'BKK',
      phone: '02',
      taxId: '123',
    },
  },
};

const mockPrisma = {
  registrationCard: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  reservation: {
    findUnique: vi.fn(),
  },
};

const mockHardware = {
  createJob: vi.fn(),
};

describe('RegistrationCardsService', () => {
  let service: RegistrationCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationCardsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: HardwareBridgeService, useValue: mockHardware },
      ],
    }).compile();
    service = module.get(RegistrationCardsService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists cards by reservation', async () => {
    mockPrisma.registrationCard.findMany.mockResolvedValue([{ id: 'rc-1' }]);
    const rows = await service.findByReservation('res-1');
    expect(rows).toHaveLength(1);
    expect(mockPrisma.registrationCard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { reservationId: 'res-1' } }),
    );
  });

  it('throws when card not found', async () => {
    mockPrisma.registrationCard.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('creates draft with snapshots', async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue(reservationRow);
    mockPrisma.registrationCard.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.registrationCard.create.mockResolvedValue({ id: 'rc-1' });

    const card = await service.createDraft({
      reservationId: 'res-1',
      createdBy: 'user-1',
    });

    expect(card.id).toBe('rc-1');
    expect(mockPrisma.registrationCard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          propertyId: 'prop-1',
          version: 1,
          status: 'DRAFT',
        }),
      }),
    );
  });

  it('returns existing draft without creating', async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue(reservationRow);
    mockPrisma.registrationCard.findFirst.mockResolvedValueOnce({
      id: 'rc-draft',
      status: 'DRAFT',
    });

    const card = await service.createDraft({
      reservationId: 'res-1',
      createdBy: 'user-1',
    });

    expect(card.id).toBe('rc-draft');
    expect(mockPrisma.registrationCard.create).not.toHaveBeenCalled();
  });

  it('signs a draft card', async () => {
    mockPrisma.registrationCard.findUnique.mockResolvedValue({
      id: 'rc-1',
      status: 'DRAFT',
    });
    mockPrisma.registrationCard.update.mockResolvedValue({
      id: 'rc-1',
      status: 'SIGNED',
    });

    const signed = await service.sign('rc-1', {
      signatureData: validSignature,
      signedByGuestName: 'Somchai Test',
    });

    expect(signed.status).toBe('SIGNED');
  });

  it('rejects sign on non-draft', async () => {
    mockPrisma.registrationCard.findUnique.mockResolvedValue({
      id: 'rc-1',
      status: 'SIGNED',
    });
    await expect(
      service.sign('rc-1', {
        signatureData: validSignature,
        signedByGuestName: 'Somchai Test',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('voids a signed card', async () => {
    mockPrisma.registrationCard.findUnique.mockResolvedValue({
      id: 'rc-1',
      status: 'SIGNED',
    });
    mockPrisma.registrationCard.update.mockResolvedValue({
      id: 'rc-1',
      status: 'VOID',
    });

    const voided = await service.void('rc-1', {
      reason: 'Wrong signature',
      voidedBy: 'mgr-1',
    });

    expect(voided.status).toBe('VOID');
  });

  it('creates print job for signed card', async () => {
    mockPrisma.registrationCard.findUnique.mockResolvedValue({
      id: 'rc-1',
      status: 'SIGNED',
      propertyId: 'prop-1',
      reservationId: 'res-1',
      version: 1,
      reservation: { confirmNumber: 'CN-001' },
    });
    mockHardware.createJob.mockResolvedValue({ id: 'job-1' });

    const job = (await service.createPrintJob('rc-1', {
      requestedBy: 'user-1',
    })) as { id: string };

    expect(job.id).toBe('job-1');
    expect(mockHardware.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PRINT',
        payload: expect.objectContaining({ jobType: 'REG_CARD' }),
      }),
    );
  });

  it('rejects print job for draft card', async () => {
    mockPrisma.registrationCard.findUnique.mockResolvedValue({
      id: 'rc-1',
      status: 'DRAFT',
      reservation: { confirmNumber: 'CN-001' },
    });
    await expect(
      service.createPrintJob('rc-1', { requestedBy: 'user-1' }),
    ).rejects.toThrow(ConflictException);
  });
});
