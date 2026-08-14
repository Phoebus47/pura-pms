import { apiClient, getAuthToken, APIError } from './client';

export type ShiftStatus = 'OPEN' | 'CLOSED' | 'BALANCED';

export interface ShiftCashLine {
  id: string;
  amountTotal: number;
  sign: number;
  trxCodeId: string;
}

export interface Shift {
  id: string;
  shiftNumber: string;
  userId: string;
  propertyId: string;
  businessDate: string;
  startTime: string;
  endTime: string | null;
  openingCash: number;
  closingCash: number | null;
  expectedCash: number | null;
  cashVariance: number | null;
  status: ShiftStatus;
  closedBy: string | null;
  managerApprovedBy: string | null;
  managerApprovedAt: string | null;
  varianceReason: string | null;
  handoverToUserId: string | null;
  handoverFromShiftId: string | null;
  notes: string | null;
  cashLines?: ShiftCashLine[];
  transactionCount?: number;
}

export interface OpenShiftDto {
  propertyId: string;
  userId: string;
  openingCash: number;
  businessDate?: string;
}

export interface CloseShiftDto {
  closingCash: number;
  userId: string;
  varianceReason?: string;
  notes?: string;
}

export interface ApproveShiftDto {
  userId: string;
  notes?: string;
}

export interface HandoverShiftDto {
  toUserId: string;
  countedCash: number;
  userId: string;
  notes?: string;
  varianceReason?: string;
}

export interface HandoverShiftResult {
  closed: Shift;
  opened: Shift;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const shiftsAPI = {
  async open(data: OpenShiftDto): Promise<Shift> {
    return apiClient.post<Shift>('/shifts', data, authToken());
  },

  /**
   * Returns the caller's OPEN shift, or `null` when the API responds 404
   * (no current shift). Other errors are rethrown.
   */
  async getCurrent(propertyId: string, userId: string): Promise<Shift | null> {
    const query = new URLSearchParams({ propertyId, userId });
    try {
      return await apiClient.get<Shift>(
        `/shifts/current?${query.toString()}`,
        authToken(),
      );
    } catch (err) {
      if (err instanceof APIError && err.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async list(propertyId: string, businessDate: string): Promise<Shift[]> {
    const query = new URLSearchParams({ propertyId, businessDate });
    return apiClient.get<Shift[]>(`/shifts?${query.toString()}`, authToken());
  },

  async getById(id: string): Promise<Shift> {
    return apiClient.get<Shift>(`/shifts/${id}`, authToken());
  },

  async close(id: string, data: CloseShiftDto): Promise<Shift> {
    return apiClient.post<Shift>(`/shifts/${id}/close`, data, authToken());
  },

  async approve(id: string, data: ApproveShiftDto): Promise<Shift> {
    return apiClient.post<Shift>(`/shifts/${id}/approve`, data, authToken());
  },

  async handover(
    id: string,
    data: HandoverShiftDto,
  ): Promise<HandoverShiftResult> {
    return apiClient.post<HandoverShiftResult>(
      `/shifts/${id}/handover`,
      data,
      authToken(),
    );
  },
};
