import type { ReservationStatus } from '@pura/database';

export interface MobileCheckInRoomView {
  id: string;
  number: string;
  floor: number | null;
  roomType: {
    id: string;
    name: string;
    code: string;
  };
}

export interface MobileCheckInReservationView {
  confirmNumber: string;
  status: ReservationStatus;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  children: number;
  guestFirstName: string;
  guestLastName: string;
  room: MobileCheckInRoomView;
  propertyId: string;
}

export interface ReservationForMobileView {
  confirmNumber: string;
  status: ReservationStatus;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  children: number;
  guest: { firstName: string; lastName: string };
  room: {
    id: string;
    number: string;
    floor: number | null;
    propertyId: string;
    roomType: { id: string; name: string; code: string };
  };
}

/**
 * Maps a full reservation record (which may include folio/financial data
 * and the complete guest profile) to the minimal, guest-safe subset served
 * by the unauthenticated mobile check-in endpoints.
 */
export function toMobileCheckInView(
  reservation: ReservationForMobileView,
): MobileCheckInReservationView {
  return {
    confirmNumber: reservation.confirmNumber,
    status: reservation.status,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    nights: reservation.nights,
    adults: reservation.adults,
    children: reservation.children,
    guestFirstName: reservation.guest.firstName,
    guestLastName: reservation.guest.lastName,
    room: {
      id: reservation.room.id,
      number: reservation.room.number,
      floor: reservation.room.floor,
      roomType: {
        id: reservation.room.roomType.id,
        name: reservation.room.roomType.name,
        code: reservation.room.roomType.code,
      },
    },
    propertyId: reservation.room.propertyId,
  };
}
