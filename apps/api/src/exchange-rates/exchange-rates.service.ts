import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { postingRateQuery } from './exchange-rate-query';

@Injectable()
export class ExchangeRatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    return this.prisma.exchangeRate.findMany({
      where: { isActive: true },
      orderBy: [{ effectiveDate: 'desc' }, { targetCurrency: 'asc' }],
    });
  }

  /**
   * Guest currency is targetCurrency; property currency is baseCurrency.
   * Rate = how many base units per 1 target (e.g. USD→THB 35 means 1 USD = 35 THB).
   * Returns the most recent active rate with effectiveDate <= businessDate.
   */
  async findRateForPosting(
    baseCurrency: string,
    targetCurrency: string,
    businessDate: string,
  ) {
    return this.prisma.exchangeRate.findFirst(
      postingRateQuery(baseCurrency, targetCurrency, new Date(businessDate)),
    );
  }

  async findForDate(
    baseCurrency: string,
    targetCurrency: string,
    date: string,
  ) {
    const rate = await this.findRateForPosting(
      baseCurrency,
      targetCurrency,
      date,
    );
    if (!rate) {
      throw new NotFoundException('Exchange rate not found');
    }
    return rate;
  }

  async create(dto: CreateExchangeRateDto) {
    try {
      return await this.prisma.exchangeRate.create({
        data: {
          baseCurrency: dto.baseCurrency.toUpperCase(),
          targetCurrency: dto.targetCurrency.toUpperCase(),
          rate: dto.rate,
          effectiveDate: new Date(dto.effectiveDate),
        },
      });
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Exchange rate already exists for this pair and date',
        );
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateExchangeRateDto) {
    try {
      return await this.prisma.exchangeRate.update({
        where: { id },
        data: dto,
      });
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('Exchange rate not found');
      }
      throw err;
    }
  }
}
