import { apiClient, getAuthToken } from './client';

export type GuestComplaintSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type GuestComplaintStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export interface GuestComplaint {
  id: string;
  propertyId: string;
  guestId: string | null;
  reservationId: string | null;
  category: string;
  severity: GuestComplaintSeverity;
  subject: string;
  description: string;
  status: GuestComplaintStatus;
  openedBy: string;
  assignedTo: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  closedAt: string | null;
  closedBy: string | null;
  createdAt: string;
  updatedAt: string;
  guest?: { id: string; firstName: string; lastName: string } | null;
  reservation?: {
    id: string;
    confirmNumber: string;
    status: string;
  } | null;
}

export interface CreateGuestComplaintDto {
  propertyId: string;
  guestId?: string;
  reservationId?: string;
  category: string;
  severity?: GuestComplaintSeverity;
  subject: string;
  description: string;
  openedBy: string;
}

export interface StartGuestComplaintDto {
  assignedTo?: string;
}

export interface ResolveGuestComplaintDto {
  resolvedBy: string;
  resolutionNote: string;
}

export interface CloseGuestComplaintDto {
  closedBy: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const guestComplaintsAPI = {
  async list(params: {
    propertyId: string;
    status?: GuestComplaintStatus;
  }): Promise<GuestComplaint[]> {
    const query = new URLSearchParams({ propertyId: params.propertyId });
    if (params.status) query.set('status', params.status);
    return apiClient.get<GuestComplaint[]>(
      `/guest-complaints?${query.toString()}`,
      authToken(),
    );
  },

  async get(id: string): Promise<GuestComplaint> {
    return apiClient.get<GuestComplaint>(
      `/guest-complaints/${id}`,
      authToken(),
    );
  },

  async create(data: CreateGuestComplaintDto): Promise<GuestComplaint> {
    return apiClient.post<GuestComplaint>(
      '/guest-complaints',
      data,
      authToken(),
    );
  },

  async start(
    id: string,
    data: StartGuestComplaintDto,
  ): Promise<GuestComplaint> {
    return apiClient.post<GuestComplaint>(
      `/guest-complaints/${id}/start`,
      data,
      authToken(),
    );
  },

  async resolve(
    id: string,
    data: ResolveGuestComplaintDto,
  ): Promise<GuestComplaint> {
    return apiClient.post<GuestComplaint>(
      `/guest-complaints/${id}/resolve`,
      data,
      authToken(),
    );
  },

  async close(
    id: string,
    data: CloseGuestComplaintDto,
  ): Promise<GuestComplaint> {
    return apiClient.post<GuestComplaint>(
      `/guest-complaints/${id}/close`,
      data,
      authToken(),
    );
  },
};
