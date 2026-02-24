import { Test, TestingModule } from '@nestjs/testing';
import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

const mockGuestsService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findByEmail: vi.fn(),
  findByPhone: vi.fn(),
  findOne: vi.fn(),
  getGuestHistory: vi.fn(),
  update: vi.fn(),
  updateVipLevel: vi.fn(),
  toggleBlacklist: vi.fn(),
  remove: vi.fn(),
};

describe('GuestsController', () => {
  let controller: GuestsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestsController],
      providers: [
        {
          provide: GuestsService,
          useValue: mockGuestsService,
        },
      ],
    }).compile();

    controller = module.get<GuestsController>(GuestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be instantiated explicitly', () => {
    const explicitController = new GuestsController(
      mockGuestsService as unknown as GuestsService,
    );
    expect(explicitController).toBeDefined();
  });

  describe('create', () => {
    it('should create a guest', async () => {
      const dto: CreateGuestDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123',
      };
      mockGuestsService.create.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(dto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockGuestsService.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate error', async () => {
      mockGuestsService.create.mockRejectedValue(new Error('Error'));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(controller.create({} as any)).rejects.toThrow('Error');
    });
  });

  describe('findAll', () => {
    it('should return all guests with filters', async () => {
      mockGuestsService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll('search', 'true', '1', '10', '0');
      expect(mockGuestsService.findAll).toHaveBeenCalledWith(
        'search',
        true,
        1,
        10,
        0,
      );
    });

    it('should handle undefined optional params', async () => {
      mockGuestsService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll();
      expect(mockGuestsService.findAll).toHaveBeenCalledWith(
        undefined,
        false,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find by email', async () => {
      mockGuestsService.findByEmail.mockResolvedValue({ id: '1' });
      await controller.findByEmail('test@test.com');
      expect(mockGuestsService.findByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
    });
  });

  describe('findByPhone', () => {
    it('should find by phone', async () => {
      mockGuestsService.findByPhone.mockResolvedValue({ id: '1' });
      await controller.findByPhone('123');
      expect(mockGuestsService.findByPhone).toHaveBeenCalledWith('123');
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      mockGuestsService.findOne.mockResolvedValue({ id: '1' });
      await controller.findOne('1');
      expect(mockGuestsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('getGuestHistory', () => {
    it('should get history', async () => {
      mockGuestsService.getGuestHistory.mockResolvedValue({});
      await controller.getGuestHistory('1');
      expect(mockGuestsService.getGuestHistory).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update guest', async () => {
      const dto: UpdateGuestDto = { firstName: 'Jane' };
      mockGuestsService.update.mockResolvedValue({ id: '1', ...dto });
      await controller.update('1', dto);
      expect(mockGuestsService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('updateVipLevel', () => {
    it('should update vip level', async () => {
      mockGuestsService.updateVipLevel.mockResolvedValue({
        id: '1',
        vipLevel: 2,
      });
      await controller.updateVipLevel('1', 2);
      expect(mockGuestsService.updateVipLevel).toHaveBeenCalledWith('1', 2);
    });
  });

  describe('toggleBlacklist', () => {
    it('should toggle blacklist', async () => {
      mockGuestsService.toggleBlacklist.mockResolvedValue({
        id: '1',
        isBlacklist: true,
      });
      await controller.toggleBlacklist('1');
      expect(mockGuestsService.toggleBlacklist).toHaveBeenCalledWith('1');
    });
  });

  describe('remove', () => {
    it('should remove guest', async () => {
      mockGuestsService.remove.mockResolvedValue({ id: '1' });
      await controller.remove('1');
      expect(mockGuestsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
