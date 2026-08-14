interface CalendarGuest {
  id: string;
  firstName: string;
  lastName: string;
}

export interface CalendarReservationItem {
  id: string;
  confirmNumber: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  status: string;
  isDayUse: boolean;
  guest: CalendarGuest | null;
  roomRate: unknown;
  totalAmount: unknown;
  staySequence?: number;
}

interface HeaderReservationRow {
  id: string;
  confirmNumber: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  status: string;
  isDayUse: boolean;
  roomId: string;
  roomRate: unknown;
  totalAmount: unknown;
  guest: CalendarGuest | null;
}

interface StayOccupancyRow {
  sequence: number;
  startDate: Date;
  endDate: Date;
  nights: number;
  roomId: string;
  roomRate: unknown;
  reservation: {
    id: string;
    confirmNumber: string;
    status: string;
    totalAmount: unknown;
    guest: CalendarGuest | null;
  };
}

export function mapHeaderReservation(
  reservation: HeaderReservationRow,
): CalendarReservationItem {
  return {
    id: reservation.id,
    confirmNumber: reservation.confirmNumber,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    nights: reservation.nights,
    status: reservation.status,
    isDayUse: reservation.isDayUse,
    guest: reservation.guest,
    roomRate: reservation.roomRate,
    totalAmount: reservation.totalAmount,
  };
}

export function mapStayOccupancy(
  stay: StayOccupancyRow,
): CalendarReservationItem {
  return {
    id: stay.reservation.id,
    confirmNumber: stay.reservation.confirmNumber,
    checkIn: stay.startDate,
    checkOut: stay.endDate,
    nights: stay.nights,
    status: stay.reservation.status,
    isDayUse: false,
    guest: stay.reservation.guest,
    roomRate: stay.roomRate,
    totalAmount: stay.reservation.totalAmount,
    staySequence: stay.sequence,
  };
}
