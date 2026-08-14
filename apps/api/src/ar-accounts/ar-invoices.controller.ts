import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArAccountsService } from './ar-accounts.service';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';
import { FindArInvoicesQueryDto } from './dto/find-ar-invoices-query.dto';

@Controller('ar-invoices')
@UseGuards(JwtAuthGuard)
export class ArInvoicesController {
  constructor(private readonly arAccountsService: ArAccountsService) {}

  @Get()
  findAll(@Query() query: FindArInvoicesQueryDto) {
    return this.arAccountsService.findInvoices(
      query.propertyId,
      query.arAccountId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arAccountsService.findInvoice(id);
  }

  @Post(':id/payments')
  allocate(@Param('id') id: string, @Body() dto: AllocatePaymentDto) {
    return this.arAccountsService.allocatePayment(id, dto);
  }
}
