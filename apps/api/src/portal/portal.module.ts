import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { FoliosModule } from '../folios/folios.module';
import { GuestMessagesModule } from '../guest-messages/guest-messages.module';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

@Module({
  imports: [ReservationsModule, FoliosModule, GuestMessagesModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
