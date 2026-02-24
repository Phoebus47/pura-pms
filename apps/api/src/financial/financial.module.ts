import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsService } from './reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialController],
  providers: [FinancialService, ReportsService],
  exports: [FinancialService, ReportsService],
})
export class FinancialModule {}
