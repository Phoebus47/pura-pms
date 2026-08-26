import { BadRequestException, Injectable } from '@nestjs/common';
import { ReservationStatus } from '@pura/database';
import { ReservationsService } from '../reservations/reservations.service';
import { RoomsService, type RoomAvailability } from '../rooms/rooms.service';
import { SelectRoomDto } from './dto/select-room.dto';
import { buildDigitalKeyStub, type DigitalKeyStub } from './digital-key-stub';
import { assertLastNameMatches } from './guest-identity';
import {
  toMobileCheckInView,
  type MobileCheckInReservationView,
  type ReservationForMobileView,
} from './mobile-check-in-view';

const ROOM_CHANGE_WINDOW_MESSAGE = 'Rooms can only be changed before check-in';

export interface MobileCheckInResult {
  reservation: MobileCheckInReservationView;
  digitalKey: DigitalKeyStub;
}

@Injectable()
export class MobileCheckInService {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly roomsService: RoomsService,
  ) {}

  async lookup(
    confirmNumber: string,
    lastName?: string,
  ): Promise<MobileCheckInReservationView> {
    const reservation = await this.findVerifiedReservation(
      confirmNumber,
      lastName,
    );
    return toMobileCheckInView(reservation);
  }

  async listAvailableRooms(
    confirmNumber: string,
    lastName?: string,
  ): Promise<RoomAvailability[]> {
    const reservation = await this.findVerifiedReservation(
      confirmNumber,
      lastName,
    );
    this.assertRoomChangeEligible(reservation.status);

    const availability = await this.roomsService.getAvailability(
      reservation.room.propertyId,
      reservation.checkIn,
      reservation.checkOut,
      reservation.room.roomTypeId,
    );

    return availability.availability;
  }

  async selectRoom(
    confirmNumber: string,
    dto: SelectRoomDto,
  ): Promise<MobileCheckInReservationView> {
    const reservation = await this.findVerifiedReservation(
      confirmNumber,
      dto.lastName,
    );
    this.assertRoomChangeEligible(reservation.status);

    const updated = await this.reservationsService.update(reservation.id, {
      roomId: dto.roomId,
    });

    return toMobileCheckInView(updated as ReservationForMobileView);
  }

  async checkIn(
    confirmNumber: string,
    lastName?: string,
  ): Promise<MobileCheckInResult> {
    const reservation = await this.findVerifiedReservation(
      confirmNumber,
      lastName,
    );

    const checkedIn = await this.reservationsService.checkIn(reservation.id);

    return {
      reservation: toMobileCheckInView(checkedIn as ReservationForMobileView),
      digitalKey: buildDigitalKeyStub(),
    };
  }

  private async findVerifiedReservation(
    confirmNumber: string,
    lastName?: string,
  ) {
    const reservation = await this.reservationsService.findByConfirmNumber(
      confirmNumber.trim(),
    );
    assertLastNameMatches(reservation.guest.lastName, lastName);
    return reservation;
  }

  private assertRoomChangeEligible(status: ReservationStatus): void {
    if (status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(ROOM_CHANGE_WINDOW_MESSAGE);
    }
  }
}
