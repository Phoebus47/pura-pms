import { Module } from '@nestjs/common';
import { HardwareBridgeModule } from '../hardware-bridge/hardware-bridge.module';
import { RegistrationCardsController } from './registration-cards.controller';
import { RegistrationCardsService } from './registration-cards.service';

@Module({
  imports: [HardwareBridgeModule],
  controllers: [RegistrationCardsController],
  providers: [RegistrationCardsService],
  exports: [RegistrationCardsService],
})
export class RegistrationCardsModule {}
