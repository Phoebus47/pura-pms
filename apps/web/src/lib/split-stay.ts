export interface ReservationStayInput {
  startDate: string;
  endDate: string;
  roomId: string;
  roomRate: number;
  rateCode?: string;
}

export interface ReservationStay extends ReservationStayInput {
  id?: string;
  sequence: number;
  nights: number;
  roomTypeId?: string;
  room?: {
    id: string;
    number: string;
    roomType?: {
      id: string;
      name: string;
    };
  };
  roomType?: {
    id: string;
    name: string;
    code?: string;
  };
}

export function isSplitStay(reservation: {
  stays?: readonly unknown[];
}): boolean {
  return (reservation.stays?.length ?? 0) >= 2;
}

export function calendarNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function buildSplitStayPayload(input: {
  checkIn: string;
  splitDate: string;
  checkOut: string;
  firstRoomId: string;
  secondRoomId: string;
  firstRate: number;
  secondRate: number;
}): ReservationStayInput[] {
  return [
    {
      startDate: input.checkIn,
      endDate: input.splitDate,
      roomId: input.firstRoomId,
      roomRate: input.firstRate,
    },
    {
      startDate: input.splitDate,
      endDate: input.checkOut,
      roomId: input.secondRoomId,
      roomRate: input.secondRate,
    },
  ];
}

export interface CalendarOccupancyItem {
  id: string;
  key: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  roomNumber?: string;
  status: string;
  isSplitStay: boolean;
}

export function expandCalendarOccupancy(
  reservations: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
    status: string;
    guest?: { firstName?: string; lastName?: string };
    room?: { number?: string };
    stays?: Array<{
      sequence: number;
      startDate: string;
      endDate: string;
      room?: { number?: string };
    }>;
  }>,
): CalendarOccupancyItem[] {
  const items: CalendarOccupancyItem[] = [];

  for (const reservation of reservations) {
    const guestName = [
      reservation.guest?.firstName,
      reservation.guest?.lastName,
    ]
      .filter(Boolean)
      .join(' ');

    if (!isSplitStay(reservation) || !reservation.stays) {
      items.push({
        id: reservation.id,
        key: reservation.id,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guestName,
        roomNumber: reservation.room?.number,
        status: reservation.status,
        isSplitStay: false,
      });
      continue;
    }

    for (const stay of reservation.stays) {
      items.push({
        id: reservation.id,
        key: `${reservation.id}-${stay.sequence}`,
        checkIn: stay.startDate,
        checkOut: stay.endDate,
        guestName,
        roomNumber: stay.room?.number,
        status: reservation.status,
        isSplitStay: true,
      });
    }
  }

  return items;
}
