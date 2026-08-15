import { apiClient } from './client';

import type { ReservationStay, ReservationStayInput } from '@/lib/split-stay';

export type ReservationStatus =
  | 'TENTATIVE'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Reservation {
  id: string;
  confirmNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  numberOfGuests: number;
  status: ReservationStatus;
  source?: string;
  rateCode?: string;
  roomRate: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  specialRequest?: string;
  specialRequests?: string;
  isDayUse?: boolean;
  stays?: ReservationStay[];
  cancellationReason?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  roomId: string;
  guestId: string;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  room?: {
    id: string;
    number: string;
    roomType: {
      id: string;
      name: string;
      code: string;
      baseRate: number;
    };
    property: {
      id: string;
      name: string;
    };
  };
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

export interface RoomMove {
  id: string;
  reservationId: string;
  fromRoomId: string;
  toRoomId: string;
  reason?: string;
  movedAt: string;
  movedBy: string;
  keyCardReissued: boolean;
  folioTransferred: boolean;
  fromRoom?: {
    id: string;
    number: string;
  };
  toRoom?: {
    id: string;
    number: string;
  };
}

export interface MoveRoomDto {
  toRoomId: string;
  reason?: string;
  movedBy: string;
}

export interface MarkNoShowDto {
  userId: string;
  reason?: string;
  businessDate?: string;
}

export interface CreateReservationDto {
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  roomId: string;
  guestId: string;
  roomRate: number;
  totalAmount?: number;
  source?: string;
  rateCode?: string;
  notes?: string;
  specialRequest?: string;
  status?: ReservationStatus;
  isDayUse?: boolean;
  stays?: ReservationStayInput[];
}

export type UpdateReservationDto = Partial<CreateReservationDto>;

export interface ReservationFilterParams {
  propertyId?: string;
  status?: ReservationStatus;
  checkIn?: string;
  checkOut?: string;
  guestId?: string;
}

export interface CalendarParams {
  propertyId: string;
  startDate: string;
  endDate: string;
  roomTypeId?: string;
}

export const reservationsAPI = {
  async getAll(filters?: ReservationFilterParams): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.checkIn) params.append('checkIn', filters.checkIn);
    if (filters?.checkOut) params.append('checkOut', filters.checkOut);
    if (filters?.guestId) params.append('guestId', filters.guestId);

    const query = params.toString();
    const endpoint = query ? `/reservations?${query}` : '/reservations';
    return apiClient.get<Reservation[]>(endpoint);
  },

  async getById(id: string): Promise<Reservation> {
    return apiClient.get<Reservation>(`/reservations/${id}`);
  },

  async getByConfirmNumber(confirmNumber: string): Promise<Reservation> {
    return apiClient.get<Reservation>(`/reservations/confirm/${confirmNumber}`);
  },

  async getCalendar(params: CalendarParams): Promise<unknown> {
    const queryParams = new URLSearchParams({
      propertyId: params.propertyId,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.roomTypeId) queryParams.append('roomTypeId', params.roomTypeId);

    return apiClient.get<unknown>(
      `/reservations/calendar?${queryParams.toString()}`,
    );
  },

  async create(data: CreateReservationDto): Promise<Reservation> {
    return apiClient.post<Reservation>('/reservations', data);
  },

  async update(id: string, data: UpdateReservationDto): Promise<Reservation> {
    return apiClient.patch<Reservation>(`/reservations/${id}`, data);
  },

  async cancel(id: string, reason?: string): Promise<Reservation> {
    return apiClient.patch<Reservation>(`/reservations/${id}/cancel`, {
      reason,
    });
  },

  async checkIn(id: string): Promise<Reservation> {
    return apiClient.post<Reservation>(`/reservations/${id}/check-in`, {});
  },

  async checkOut(id: string): Promise<Reservation> {
    return apiClient.post<Reservation>(`/reservations/${id}/check-out`, {});
  },

  async moveRoom(id: string, data: MoveRoomDto): Promise<Reservation> {
    return apiClient.post<Reservation>(`/reservations/${id}/room-move`, data);
  },

  async listRoomMoves(id: string): Promise<RoomMove[]> {
    return apiClient.get<RoomMove[]>(`/reservations/${id}/room-moves`);
  },

  async markNoShow(id: string, data: MarkNoShowDto): Promise<Reservation> {
    return apiClient.post<Reservation>(`/reservations/${id}/no-show`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/reservations/${id}`);
  },
};
