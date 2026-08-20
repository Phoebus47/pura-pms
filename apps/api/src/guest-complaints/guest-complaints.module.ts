import { Module } from '@nestjs/common';
import { GuestComplaintsController } from './guest-complaints.controller';
import { GuestComplaintsService } from './guest-complaints.service';

@Module({
  controllers: [GuestComplaintsController],
  providers: [GuestComplaintsService],
  exports: [GuestComplaintsService],
})
export class GuestComplaintsModule {}
