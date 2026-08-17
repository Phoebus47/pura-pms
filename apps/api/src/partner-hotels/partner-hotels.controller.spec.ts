import { Test, TestingModule } from '@nestjs/testing';
import { PartnerHotelsController } from './partner-hotels.controller';
import { PartnerHotelsService } from './partner-hotels.service';
import { CreatePartnerHotelDto } from './dto/create-partner-hotel.dto';
import { UpdatePartnerHotelDto } from './dto/update-partner-hotel.dto';

const mockPartnerHotelsService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
};

describe('PartnerHotelsController', () => {
  let controller: PartnerHotelsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerHotelsController],
      providers: [
        { provide: PartnerHotelsService, useValue: mockPartnerHotelsService },
      ],
    }).compile();

    controller = module.get<PartnerHotelsController>(PartnerHotelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a partner hotel', async () => {
      const dto: CreatePartnerHotelDto = {
        propertyId: 'prop-1',
        name: 'Grand Partner Hotel',
      };
      mockPartnerHotelsService.create.mockResolvedValue({ id: '1', ...dto });
      await controller.create(dto);
      expect(mockPartnerHotelsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should find all', async () => {
      mockPartnerHotelsService.findAll.mockResolvedValue([]);
      await controller.findAll('prop-1');
      expect(mockPartnerHotelsService.findAll).toHaveBeenCalledWith('prop-1');
    });

    it('should find all with undefined params', async () => {
      mockPartnerHotelsService.findAll.mockResolvedValue([]);
      await controller.findAll(undefined);
      expect(mockPartnerHotelsService.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      mockPartnerHotelsService.findOne.mockResolvedValue({ id: '1' });
      await controller.findOne('1');
      expect(mockPartnerHotelsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update', async () => {
      const dto: UpdatePartnerHotelDto = { isActive: false };
      mockPartnerHotelsService.update.mockResolvedValue({ id: '1', ...dto });
      await controller.update('1', dto);
      expect(mockPartnerHotelsService.update).toHaveBeenCalledWith('1', dto);
    });
  });
});
