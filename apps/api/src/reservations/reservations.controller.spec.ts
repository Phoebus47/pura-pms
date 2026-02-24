import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@pura/database';

const mockReservationsService = {
  create: vi.fn(),
  findAll: vi.fn(),
  getCalendar: vi.fn(),
  findByConfirmNumber: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  checkIn: vi.fn(),
  checkOut: vi.fn(),
  cancel: vi.fn(),
};

describe('ReservationsController', () => {
  let controller: ReservationsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be instantiated explicitly', () => {
    const explicitController = new ReservationsController(
      mockReservationsService as unknown as ReservationsService,
    );
    expect(explicitController).toBeDefined();
  });

  describe('create', () => {
    it('should create reservation', async () => {
      const dto: CreateReservationDto = {
        guestId: 'guest-1',
        roomId: 'room-1',
        checkIn: new Date().toISOString(),
        checkOut: new Date().toISOString(),
        adults: 2,
        children: 0,
        roomRate: 100,
      };
      mockReservationsService.create.mockResolvedValue({ id: '1', ...dto });
      await controller.create(dto);
      expect(mockReservationsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should find all with filters', async () => {
      mockReservationsService.findAll.mockResolvedValue([]);
      await controller.findAll(
        'prop-1',
        ReservationStatus.CONFIRMED,
        '2024-01-01',
        '2024-01-02',
        'guest-1',
      );
      expect(mockReservationsService.findAll).toHaveBeenCalledWith(
        'prop-1',
        ReservationStatus.CONFIRMED,
        expect.any(Date),
        expect.any(Date),
        'guest-1',
      );
    });

    it('should find all with undefined params', async () => {
      mockReservationsService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockReservationsService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('getCalendar', () => {
    it('should get calendar', async () => {
      mockReservationsService.getCalendar.mockResolvedValue([]);
      await controller.getCalendar(
        'prop-1',
        '2024-01-01',
        '2024-01-31',
        'type-1',
      );
      expect(mockReservationsService.getCalendar).toHaveBeenCalledWith(
        'prop-1',
        expect.any(Date),
        expect.any(Date),
        'type-1',
      );
    });
  });

  describe('findByConfirmNumber', () => {
    it('should find by confirm number', async () => {
      mockReservationsService.findByConfirmNumber.mockResolvedValue({
        id: '1',
      });
      await controller.findByConfirmNumber('CONF-1');
      expect(mockReservationsService.findByConfirmNumber).toHaveBeenCalledWith(
        'CONF-1',
      );
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      mockReservationsService.findOne.mockResolvedValue({ id: '1' });
      await controller.findOne('1');
      expect(mockReservationsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update reservation', async () => {
      const dto: UpdateReservationDto = { status: ReservationStatus.CONFIRMED };
      mockReservationsService.update.mockResolvedValue({ id: '1', ...dto });
      await controller.update('1', dto);
      expect(mockReservationsService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('checkIn', () => {
    it('should check in', async () => {
      mockReservationsService.checkIn.mockResolvedValue({
        id: '1',
        status: ReservationStatus.CHECKED_IN,
      });
      await controller.checkIn('1');
      expect(mockReservationsService.checkIn).toHaveBeenCalledWith('1');
    });
  });

  describe('checkOut', () => {
    it('should check out', async () => {
      mockReservationsService.checkOut.mockResolvedValue({
        id: '1',
        status: ReservationStatus.CHECKED_OUT,
      });
      await controller.checkOut('1');
      expect(mockReservationsService.checkOut).toHaveBeenCalledWith('1');
    });
  });

  describe('cancel', () => {
    it('should cancel reservation', async () => {
      mockReservationsService.cancel.mockResolvedValue({
        id: '1',
        status: ReservationStatus.CANCELLED,
      });
      await controller.cancel('1', 'reason');
      expect(mockReservationsService.cancel).toHaveBeenCalledWith(
        '1',
        'reason',
      );
    });
  });

  describe('remove', () => {
    it('should throw error', () => {
      expect(() => controller.remove('1')).toThrow(Error);
    });
  });
});
