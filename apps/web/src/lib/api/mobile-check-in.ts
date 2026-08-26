import { apiClient } from './client';
import type { ReservationStatus } from './reservations';

export interface MobileCheckInRoom {
  id: string;
  number: string;
  floor: number | null;
  roomType: {
    id: string;
    name: string;
    code: string;
  };
}

export interface MobileCheckInReservation {
  confirmNumber: string;
  status: ReservationStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  guestFirstName: string;
  guestLastName: string;
  room: MobileCheckInRoom | null;
  propertyId: string;
}

export interface MobileCheckInAvailableRoom {
  id: string;
  number: string;
  floor: number | null;
  status: string;
}

export interface MobileCheckInAvailableRoomType {
  roomType: {
    id: string;
    name: string;
    code: string;
    baseRate?: number;
  };
  availableCount: number;
  rooms: MobileCheckInAvailableRoom[];
}

export interface MobileCheckInDigitalKey {
  status: 'UNAVAILABLE';
  message: string;
}

export interface MobileCheckInResult {
  reservation: MobileCheckInReservation;
  digitalKey: MobileCheckInDigitalKey;
}

function withLastNameQuery(lastName?: string): string {
  return lastName ? `?lastName=${encodeURIComponent(lastName)}` : '';
}

export const mobileCheckInAPI = {
  async lookup(
    confirmNumber: string,
    lastName?: string,
  ): Promise<MobileCheckInReservation> {
    return apiClient.get<MobileCheckInReservation>(
      `/mobile-check-in/${encodeURIComponent(confirmNumber)}${withLastNameQuery(lastName)}`,
    );
  },

  async getAvailableRooms(
    confirmNumber: string,
    lastName?: string,
  ): Promise<MobileCheckInAvailableRoomType[]> {
    return apiClient.get<MobileCheckInAvailableRoomType[]>(
      `/mobile-check-in/${encodeURIComponent(confirmNumber)}/rooms${withLastNameQuery(lastName)}`,
    );
  },

  async selectRoom(
    confirmNumber: string,
    roomId: string,
    lastName?: string,
  ): Promise<MobileCheckInReservation> {
    return apiClient.post<MobileCheckInReservation>(
      `/mobile-check-in/${encodeURIComponent(confirmNumber)}/room`,
      { roomId, lastName },
    );
  },

  async checkIn(
    confirmNumber: string,
    lastName?: string,
  ): Promise<MobileCheckInResult> {
    return apiClient.post<MobileCheckInResult>(
      `/mobile-check-in/${encodeURIComponent(confirmNumber)}/check-in`,
      { lastName },
    );
  },
};
