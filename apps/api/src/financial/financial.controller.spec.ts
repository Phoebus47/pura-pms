import { Test, TestingModule } from '@nestjs/testing';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { ReportsService } from './reports.service';

const mockFinancialService = {
  findAllTransactionCodes: vi.fn(),
  findTransactionCodeById: vi.fn(),
  createTransactionCode: vi.fn(),
  updateTransactionCode: vi.fn(),
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

  describe('findTransactionCodeById', () => {
    it('should delegate to financial service', async () => {
      const mockCode = { id: 'tc-1', code: '1000' };
      mockFinancialService.findTransactionCodeById.mockResolvedValue(mockCode);

      const result = await controller.findTransactionCodeById('tc-1');

      expect(result).toEqual(mockCode);
      expect(mockFinancialService.findTransactionCodeById).toHaveBeenCalledWith(
        'tc-1',
      );
    });
  });

  describe('createTransactionCode', () => {
    it('should delegate to financial service', async () => {
      const dto = {
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        serviceRate: 10,
        glAccountCode: '4000-01',
      };
      const created = { id: 'tc-1', ...dto };
      mockFinancialService.createTransactionCode.mockResolvedValue(created);

      const result = await controller.createTransactionCode(dto as never);

      expect(result).toEqual(created);
      expect(mockFinancialService.createTransactionCode).toHaveBeenCalledWith(
        dto,
      );
    });
  });

  describe('updateTransactionCode', () => {
    it('should delegate to financial service', async () => {
      const dto = { description: 'Updated' };
      const updated = { id: 'tc-1', code: '1000', description: 'Updated' };
      mockFinancialService.updateTransactionCode.mockResolvedValue(updated);

      const result = await controller.updateTransactionCode(
        'tc-1',
        dto as never,
      );

      expect(result).toEqual(updated);
      expect(mockFinancialService.updateTransactionCode).toHaveBeenCalledWith(
        'tc-1',
        dto,
      );
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
