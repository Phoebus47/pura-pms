import { Module } from '@nestjs/common';
import { GuestFeedbackController } from './guest-feedback.controller';
import { GuestFeedbackService } from './guest-feedback.service';

@Module({
  controllers: [GuestFeedbackController],
  providers: [GuestFeedbackService],
  exports: [GuestFeedbackService],
})
export class GuestFeedbackModule {}
