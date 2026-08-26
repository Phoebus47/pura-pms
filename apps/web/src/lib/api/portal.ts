import { apiClient } from './client';

export interface PortalReservationSummary {
  id: string;
  confirmNumber: string;
  status: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  room?: { number: string } | null;
  guest?: { firstName: string; lastName: string } | null;
}

export interface PortalFolioTransaction {
  id: string;
  businessDate: string;
  description: string;
  amountTotal: number;
  sign: number;
}

export interface PortalFolio {
  id: string;
  folioNumber: string;
  status: string;
  balance: number;
  transactions: PortalFolioTransaction[];
}

export interface PortalMessage {
  id: string;
  content: string;
  createdAt: string;
}

function guestParams(lastName: string): string {
  return `?lastName=${encodeURIComponent(lastName)}`;
}

export const portalAPI = {
  async getReservation(
    confirmNumber: string,
    lastName: string,
  ): Promise<PortalReservationSummary> {
    return apiClient.get<PortalReservationSummary>(
      `/portal/reservations/${confirmNumber}${guestParams(lastName)}`,
    );
  },

  async getFolio(
    confirmNumber: string,
    lastName: string,
  ): Promise<PortalFolio[]> {
    return apiClient.get<PortalFolio[]>(
      `/portal/reservations/${confirmNumber}/folio${guestParams(lastName)}`,
    );
  },

  async requestService(
    confirmNumber: string,
    data: { lastName: string; content: string },
  ): Promise<PortalMessage> {
    return apiClient.post<PortalMessage>(
      `/portal/reservations/${confirmNumber}/messages`,
      data,
    );
  },
};
