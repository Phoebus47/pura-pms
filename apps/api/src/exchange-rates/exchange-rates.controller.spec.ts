import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';

const mockExchangeRatesService = {
  findActive: vi.fn(),
  findForDate: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

describe('ExchangeRatesController', () => {
  let controller: ExchangeRatesController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeRatesController],
      providers: [
        {
          provide: ExchangeRatesService,
          useValue: mockExchangeRatesService,
        },
      ],
    }).compile();
    controller = module.get<ExchangeRatesController>(ExchangeRatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list active rates when query filters are omitted', async () => {
    const rates = [{ id: 'fx-1' }];
    mockExchangeRatesService.findActive.mockResolvedValue(rates);

    const result = await controller.find({});

    expect(result).toEqual(rates);
    expect(mockExchangeRatesService.findActive).toHaveBeenCalled();
    expect(mockExchangeRatesService.findForDate).not.toHaveBeenCalled();
  });

  it('should look up a rate when base, target, and date are provided', async () => {
    const rate = { id: 'fx-1', rate: 35 };
    mockExchangeRatesService.findForDate.mockResolvedValue(rate);

    const result = await controller.find({
      baseCurrency: 'THB',
      targetCurrency: 'USD',
      date: '2026-08-14',
    });

    expect(result).toEqual(rate);
    expect(mockExchangeRatesService.findForDate).toHaveBeenCalledWith(
      'THB',
      'USD',
      '2026-08-14',
    );
  });

  it('should create an exchange rate', async () => {
    const dto = {
      baseCurrency: 'THB',
      targetCurrency: 'USD',
      rate: 35,
      effectiveDate: '2026-08-14',
    };
    const created = { id: 'fx-1', ...dto };
    mockExchangeRatesService.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(result).toEqual(created);
    expect(mockExchangeRatesService.create).toHaveBeenCalledWith(dto);
  });

  it('should update an exchange rate', async () => {
    const dto = { rate: 36, isActive: false };
    const updated = { id: 'fx-1', ...dto };
    mockExchangeRatesService.update.mockResolvedValue(updated);

    const result = await controller.update('fx-1', dto);

    expect(result).toEqual(updated);
    expect(mockExchangeRatesService.update).toHaveBeenCalledWith('fx-1', dto);
  });
});
