import { apiClient, getAuthToken } from './client';

export type Tm30Status = 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';

export interface Tm30Report {
  id: string;
  propertyId: string;
  reservationId: string;
  guestId: string;
  passportNumber: string;
  fullName: string;
  nationality: string;
  dateOfBirth: string | null;
  roomNumber: string;
  arrivalDate: string;
  departureDate: string | null;
  addressInThailand: string | null;
  status: Tm30Status;
  dueAt: string;
  submittedAt: string | null;
  confirmedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  referenceNo: string | null;
  generatedBy: string;
  submittedBy: string | null;
  createdAt: string;
  updatedAt: string;
  reservation?: { id: string; confirmNumber: string; status: string };
}

export interface Tm30GenerateResult {
  created: Tm30Report[];
  skipped: Array<{ reservationId: string; reason: string }>;
}

export interface Tm30ExportResult {
  filename: string;
  text: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const tm30ReportsAPI = {
  async list(params: {
    propertyId: string;
    status?: Tm30Status;
    arrivalDate?: string;
    overdue?: boolean;
  }): Promise<Tm30Report[]> {
    const query = new URLSearchParams({ propertyId: params.propertyId });
    if (params.status) query.set('status', params.status);
    if (params.arrivalDate) query.set('arrivalDate', params.arrivalDate);
    if (params.overdue) query.set('overdue', 'true');
    return apiClient.get<Tm30Report[]>(
      `/tm30-reports?${query.toString()}`,
      authToken(),
    );
  },

  async generate(data: {
    propertyId: string;
    generatedBy: string;
    arrivalDate?: string;
  }): Promise<Tm30GenerateResult> {
    return apiClient.post<Tm30GenerateResult>(
      '/tm30-reports/generate',
      data,
      authToken(),
    );
  },

  async exportTsv(propertyId: string): Promise<Tm30ExportResult> {
    return apiClient.get<Tm30ExportResult>(
      `/tm30-reports/export?propertyId=${propertyId}`,
      authToken(),
    );
  },

  async submit(
    id: string,
    submittedBy: string,
    referenceNo?: string,
  ): Promise<Tm30Report> {
    return apiClient.post<Tm30Report>(
      `/tm30-reports/${id}/submit`,
      { submittedBy, referenceNo },
      authToken(),
    );
  },

  async confirm(id: string, referenceNo?: string): Promise<Tm30Report> {
    return apiClient.post<Tm30Report>(
      `/tm30-reports/${id}/confirm`,
      { referenceNo },
      authToken(),
    );
  },

  async fail(id: string, failureReason: string): Promise<Tm30Report> {
    return apiClient.post<Tm30Report>(
      `/tm30-reports/${id}/fail`,
      { failureReason },
      authToken(),
    );
  },
};
