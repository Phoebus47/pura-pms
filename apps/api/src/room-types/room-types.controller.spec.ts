import { Test, TestingModule } from '@nestjs/testing';
import { RoomTypesController } from './room-types.controller';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

const mockRoomTypesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RoomTypesController', () => {
  let controller: RoomTypesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomTypesController],
      providers: [
        {
          provide: RoomTypesService,
          useValue: mockRoomTypesService,
        },
      ],
    }).compile();

    controller = module.get<RoomTypesController>(RoomTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be instantiated explicitly', () => {
    const explicitController = new RoomTypesController(
      mockRoomTypesService as unknown as RoomTypesService,
    );
    expect(explicitController).toBeDefined();
  });

  describe('create', () => {
    it('should create room type', async () => {
      const dto: CreateRoomTypeDto = {
        propertyId: 'prop-1',
        name: 'Deluxe',
        code: 'DLX',
        baseRate: 100,
        description: 'Desc',
        maxAdults: 2,
        maxChildren: 1,
        amenities: [],
      };
      mockRoomTypesService.create.mockResolvedValue({ id: '1', ...dto });
      await controller.create(dto);
      expect(mockRoomTypesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should find all', async () => {
      mockRoomTypesService.findAll.mockResolvedValue([]);
      await controller.findAll('prop-1');
      expect(mockRoomTypesService.findAll).toHaveBeenCalledWith('prop-1');
    });

    it('should find all with undefined params', async () => {
      mockRoomTypesService.findAll.mockResolvedValue([]);
      await controller.findAll(undefined);
      expect(mockRoomTypesService.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      mockRoomTypesService.findOne.mockResolvedValue({ id: '1' });
      await controller.findOne('1');
      expect(mockRoomTypesService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update', async () => {
      const dto: UpdateRoomTypeDto = { name: 'Updated' };
      mockRoomTypesService.update.mockResolvedValue({ id: '1', ...dto });
      await controller.update('1', dto);
      expect(mockRoomTypesService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should remove', async () => {
      mockRoomTypesService.remove.mockResolvedValue({ id: '1' });
      await controller.remove('1');
      expect(mockRoomTypesService.remove).toHaveBeenCalledWith('1');
    });
  });
});
