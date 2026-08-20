import { Module } from '@nestjs/common';
import { Tm30ReportsController } from './tm30-reports.controller';
import { Tm30ReportsService } from './tm30-reports.service';

@Module({
  controllers: [Tm30ReportsController],
  providers: [Tm30ReportsService],
  exports: [Tm30ReportsService],
})
export class Tm30ReportsModule {}
