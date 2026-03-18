import { apiClient } from './client';

export interface NightAuditStatus {
  id: string;
  propertyId: string;
  businessDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  roomsPosted: number;
  revenuePosted: number;
  errors?: Array<{
    id: string;
    errorType: string;
    description: string;
    resolved: boolean;
  }>;
  reports?: Array<{
    id: string;
    reportType: string;
    reportName: string;
  }>;
}

export const nightAuditAPI = {
  start: async (propertyId: string, businessDate: string) => {
    return apiClient.post('/night-audit/run', {
      propertyId,
      businessDate,
    });
  },

  getStatus: async (
    propertyId: string,
    businessDate: string,
  ): Promise<NightAuditStatus> => {
    return apiClient.get<NightAuditStatus>(
      `/night-audit/status/${propertyId}/${businessDate}`,
    );
  },
};
