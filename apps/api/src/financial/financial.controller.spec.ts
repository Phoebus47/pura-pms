import { Test, TestingModule } from '@nestjs/testing';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { ReportsService } from './reports.service';

const mockFinancialService = {
  findAllTransactionCodes: vi.fn(),
  findAllReasonCodes: vi.fn(),
};

const mockReportsService = {
  getDailyRevenueReport: vi.fn(),
};

describe('FinancialController', () => {
  let controller: FinancialController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialController],
      providers: [
        {
          provide: FinancialService,
          useValue: mockFinancialService,
        },
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<FinancialController>(FinancialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllTransactionCodes', () => {
    it('should delegate to financial service', async () => {
      const mockCodes = [{ id: '1', code: 'ROOM' }];
      mockFinancialService.findAllTransactionCodes.mockResolvedValue(mockCodes);

      const result = await controller.findAllTransactionCodes();

      expect(result).toEqual(mockCodes);
      expect(mockFinancialService.findAllTransactionCodes).toHaveBeenCalled();
    });
  });

  describe('findAllReasonCodes', () => {
    it('should delegate to financial service', async () => {
      const mockCodes = [{ id: '1', code: 'ADJ' }];
      mockFinancialService.findAllReasonCodes.mockResolvedValue(mockCodes);

      const result = await controller.findAllReasonCodes();

      expect(result).toEqual(mockCodes);
      expect(mockFinancialService.findAllReasonCodes).toHaveBeenCalled();
    });
  });

  describe('getDRR', () => {
    it('should delegate to reports service with parsed date', async () => {
      const mockReport = {
        businessDate: '2025-01-15',
        propertyId: 'prop-1',
        summary: {},
        totalRevenue: 0,
      };
      mockReportsService.getDailyRevenueReport.mockResolvedValue(mockReport);

      const result = await controller.getDRR('prop-1', '2025-01-15');

      expect(result).toEqual(mockReport);
      expect(mockReportsService.getDailyRevenueReport).toHaveBeenCalledWith(
        'prop-1',
        expect.any(Date),
      );
    });
  });
});
