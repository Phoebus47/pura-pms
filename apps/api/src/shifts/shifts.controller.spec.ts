import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { ApproveShiftDto } from './dto/approve-shift.dto';
import { HandoverShiftDto } from './dto/handover-shift.dto';

const mockShiftsService = {
  open: vi.fn(),
  findCurrent: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  close: vi.fn(),
  approve: vi.fn(),
  handover: vi.fn(),
};

describe('ShiftsController', () => {
  let controller: ShiftsController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftsController],
      providers: [{ provide: ShiftsService, useValue: mockShiftsService }],
    }).compile();
    controller = module.get<ShiftsController>(ShiftsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should open a shift', async () => {
    const dto: OpenShiftDto = {
      propertyId: 'prop-1',
      userId: 'user-1',
      openingCash: 1000,
    };
    mockShiftsService.open.mockResolvedValue({ id: 'shift-1' });
    await controller.open(dto);
    expect(mockShiftsService.open).toHaveBeenCalledWith(dto);
  });

  it('should get the current open shift', async () => {
    mockShiftsService.findCurrent.mockResolvedValue({ id: 'shift-1' });
    await controller.findCurrent('prop-1', 'user-1');
    expect(mockShiftsService.findCurrent).toHaveBeenCalledWith(
      'prop-1',
      'user-1',
    );
  });

  it('should list shifts for a business date', async () => {
    mockShiftsService.findAll.mockResolvedValue([]);
    await controller.findAll('prop-1', '2026-08-14');
    expect(mockShiftsService.findAll).toHaveBeenCalledWith(
      'prop-1',
      '2026-08-14',
    );
  });

  it('should get a shift by id', async () => {
    mockShiftsService.findOne.mockResolvedValue({ id: 'shift-1' });
    await controller.findOne('shift-1');
    expect(mockShiftsService.findOne).toHaveBeenCalledWith('shift-1');
  });

  it('should close a shift', async () => {
    const dto: CloseShiftDto = { closingCash: 1000, userId: 'user-1' };
    mockShiftsService.close.mockResolvedValue({ status: 'BALANCED' });
    await controller.close('shift-1', dto);
    expect(mockShiftsService.close).toHaveBeenCalledWith('shift-1', dto);
  });

  it('should approve a shift', async () => {
    const dto: ApproveShiftDto = { userId: 'manager-1' };
    mockShiftsService.approve.mockResolvedValue({ status: 'BALANCED' });
    await controller.approve('shift-1', dto);
    expect(mockShiftsService.approve).toHaveBeenCalledWith('shift-1', dto);
  });

  it('should handover a shift', async () => {
    const dto: HandoverShiftDto = {
      toUserId: 'user-2',
      countedCash: 1000,
      userId: 'user-1',
    };
    mockShiftsService.handover.mockResolvedValue({ closed: {}, opened: {} });
    await controller.handover('shift-1', dto);
    expect(mockShiftsService.handover).toHaveBeenCalledWith('shift-1', dto);
  });
});
