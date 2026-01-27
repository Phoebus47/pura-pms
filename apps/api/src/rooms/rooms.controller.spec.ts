import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomStatus } from '@pura/database';

const mockRoomsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  getAvailability: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  remove: jest.fn(),
};

describe('RoomsController', () => {
  let controller: RoomsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be instantiated explicitly', () => {
    const explicitController = new RoomsController(
      mockRoomsService as unknown as RoomsService,
    );
    expect(explicitController).toBeDefined();
  });

  describe('create', () => {
    it('should create room', async () => {
      const dto: CreateRoomDto = {
        propertyId: 'prop-1',
        roomTypeId: 'type-1',
        number: '101',
        floor: 1,
        status: RoomStatus.VACANT_CLEAN,
      };
      mockRoomsService.create.mockResolvedValue({ id: '1', ...dto });
      await controller.create(dto);
      expect(mockRoomsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should find all', async () => {
      mockRoomsService.findAll.mockResolvedValue([]);
      await controller.findAll('prop-1', 'type-1', RoomStatus.VACANT_CLEAN);
      expect(mockRoomsService.findAll).toHaveBeenCalledWith(
        'prop-1',
        'type-1',
        RoomStatus.VACANT_CLEAN,
      );
    });

    it('should find all with undefined params', async () => {
      mockRoomsService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockRoomsService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
    });

    it('should find all with mixed params', async () => {
      mockRoomsService.findAll.mockResolvedValue([]);
      await controller.findAll('prop-1', undefined, undefined);
      expect(mockRoomsService.findAll).toHaveBeenCalledWith(
        'prop-1',
        undefined,
        undefined,
      );

      await controller.findAll(undefined, 'type-1', undefined);
      expect(mockRoomsService.findAll).toHaveBeenCalledWith(
        undefined,
        'type-1',
        undefined,
      );

      await controller.findAll(undefined, undefined, RoomStatus.VACANT_CLEAN);
      expect(mockRoomsService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        RoomStatus.VACANT_CLEAN,
      );
    });
  });

  describe('getAvailability', () => {
    it('should get availability', async () => {
      mockRoomsService.getAvailability.mockResolvedValue([]);
      await controller.getAvailability(
        'prop-1',
        '2024-01-01',
        '2024-01-02',
        'type-1',
      );
      expect(mockRoomsService.getAvailability).toHaveBeenCalledWith(
        'prop-1',
        expect.any(Date),
        expect.any(Date),
        'type-1',
      );
    });

    it('should get availability without roomType', async () => {
      mockRoomsService.getAvailability.mockResolvedValue([]);
      await controller.getAvailability(
        'prop-1',
        '2024-01-01',
        '2024-01-02',
        undefined,
      );
      expect(mockRoomsService.getAvailability).toHaveBeenCalledWith(
        'prop-1',
        expect.any(Date),
        expect.any(Date),
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      mockRoomsService.findOne.mockResolvedValue({ id: '1' });
      await controller.findOne('1');
      expect(mockRoomsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update room', async () => {
      const dto: UpdateRoomDto = { number: '102' };
      mockRoomsService.update.mockResolvedValue({ id: '1', ...dto });
      await controller.update('1', dto);
      expect(mockRoomsService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      mockRoomsService.updateStatus.mockResolvedValue({
        id: '1',
        status: RoomStatus.VACANT_DIRTY,
      });
      await controller.updateStatus('1', RoomStatus.VACANT_DIRTY);
      expect(mockRoomsService.updateStatus).toHaveBeenCalledWith(
        '1',
        RoomStatus.VACANT_DIRTY,
      );
    });
  });

  describe('remove', () => {
    it('should remove room', async () => {
      mockRoomsService.remove.mockResolvedValue({ id: '1' });
      await controller.remove('1');
      expect(mockRoomsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
