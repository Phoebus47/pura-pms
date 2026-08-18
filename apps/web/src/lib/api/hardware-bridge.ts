import { apiClient, getAuthToken } from './client';

export type HardwareJobType =
  | 'PRINT'
  | 'KEYCARD_ENCODE'
  | 'PASSPORT_SCAN'
  | 'ID_CARD_READ';

export type HardwareJobStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type HardwareDeviceType =
  | 'PRINTER'
  | 'KEY_CARD_ENCODER'
  | 'PASSPORT_SCANNER'
  | 'SMART_CARD_READER';

export type HardwareVendor = 'GENERIC' | 'VINGCARD' | 'SALTO' | 'HAFELE';

export interface HardwareCatalog {
  jobTypes: HardwareJobType[];
  deviceTypes: HardwareDeviceType[];
  vendors: HardwareVendor[];
}

export interface HardwareAgent {
  id: string;
  propertyId: string;
  name: string;
  machineId: string;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt?: string;
}

export interface HardwareJob {
  id: string;
  propertyId: string;
  agentId?: string | null;
  type: HardwareJobType;
  status: HardwareJobStatus;
  requestedBy: string;
  payload: Record<string, unknown>;
  result?: unknown;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface RegisterAgentInput {
  propertyId: string;
  name: string;
  machineId: string;
}

export interface CreateJobInput {
  propertyId: string;
  type: HardwareJobType;
  requestedBy: string;
  payload: Record<string, unknown>;
  agentId?: string;
}

function authToken() {
  return getAuthToken() || undefined;
}

function withProperty(path: string, propertyId?: string) {
  return propertyId ? `${path}?propertyId=${propertyId}` : path;
}

export const hardwareBridgeAPI = {
  async getCatalog(): Promise<HardwareCatalog> {
    return apiClient.get<HardwareCatalog>(
      '/hardware-bridge/catalog',
      authToken(),
    );
  },

  async listAgents(propertyId?: string): Promise<HardwareAgent[]> {
    return apiClient.get<HardwareAgent[]>(
      withProperty('/hardware-bridge/agents', propertyId),
      authToken(),
    );
  },

  async registerAgent(data: RegisterAgentInput): Promise<HardwareAgent> {
    return apiClient.post<HardwareAgent>(
      '/hardware-bridge/agents',
      data,
      authToken(),
    );
  },

  async heartbeat(agentId: string): Promise<HardwareAgent> {
    return apiClient.post<HardwareAgent>(
      `/hardware-bridge/agents/${agentId}/heartbeat`,
      {},
      authToken(),
    );
  },

  async listJobs(propertyId?: string): Promise<HardwareJob[]> {
    return apiClient.get<HardwareJob[]>(
      withProperty('/hardware-bridge/jobs', propertyId),
      authToken(),
    );
  },

  async createJob(data: CreateJobInput): Promise<HardwareJob> {
    return apiClient.post<HardwareJob>(
      '/hardware-bridge/jobs',
      data,
      authToken(),
    );
  },

  async completeJob(id: string, result: unknown): Promise<HardwareJob> {
    return apiClient.post<HardwareJob>(
      `/hardware-bridge/jobs/${id}/complete`,
      { result },
      authToken(),
    );
  },

  async failJob(id: string, errorMessage: string): Promise<HardwareJob> {
    return apiClient.post<HardwareJob>(
      `/hardware-bridge/jobs/${id}/fail`,
      { errorMessage },
      authToken(),
    );
  },

  async simulateJob(id: string): Promise<HardwareJob> {
    return apiClient.post<HardwareJob>(
      `/hardware-bridge/jobs/${id}/simulate`,
      {},
      authToken(),
    );
  },
};
