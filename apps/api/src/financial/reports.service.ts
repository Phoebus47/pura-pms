import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RevenueBucket {
  net: number;
  tax: number;
  service: number;
  total: number;
}

export interface DailyRevenueReport {
  businessDate: string;
  propertyId: string;
  summary: Record<string, RevenueBucket>;
  totalRevenue: number;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDailyRevenueReport(
    propertyId: string,
    date: Date,
  ): Promise<DailyRevenueReport> {
    this.logger.log(
      `Generating DRR for property ${propertyId} on ${date.toISOString()}`,
    );

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    // Get all transactions for the day
    const transactions = await this.prisma.folioTransaction.findMany({
      where: {
        businessDate: startDate,
        window: {
          folio: {
            reservation: {
              room: {
                propertyId,
              },
            },
          },
        },
        isVoid: false,
      },
      include: {
        trxCode: true,
      },
    });

    // Group by TrxGroup (ROOM, F&B, etc.)
    const summary = transactions.reduce<Record<string, RevenueBucket>>(
      (acc, trx) => {
        const group = trx.trxCode.group;
        if (!acc[group]) {
          acc[group] = { net: 0, tax: 0, service: 0, total: 0 };
        }
        acc[group].net += Number(trx.amountNet);
        acc[group].tax += Number(trx.amountTax);
        acc[group].service += Number(trx.amountService);
        acc[group].total += Number(trx.amountTotal);
        return acc;
      },
      {},
    );

    return {
      businessDate: date.toISOString().split('T')[0],
      propertyId,
      summary,
      totalRevenue: Object.values(summary).reduce((sum, g) => sum + g.total, 0),
    };
  }
}
