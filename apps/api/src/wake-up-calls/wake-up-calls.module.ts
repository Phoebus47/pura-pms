import { Module } from '@nestjs/common';
import { WakeUpCallsController } from './wake-up-calls.controller';
import { WakeUpCallsService } from './wake-up-calls.service';

@Module({
  controllers: [WakeUpCallsController],
  providers: [WakeUpCallsService],
  exports: [WakeUpCallsService],
})
export class WakeUpCallsModule {}
