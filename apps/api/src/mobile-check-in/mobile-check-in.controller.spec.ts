import { Test, TestingModule } from '@nestjs/testing';
import { MobileCheckInController } from './mobile-check-in.controller';
import { MobileCheckInService } from './mobile-check-in.service';

const mockMobileCheckInService = {
  lookup: vi.fn(),
  listAvailableRooms: vi.fn(),
  selectRoom: vi.fn(),
  checkIn: vi.fn(),
};

describe('MobileCheckInController', () => {
  let controller: MobileCheckInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobileCheckInController],
      providers: [
        { provide: MobileCheckInService, useValue: mockMobileCheckInService },
      ],
    }).compile();
    controller = module.get(MobileCheckInController);
    vi.clearAllMocks();
  });

  it('delegates lookup to the service with confirmNumber and lastName', async () => {
    mockMobileCheckInService.lookup.mockResolvedValue({
      confirmNumber: 'CN-1',
    });

    await controller.lookup('CN-1', 'Doe');

    expect(mockMobileCheckInService.lookup).toHaveBeenCalledWith('CN-1', 'Doe');
  });

  it('delegates available rooms lookup to the service', async () => {
    mockMobileCheckInService.listAvailableRooms.mockResolvedValue([]);

    await controller.listAvailableRooms('CN-1', 'Doe');

    expect(mockMobileCheckInService.listAvailableRooms).toHaveBeenCalledWith(
      'CN-1',
      'Doe',
    );
  });

  it('delegates room selection to the service', async () => {
    mockMobileCheckInService.selectRoom.mockResolvedValue({
      confirmNumber: 'CN-1',
    });

    await controller.selectRoom('CN-1', { roomId: 'room-2' });

    expect(mockMobileCheckInService.selectRoom).toHaveBeenCalledWith('CN-1', {
      roomId: 'room-2',
    });
  });

  it('delegates check-in to the service', async () => {
    mockMobileCheckInService.checkIn.mockResolvedValue({
      reservation: { confirmNumber: 'CN-1' },
      digitalKey: { status: 'UNAVAILABLE', message: 'stub' },
    });

    await controller.checkIn('CN-1', { lastName: 'Doe' });

    expect(mockMobileCheckInService.checkIn).toHaveBeenCalledWith(
      'CN-1',
      'Doe',
    );
  });
});
