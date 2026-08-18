import type {
  Guest,
  Property,
  Reservation,
  Room,
  RoomType,
} from '@pura/database';

export interface GuestSnapshot {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  idType: string | null;
  idNumber: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  address: string | null;
}

export interface StaySnapshot {
  confirmNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomNumber: string;
  roomTypeName: string | null;
  rateCode: string | null;
  roomRate: number;
}

export interface PropertySnapshot {
  name: string;
  address: string | null;
  phone: string | null;
  taxId: string | null;
}

type ReservationWithRelations = Reservation & {
  guest: Guest;
  room: Room & { roomType?: RoomType | null; property?: Property | null };
};

export function buildGuestSnapshot(guest: Guest): GuestSnapshot {
  return {
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone,
    idType: guest.idType,
    idNumber: guest.idNumber,
    nationality: guest.nationality,
    dateOfBirth: guest.dateOfBirth?.toISOString() ?? null,
    address: guest.address,
  };
}

export function buildStaySnapshot(
  reservation: ReservationWithRelations,
): StaySnapshot {
  return {
    confirmNumber: reservation.confirmNumber,
    checkIn: reservation.checkIn.toISOString(),
    checkOut: reservation.checkOut.toISOString(),
    nights: reservation.nights,
    adults: reservation.adults,
    children: reservation.children,
    roomNumber: reservation.room.number,
    roomTypeName: reservation.room.roomType?.name ?? null,
    rateCode: reservation.rateCode,
    roomRate: Number(reservation.roomRate),
  };
}

export function buildPropertySnapshot(property: Property): PropertySnapshot {
  return {
    name: property.name,
    address: property.address,
    phone: property.phone,
    taxId: property.taxId,
  };
}

export function buildSnapshots(reservation: ReservationWithRelations): {
  guestSnapshot: GuestSnapshot;
  staySnapshot: StaySnapshot;
  propertySnapshot: PropertySnapshot;
} {
  const property = reservation.room.property;
  if (!property) {
    throw new Error('Reservation room is missing property');
  }
  return {
    guestSnapshot: buildGuestSnapshot(reservation.guest),
    staySnapshot: buildStaySnapshot(reservation),
    propertySnapshot: buildPropertySnapshot(property),
  };
}
