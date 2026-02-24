/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  folioTransaction: {
    findMany: vi.fn(),
  },
};

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDailyRevenueReport', () => {
    const testDate = new Date('2025-01-15');
    const params = {
      date: testDate,
      propertyId: 'prop-1',
    };

    // Consume variables
    void params;

    it('should return grouped revenue by trxCode group', async () => {
      const mockTransactions = [
        {
          amountNet: 1000,
          amountTax: 70,
          amountService: 100,
          amountTotal: 1170,
          trxCode: { group: 'ROOM' },
        },
        {
          amountNet: 500,
          amountTax: 35,
          amountService: 50,
          amountTotal: 585,
          trxCode: { group: 'ROOM' },
        },
        {
          amountNet: 200,
          amountTax: 14,
          amountService: 0,
          amountTotal: 214,
          trxCode: { group: 'F&B' },
        },
      ];
      mockPrismaService.folioTransaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getDailyRevenueReport('prop-1', testDate);

      expect(result.businessDate).toBe('2025-01-15');
      expect(result.propertyId).toBe('prop-1');
      expect(result.summary['ROOM']).toEqual({
        net: 1500,
        tax: 105,
        service: 150,
        total: 1755,
      });
      expect(result.summary['F&B']).toEqual({
        net: 200,
        tax: 14,
        service: 0,
        total: 214,
      });
      expect(result.totalRevenue).toBe(1969);
    });

    it('should return empty summary when no transactions', async () => {
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([]);

      const result = await service.getDailyRevenueReport('prop-1', testDate);

      expect(result.businessDate).toBe('2025-01-15');
      expect(result.summary).toEqual({});
      expect(result.totalRevenue).toBe(0);
    });

    it('should query with correct date and propertyId filter', async () => {
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([]);

      await service.getDailyRevenueReport('prop-1', testDate);

      const expectedDate = new Date('2025-01-15');
      expectedDate.setHours(0, 0, 0, 0);

      expect(prisma.folioTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({
            businessDate: expectedDate,
            isVoid: false,
            window: {
              folio: {
                reservation: {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  room: { propertyId: 'prop-1' } as any,
                },
              },
            },
          }),
          include: { trxCode: true },
        }),
      );
    });
  });
});
