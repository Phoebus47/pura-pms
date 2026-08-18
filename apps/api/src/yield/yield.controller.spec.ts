import { Test, TestingModule } from '@nestjs/testing';
import { YieldController } from './yield.controller';
import { YieldService } from './yield.service';

const mockYieldService = {
  getPace: vi.fn(),
  generateRecommendations: vi.fn(),
  listRecommendations: vi.fn(),
  applyRecommendation: vi.fn(),
  dismissRecommendation: vi.fn(),
  createCompetitorRate: vi.fn(),
  listCompetitorRates: vi.fn(),
  updateCompetitorRate: vi.fn(),
};

describe('YieldController', () => {
  let controller: YieldController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YieldController],
      providers: [{ provide: YieldService, useValue: mockYieldService }],
    }).compile();
    controller = module.get<YieldController>(YieldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns pace for a property', async () => {
    mockYieldService.getPace.mockResolvedValue({ days: [] });
    await controller.getPace({
      propertyId: 'prop-1',
      from: '2026-08-18',
      to: '2026-08-20',
    });
    expect(mockYieldService.getPace).toHaveBeenCalledWith(
      'prop-1',
      '2026-08-18',
      '2026-08-20',
    );
  });

  it('lists and generates recommendations', async () => {
    mockYieldService.listRecommendations.mockResolvedValue([]);
    mockYieldService.generateRecommendations.mockResolvedValue([]);
    await controller.listRecommendations({
      propertyId: 'prop-1',
      status: 'PENDING',
    });
    await controller.generateRecommendations({ propertyId: 'prop-1' });
    expect(mockYieldService.listRecommendations).toHaveBeenCalledWith(
      'prop-1',
      'PENDING',
    );
    expect(mockYieldService.generateRecommendations).toHaveBeenCalledWith(
      'prop-1',
    );
  });

  it('applies and dismisses a recommendation', async () => {
    await controller.applyRecommendation('rec-1');
    await controller.dismissRecommendation('rec-1');
    expect(mockYieldService.applyRecommendation).toHaveBeenCalledWith('rec-1');
    expect(mockYieldService.dismissRecommendation).toHaveBeenCalledWith(
      'rec-1',
    );
  });

  it('creates and lists competitor rates', async () => {
    const dto = {
      propertyId: 'prop-1',
      competitorName: 'Hotel B',
      stayDate: '2026-08-20',
      amount: 900,
    };
    await controller.createCompetitorRate(dto);
    await controller.listCompetitorRates({ propertyId: 'prop-1' });
    await controller.updateCompetitorRate('comp-1', { amount: 850 });
    expect(mockYieldService.createCompetitorRate).toHaveBeenCalledWith(dto);
    expect(mockYieldService.listCompetitorRates).toHaveBeenCalledWith('prop-1');
    expect(mockYieldService.updateCompetitorRate).toHaveBeenCalledWith(
      'comp-1',
      { amount: 850 },
    );
  });
});
