import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { summarizeFlash } from './reports-flash';
import {
  summarizeTrialBalance,
  type TrialBalanceReport,
} from './reports-trial-balance';

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

export interface DailyFlashReport {
  businessDate: string;
  propertyId: string;
  occupancy: {
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
  };
  arrivals: number;
  departures: number;
  stayOvers: number;
  roomRevenue: number;
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

    const startDate = this.startOfDay(date);
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

  async getDailyFlash(
    propertyId: string,
    date: Date,
  ): Promise<DailyFlashReport> {
    this.logger.log(
      `Generating Daily Flash for property ${propertyId} on ${date.toISOString()}`,
    );
    const day = this.startOfDay(date);
    const next = new Date(day);
    next.setUTCDate(next.getUTCDate() + 1);

    const [totalRooms, reservations, drr] = await Promise.all([
      this.prisma.room.count({ where: { propertyId } }),
      this.prisma.reservation.findMany({
        where: {
          room: { propertyId },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          OR: [
            { checkIn: { gte: day, lt: next } },
            { checkOut: { gte: day, lt: next } },
            { AND: [{ checkIn: { lt: day } }, { checkOut: { gt: day } }] },
          ],
        },
        select: {
          id: true,
          status: true,
          checkIn: true,
          checkOut: true,
          isDayUse: true,
          roomId: true,
        },
      }),
      this.getDailyRevenueReport(propertyId, date),
    ]);

    const stats = summarizeFlash(
      reservations,
      day,
      totalRooms,
      drr.summary.ROOM?.total ?? 0,
      drr.totalRevenue,
    );

    return {
      businessDate: date.toISOString().split('T')[0],
      propertyId,
      ...stats,
    };
  }

  async getTrialBalance(
    propertyId: string,
    date: Date,
  ): Promise<TrialBalanceReport> {
    const day = this.startOfDay(date);
    const lines = await this.prisma.journalLine.findMany({
      where: {
        journal: {
          propertyId,
          entryDate: day,
          isPosted: true,
        },
      },
      include: { account: true },
    });
    const summary = summarizeTrialBalance(lines);
    return {
      businessDate: date.toISOString().split('T')[0],
      propertyId,
      ...summary,
    };
  }

  private startOfDay(date: Date): Date {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    return startDate;
  }
}
