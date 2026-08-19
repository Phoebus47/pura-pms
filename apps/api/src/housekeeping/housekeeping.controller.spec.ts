import { Test, TestingModule } from '@nestjs/testing';
import { HousekeepingController } from './housekeeping.controller';
import { HousekeepingService } from './housekeeping.service';

const mockHousekeepingService = {
  board: vi.fn(),
  checklist: vi.fn(),
  markClean: vi.fn(),
  setGuestRequest: vi.fn(),
  inspections: vi.fn(),
  inspect: vi.fn(),
};

describe('HousekeepingController', () => {
  let controller: HousekeepingController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HousekeepingController],
      providers: [
        { provide: HousekeepingService, useValue: mockHousekeepingService },
      ],
    }).compile();
    controller = module.get<HousekeepingController>(HousekeepingController);
  });

  it('returns the board and checklist', async () => {
    mockHousekeepingService.board.mockResolvedValue([]);
    mockHousekeepingService.checklist.mockReturnValue([]);
    await controller.board({ propertyId: 'prop-1' });
    controller.checklist();
    expect(mockHousekeepingService.board).toHaveBeenCalledWith('prop-1');
    expect(mockHousekeepingService.checklist).toHaveBeenCalled();
  });

  it('marks clean and inspects', async () => {
    await controller.markClean('room-1');
    await controller.setGuestRequest('room-1', {
      request: 'DND',
      updatedBy: 'usr-1',
    });
    await controller.inspect('room-1', {
      inspectedBy: 'usr-1',
      lines: [],
    });
    await controller.inspections('room-1');
    expect(mockHousekeepingService.markClean).toHaveBeenCalledWith('room-1');
    expect(mockHousekeepingService.setGuestRequest).toHaveBeenCalledWith(
      'room-1',
      { request: 'DND', updatedBy: 'usr-1' },
    );
    expect(mockHousekeepingService.inspect).toHaveBeenCalledWith('room-1', {
      inspectedBy: 'usr-1',
      lines: [],
    });
    expect(mockHousekeepingService.inspections).toHaveBeenCalledWith('room-1');
  });
});
