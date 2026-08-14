import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FindTaxInvoicesQueryDto } from './dto/find-tax-invoices-query.dto';
import { IssueTaxInvoiceDto } from './dto/issue-tax-invoice.dto';
import { VoidTaxInvoiceDto } from './dto/void-tax-invoice.dto';
import { TaxInvoicesService } from './tax-invoices.service';

@Controller('tax-invoices')
@UseGuards(JwtAuthGuard)
export class TaxInvoicesController {
  constructor(private readonly taxInvoicesService: TaxInvoicesService) {}

  @Get()
  findAll(@Query() query: FindTaxInvoicesQueryDto) {
    return this.taxInvoicesService.findAll(
      query.propertyId,
      query.businessDate,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxInvoicesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  issue(@Body() dto: IssueTaxInvoiceDto) {
    return this.taxInvoicesService.issue(dto);
  }

  @Post(':id/void')
  voidInvoice(@Param('id') id: string, @Body() dto: VoidTaxInvoiceDto) {
    return this.taxInvoicesService.void(id, dto);
  }
}
