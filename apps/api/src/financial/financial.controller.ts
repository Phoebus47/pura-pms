import { Controller, Get, Query } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { ReportsService } from './reports.service';

@Controller('financial')
export class FinancialController {
  constructor(
    private readonly financialService: FinancialService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get('transaction-codes')
  findAllTransactionCodes() {
    return this.financialService.findAllTransactionCodes();
  }

  @Get('reason-codes')
  findAllReasonCodes() {
    return this.financialService.findAllReasonCodes();
  }

  @Get('reports/drr')
  getDRR(@Query('propertyId') propertyId: string, @Query('date') date: string) {
    return this.reportsService.getDailyRevenueReport(
      propertyId,
      new Date(date),
    );
  }
}
