import { apiClient, getAuthToken } from "./client";

export type ReservationStatus =
  | "TENTATIVE"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW";

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
    const token = getAuthToken();
    const params = new URLSearchParams();
    if (filters?.propertyId) params.append("propertyId", filters.propertyId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.checkIn) params.append("checkIn", filters.checkIn);
    if (filters?.checkOut) params.append("checkOut", filters.checkOut);
    if (filters?.guestId) params.append("guestId", filters.guestId);

    const query = params.toString();
    const endpoint = query ? `/reservations?${query}` : "/reservations";
    return apiClient.get<Reservation[]>(endpoint, token || undefined);
  },

  async getById(id: string): Promise<Reservation> {
    const token = getAuthToken();
    return apiClient.get<Reservation>(
      `/reservations/${id}`,
      token || undefined,
    );
  },

  async getByConfirmNumber(confirmNumber: string): Promise<Reservation> {
    const token = getAuthToken();
    return apiClient.get<Reservation>(
      `/reservations/confirm/${confirmNumber}`,
      token || undefined,
    );
  },

  async getCalendar(params: CalendarParams): Promise<unknown> {
    const token = getAuthToken();
    const queryParams = new URLSearchParams({
      propertyId: params.propertyId,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.roomTypeId) queryParams.append("roomTypeId", params.roomTypeId);

    return apiClient.get<unknown>(
      `/reservations/calendar?${queryParams.toString()}`,
      token || undefined,
    );
  },

  async create(data: CreateReservationDto): Promise<Reservation> {
    const token = getAuthToken();
    return apiClient.post<Reservation>(
      "/reservations",
      data,
      token || undefined,
    );
  },

  async update(id: string, data: UpdateReservationDto): Promise<Reservation> {
    const token = getAuthToken();
    return apiClient.patch<Reservation>(
      `/reservations/${id}`,
      data,
      token || undefined,
    );
  },

  async cancel(id: string, reason?: string): Promise<Reservation> {
    const token = getAuthToken();
    return apiClient.patch<Reservation>(
      `/reservations/${id}/cancel`,
      { reason },
      token || undefined,
    );
  },

  async checkIn(id: string): Promise<Reservation> {
    const token = getAuthToken();
    return apiClient.post<Reservation>(
      `/reservations/${id}/check-in`,
      {},
      token || undefined,
    );
  },

  async checkOut(id: string): Promise<Reservation> {
    const token = getAuthToken();
    return apiClient.post<Reservation>(
      `/reservations/${id}/check-out`,
      {},
      token || undefined,
    );
  },

  async delete(id: string): Promise<void> {
    const token = getAuthToken();
    return apiClient.delete<void>(`/reservations/${id}`, token || undefined);
  },
};
