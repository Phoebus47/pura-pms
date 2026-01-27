import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

const mockPropertiesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PropertiesController', () => {
  let controller: PropertiesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
        },
      ],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be instantiated explicitly', () => {
    const explicitController = new PropertiesController(
      mockPropertiesService as unknown as PropertiesService,
    );
    expect(explicitController).toBeDefined();
  });

  describe('create', () => {
    it('should create property', async () => {
      const dto: CreatePropertyDto = {
        name: 'Prop 1',
        address: 'Addr',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
      };
      mockPropertiesService.create.mockResolvedValue({ id: '1', ...dto });
      const result = await controller.create(dto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockPropertiesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all properties', async () => {
      mockPropertiesService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockPropertiesService.findAll).toHaveBeenCalled();
    });

    it('should return all properties with undefined params', async () => {
      mockPropertiesService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockPropertiesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      mockPropertiesService.findOne.mockResolvedValue({ id: '1' });
      await controller.findOne('1');
      expect(mockPropertiesService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update property', async () => {
      const dto: UpdatePropertyDto = { name: 'Updated' };
      mockPropertiesService.update.mockResolvedValue({ id: '1', ...dto });
      await controller.update('1', dto);
      expect(mockPropertiesService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should remove property', async () => {
      mockPropertiesService.remove.mockResolvedValue({ id: '1' });
      await controller.remove('1');
      expect(mockPropertiesService.remove).toHaveBeenCalledWith('1');
    });
  });
});
