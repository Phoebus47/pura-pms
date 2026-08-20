import { BadRequestException, Injectable } from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { KioskCheckInDto } from './dto/kiosk-check-in.dto';

@Injectable()
export class KioskService {
  constructor(private readonly reservationsService: ReservationsService) {}

  async checkIn(dto: KioskCheckInDto) {
    const reservation = await this.reservationsService.findByConfirmNumber(
      dto.confirmNumber.trim(),
    );

    if (dto.propertyId) {
      const roomPropertyId = reservation.room?.propertyId;
      if (roomPropertyId && roomPropertyId !== dto.propertyId) {
        throw new BadRequestException(
          'Reservation does not belong to this property',
        );
      }
    }

    return this.reservationsService.checkIn(reservation.id);
  }
}
