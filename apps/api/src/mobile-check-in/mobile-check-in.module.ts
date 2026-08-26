import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { RoomsModule } from '../rooms/rooms.module';
import { MobileCheckInController } from './mobile-check-in.controller';
import { MobileCheckInService } from './mobile-check-in.service';

@Module({
  imports: [ReservationsModule, RoomsModule],
  controllers: [MobileCheckInController],
  providers: [MobileCheckInService],
})
export class MobileCheckInModule {}
