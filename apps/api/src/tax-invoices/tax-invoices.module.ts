import { Module } from '@nestjs/common';
import { TaxInvoicesController } from './tax-invoices.controller';
import { TaxInvoicesService } from './tax-invoices.service';

@Module({
  controllers: [TaxInvoicesController],
  providers: [TaxInvoicesService],
})
export class TaxInvoicesModule {}
