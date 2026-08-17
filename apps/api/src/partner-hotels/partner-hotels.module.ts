import { Module } from '@nestjs/common';
import { PartnerHotelsService } from './partner-hotels.service';
import { PartnerHotelsController } from './partner-hotels.controller';

@Module({
  controllers: [PartnerHotelsController],
  providers: [PartnerHotelsService],
  exports: [PartnerHotelsService],
})
export class PartnerHotelsModule {}
