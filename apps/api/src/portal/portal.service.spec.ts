import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { FoliosService } from '../folios/folios.service';
import { GuestMessagesService } from '../guest-messages/guest-messages.service';
import { PortalService } from './portal.service';
import { PORTAL_NOT_FOUND } from './portal-auth';

const mockReservationsService = {
  findByConfirmNumber: vi.fn(),
};
const mockFoliosService = {
  findByReservationId: vi.fn(),
};
const mockGuestMessagesService = {
  create: vi.fn(),
};

const reservation = {
  id: 'res-1',
  confirmNumber: 'CN-123',
  status: 'CHECKED_IN',
  checkIn: new Date('2026-01-01'),
  checkOut: new Date('2026-01-03'),
  nights: 2,
  guestId: 'gst-1',
  guest: { firstName: 'Jane', lastName: 'Smith' },
  room: { number: '101', propertyId: 'prop-1' },
};

describe('PortalService', () => {
  let service: PortalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalService,
        { provide: ReservationsService, useValue: mockReservationsService },
        { provide: FoliosService, useValue: mockFoliosService },
        { provide: GuestMessagesService, useValue: mockGuestMessagesService },
      ],
    }).compile();
    service = module.get(PortalService);
    vi.clearAllMocks();
  });

  describe('getReservationSummary', () => {
    it('returns a summary when the last name matches', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        reservation,
      );

      const result = await service.getReservationSummary('CN-123', 'Smith');

      expect(result).toMatchObject({
        id: 'res-1',
        confirmNumber: 'CN-123',
        room: { number: '101' },
        guest: { firstName: 'Jane', lastName: 'Smith' },
      });
    });

    it('rejects when the last name does not match', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        reservation,
      );

      await expect(
        service.getReservationSummary('CN-123', 'Jones'),
      ).rejects.toThrow(PORTAL_NOT_FOUND);
      await expect(
        service.getReservationSummary('CN-123', 'Jones'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFolioSummary', () => {
    it('flattens non-void transactions across folio windows', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        reservation,
      );
      mockFoliosService.findByReservationId.mockResolvedValue([
        {
          id: 'folio-1',
          folioNumber: 'F000001',
          status: 'OPEN',
          balance: 1500,
          windows: [
            {
              transactions: [
                {
                  id: 'trx-1',
                  businessDate: new Date('2026-01-01'),
                  trxCode: { description: 'Room Charge' },
                  amountTotal: 1500,
                  sign: 1,
                  isVoid: false,
                },
                {
                  id: 'trx-2',
                  businessDate: new Date('2026-01-01'),
                  trxCode: { description: 'Voided Item' },
                  amountTotal: 500,
                  sign: 1,
                  isVoid: true,
                },
              ],
            },
          ],
        },
      ]);

      const result = await service.getFolioSummary('CN-123', 'Smith');

      expect(result).toHaveLength(1);
      expect(result[0].transactions).toEqual([
        {
          id: 'trx-1',
          businessDate: new Date('2026-01-01'),
          description: 'Room Charge',
          amountTotal: 1500,
          sign: 1,
        },
      ]);
    });

    it('rejects when the last name does not match', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        reservation,
      );

      await expect(service.getFolioSummary('CN-123', 'Jones')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockFoliosService.findByReservationId).not.toHaveBeenCalled();
    });
  });

  describe('createServiceRequest', () => {
    it('creates an inbound in-app guest message', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        reservation,
      );
      mockGuestMessagesService.create.mockResolvedValue({ id: 'msg-1' });

      const result = await service.createServiceRequest('CN-123', {
        lastName: 'Smith',
        content: 'Extra towels please',
      });

      expect(mockGuestMessagesService.create).toHaveBeenCalledWith({
        propertyId: 'prop-1',
        guestId: 'gst-1',
        reservationId: 'res-1',
        direction: 'INBOUND',
        channel: 'IN_APP',
        content: 'Extra towels please',
      });
      expect(result).toEqual({ id: 'msg-1' });
    });

    it('rejects when the last name does not match', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue(
        reservation,
      );

      await expect(
        service.createServiceRequest('CN-123', {
          lastName: 'Jones',
          content: 'Hello',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockGuestMessagesService.create).not.toHaveBeenCalled();
    });
  });
});
