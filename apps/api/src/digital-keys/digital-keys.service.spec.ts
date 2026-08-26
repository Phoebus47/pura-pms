import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DigitalKeysService } from './digital-keys.service';

const mockPrisma = {
  reservation: { findUnique: vi.fn() },
  digitalKey: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('DigitalKeysService', () => {
  let service: DigitalKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalKeysService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(DigitalKeysService);
    vi.clearAllMocks();
  });

  describe('issue', () => {
    it('throws when reservation is missing', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);
      await expect(
        service.issue({ reservationId: 'res-1', issuedBy: 'usr-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when reservation status is not issuable', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'CHECKED_OUT',
        checkOut: new Date('2026-08-20T12:00:00.000Z'),
        room: { propertyId: 'prop-1', number: '101' },
      });
      await expect(
        service.issue({ reservationId: 'res-1', issuedBy: 'usr-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when reservation has no room assigned', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'CONFIRMED',
        checkOut: new Date('2026-08-20T12:00:00.000Z'),
        room: null,
      });
      await expect(
        service.issue({ reservationId: 'res-1', issuedBy: 'usr-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('issues a mock BLE credential expiring at checkout', async () => {
      const checkOut = new Date('2026-08-20T12:00:00.000Z');
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'CHECKED_IN',
        checkOut,
        room: { propertyId: 'prop-1', number: '101' },
      });
      mockPrisma.digitalKey.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => ({
          id: 'dk-1',
          ...data,
        }),
      );

      const key = await service.issue({
        reservationId: 'res-1',
        issuedBy: 'usr-1',
      });

      expect(mockPrisma.digitalKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            propertyId: 'prop-1',
            reservationId: 'res-1',
            roomNumber: '101',
            transport: 'BLE',
            status: 'ACTIVE',
            issuedBy: 'usr-1',
            expiresAt: checkOut,
          }),
        }),
      );
      expect(key.token).toMatch(/^DK-MOCK-/);
    });

    it('honors an explicit NFC transport', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'CONFIRMED',
        checkOut: new Date('2026-08-20T12:00:00.000Z'),
        room: { propertyId: 'prop-1', number: '101' },
      });
      mockPrisma.digitalKey.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => data,
      );

      const key = await service.issue({
        reservationId: 'res-1',
        issuedBy: 'usr-1',
        transport: 'NFC',
      });

      expect(key.transport).toBe('NFC');
    });
  });

  describe('issueByConfirmNumber', () => {
    it('looks up the reservation by trimmed confirmNumber', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'CHECKED_IN',
        checkOut: new Date('2026-08-20T12:00:00.000Z'),
        room: { propertyId: 'prop-1', number: '101' },
      });
      mockPrisma.digitalKey.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => data,
      );

      await service.issueByConfirmNumber({
        confirmNumber: '  CN-123  ',
        issuedBy: 'usr-1',
      });

      expect(mockPrisma.reservation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { confirmNumber: 'CN-123' } }),
      );
    });

    it('throws when reservation is not found', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);
      await expect(
        service.issueByConfirmNumber({
          confirmNumber: 'CN-404',
          issuedBy: 'usr-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('throws when the key is missing', async () => {
      mockPrisma.digitalKey.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revoke', () => {
    it('revokes an active key', async () => {
      mockPrisma.digitalKey.findUnique.mockResolvedValue({
        id: 'dk-1',
        status: 'ACTIVE',
      });
      mockPrisma.digitalKey.update.mockResolvedValue({
        id: 'dk-1',
        status: 'REVOKED',
      });

      const result = await service.revoke('dk-1', {
        revokedBy: 'usr-1',
        revokedReason: 'Guest checked out early',
      });

      expect(result.status).toBe('REVOKED');
      expect(mockPrisma.digitalKey.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dk-1' },
          data: expect.objectContaining({
            status: 'REVOKED',
            revokedBy: 'usr-1',
            revokedReason: 'Guest checked out early',
          }),
        }),
      );
    });

    it('rejects revoking a key that is not active', async () => {
      mockPrisma.digitalKey.findUnique.mockResolvedValue({
        id: 'dk-1',
        status: 'REVOKED',
      });
      await expect(
        service.revoke('dk-1', { revokedBy: 'usr-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
