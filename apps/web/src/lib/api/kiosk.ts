import { apiClient } from './client';
import type { Reservation } from './reservations';

export interface KioskCheckInDto {
  confirmNumber: string;
  propertyId?: string;
}

export const kioskAPI = {
  async checkIn(data: KioskCheckInDto): Promise<Reservation> {
    return apiClient.post<Reservation>('/kiosk/check-in', data);
  },
};
