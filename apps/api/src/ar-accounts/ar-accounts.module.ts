import { Module } from '@nestjs/common';
import { ArAccountsController } from './ar-accounts.controller';
import { ArInvoicesController } from './ar-invoices.controller';
import { ArAccountsService } from './ar-accounts.service';

@Module({
  controllers: [ArAccountsController, ArInvoicesController],
  providers: [ArAccountsService],
  exports: [ArAccountsService],
})
export class ArAccountsModule {}
