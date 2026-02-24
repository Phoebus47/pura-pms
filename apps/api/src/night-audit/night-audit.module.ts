import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NightAuditService } from './night-audit.service';
import { NightAuditProcessor } from './night-audit.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { FoliosModule } from '../folios/folios.module';

@Module({
  imports: [
    PrismaModule,
    FoliosModule,
    BullModule.registerQueue({
      name: 'night-audit',
    }),
  ],
  providers: [NightAuditService, NightAuditProcessor],
  exports: [NightAuditService],
})
export class NightAuditModule {}
