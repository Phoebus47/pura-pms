import { Test, TestingModule } from '@nestjs/testing';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';

const mockRatesService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
};

describe('RatesController', () => {
  let controller: RatesController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatesController],
      providers: [{ provide: RatesService, useValue: mockRatesService }],
    }).compile();

    controller = module.get<RatesController>(RatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a rate', async () => {
    const dto: CreateRateDto = {
      code: 'BAR',
      name: 'Best Available',
      roomTypeId: 'rt-1',
      propertyId: 'prop-1',
      amount: 1500,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    };
    mockRatesService.create.mockResolvedValue({ id: 'rate-1', ...dto });
    await controller.create(dto);
    expect(mockRatesService.create).toHaveBeenCalledWith(dto);
  });

  it('should find all rates', async () => {
    mockRatesService.findAll.mockResolvedValue([]);
    await controller.findAll({ propertyId: 'prop-1', roomTypeId: 'rt-1' });
    expect(mockRatesService.findAll).toHaveBeenCalledWith('prop-1', 'rt-1');
  });

  it('should find one rate', async () => {
    mockRatesService.findOne.mockResolvedValue({ id: 'rate-1' });
    await controller.findOne('rate-1');
    expect(mockRatesService.findOne).toHaveBeenCalledWith('rate-1');
  });

  it('should update a rate', async () => {
    const dto: UpdateRateDto = { amount: 1800 };
    mockRatesService.update.mockResolvedValue({ id: 'rate-1', ...dto });
    await controller.update('rate-1', dto);
    expect(mockRatesService.update).toHaveBeenCalledWith('rate-1', dto);
  });
});
