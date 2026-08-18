import { Module } from '@nestjs/common';
import { HardwareBridgeController } from './hardware-bridge.controller';
import { HardwareBridgeService } from './hardware-bridge.service';

@Module({
  controllers: [HardwareBridgeController],
  providers: [HardwareBridgeService],
})
export class HardwareBridgeModule {}
