import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionCodeDto } from './dto/create-transaction-code.dto';
import { UpdateTransactionCodeDto } from './dto/update-transaction-code.dto';

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

  @Get('transaction-codes/:id')
  findTransactionCodeById(@Param('id') id: string) {
    return this.financialService.findTransactionCodeById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transaction-codes')
  createTransactionCode(@Body() dto: CreateTransactionCodeDto) {
    return this.financialService.createTransactionCode(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('transaction-codes/:id')
  updateTransactionCode(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionCodeDto,
  ) {
    return this.financialService.updateTransactionCode(id, dto);
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
