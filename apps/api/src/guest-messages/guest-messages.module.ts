import { Module } from '@nestjs/common';
import { GuestMessagesController } from './guest-messages.controller';
import { GuestMessagesService } from './guest-messages.service';

@Module({
  controllers: [GuestMessagesController],
  providers: [GuestMessagesService],
  exports: [GuestMessagesService],
})
export class GuestMessagesModule {}
