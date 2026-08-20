import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { KioskController } from './kiosk.controller';
import { KioskService } from './kiosk.service';

@Module({
  imports: [ReservationsModule],
  controllers: [KioskController],
  providers: [KioskService],
})
export class KioskModule {}
