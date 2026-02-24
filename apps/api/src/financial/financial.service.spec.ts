import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from './financial.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  transactionCode: {
    findMany: vi.fn(),
  },
  reasonCode: {
    findMany: vi.fn(),
  },
};

describe('FinancialService', () => {
  let service: FinancialService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    prisma = module.get<PrismaService>(PrismaService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllTransactionCodes', () => {
    it('should return all transaction codes ordered by code', async () => {
      const mockCodes = [
        { id: '1', code: 'CASH', type: 'PAYMENT' },
        { id: '2', code: 'ROOM', type: 'CHARGE' },
      ];
      mockPrismaService.transactionCode.findMany.mockResolvedValue(mockCodes);

      const result = await service.findAllTransactionCodes();

      expect(result).toEqual(mockCodes);
      expect(prisma.transactionCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { code: 'asc' },
        }),
      );
    });
  });

  describe('findAllReasonCodes', () => {
    it('should return active reason codes ordered by code', async () => {
      const mockCodes = [{ id: '1', code: 'ADJ', isActive: true }];
      mockPrismaService.reasonCode.findMany.mockResolvedValue(mockCodes);

      const result = await service.findAllReasonCodes();

      expect(result).toEqual(mockCodes);
      expect(prisma.reasonCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          orderBy: { code: 'asc' },
        }),
      );
    });
  });
});
