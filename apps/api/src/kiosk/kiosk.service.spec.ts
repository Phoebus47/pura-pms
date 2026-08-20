import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { KioskService } from './kiosk.service';

const mockReservationsService = {
  findByConfirmNumber: vi.fn(),
  checkIn: vi.fn(),
};

describe('KioskService', () => {
  let service: KioskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KioskService,
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();
    service = module.get(KioskService);
    vi.clearAllMocks();
  });

  it('checks in by confirmation number', async () => {
    mockReservationsService.findByConfirmNumber.mockResolvedValue({
      id: 'res-1',
      confirmNumber: 'CN-123',
      room: { propertyId: 'prop-1' },
    });
    mockReservationsService.checkIn.mockResolvedValue({
      id: 'res-1',
      status: 'CHECKED_IN',
    });

    const result = await service.checkIn({ confirmNumber: 'CN-123' });

    expect(mockReservationsService.findByConfirmNumber).toHaveBeenCalledWith(
      'CN-123',
    );
    expect(mockReservationsService.checkIn).toHaveBeenCalledWith('res-1');
    expect(result.status).toBe('CHECKED_IN');
  });

  it('trims confirmation number before lookup', async () => {
    mockReservationsService.findByConfirmNumber.mockResolvedValue({
      id: 'res-1',
      room: { propertyId: 'prop-1' },
    });
    mockReservationsService.checkIn.mockResolvedValue({ id: 'res-1' });

    await service.checkIn({ confirmNumber: '  CN-123  ' });

    expect(mockReservationsService.findByConfirmNumber).toHaveBeenCalledWith(
      'CN-123',
    );
  });

  it('rejects when propertyId does not match room property', async () => {
    mockReservationsService.findByConfirmNumber.mockResolvedValue({
      id: 'res-1',
      room: { propertyId: 'prop-1' },
    });

    await expect(
      service.checkIn({ confirmNumber: 'CN-123', propertyId: 'prop-2' }),
    ).rejects.toThrow(BadRequestException);
    expect(mockReservationsService.checkIn).not.toHaveBeenCalled();
  });

  it('allows check-in when propertyId matches room property', async () => {
    mockReservationsService.findByConfirmNumber.mockResolvedValue({
      id: 'res-1',
      room: { propertyId: 'prop-1' },
    });
    mockReservationsService.checkIn.mockResolvedValue({ id: 'res-1' });

    await service.checkIn({ confirmNumber: 'CN-123', propertyId: 'prop-1' });

    expect(mockReservationsService.checkIn).toHaveBeenCalledWith('res-1');
  });
});
