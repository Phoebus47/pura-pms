import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NightAuditService } from './night-audit.service';
import { NightAuditProcessor } from './night-audit.processor';
import { NightAuditController } from './night-audit.controller';
import { FoliosModule } from '../folios/folios.module';
import { FinancialModule } from '../financial/financial.module';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'night-audit',
    }),
    FoliosModule,
    FinancialModule,
    ReservationsModule,
  ],
  controllers: [NightAuditController],
  providers: [NightAuditService, NightAuditProcessor],
  exports: [NightAuditService],
})
export class NightAuditModule {}
