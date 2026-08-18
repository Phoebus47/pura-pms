import { apiClient, getAuthToken } from './client';

export type YieldRecommendReason =
  | 'HIGH_DEMAND'
  | 'SLOW_PACE'
  | 'COMP_UNDERCUT';

export type YieldRecommendationStatus = 'PENDING' | 'APPLIED' | 'DISMISSED';

export interface YieldPaceDay {
  stayDate: string;
  lastYearDate: string;
  capacity: number;
  occupied: number;
  occupancyPct: number;
  lastYearOccupied: number;
  lastYearOccupancyPct: number;
  paceDeltaPct: number;
  alert: boolean;
}

export interface YieldPace {
  from: string;
  to: string;
  days: YieldPaceDay[];
}

export interface YieldRecommendation {
  id: string;
  propertyId: string;
  roomTypeId: string;
  rateId: string;
  stayDate: string;
  currentAmount: number;
  recommendedAmount: number;
  occupancyPct: number;
  paceDeltaPct: number | null;
  competitorAmount: number | null;
  reason: YieldRecommendReason;
  status: YieldRecommendationStatus;
  rate?: { id: string; code: string; name: string };
  roomType?: { id: string; name: string; code: string };
}

export interface CompetitorRate {
  id: string;
  propertyId: string;
  competitorName: string;
  roomTypeId: string | null;
  stayDate: string;
  amount: number;
  notes: string | null;
  roomType?: { id: string; name: string; code: string } | null;
}

export interface CreateCompetitorRateDto {
  propertyId: string;
  competitorName: string;
  stayDate: string;
  amount: number;
  roomTypeId?: string;
  notes?: string;
}

function authToken() {
  return getAuthToken() || undefined;
}

export const yieldAPI = {
  async getPace(
    propertyId: string,
    from?: string,
    to?: string,
  ): Promise<YieldPace> {
    const params = new URLSearchParams({ propertyId });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return apiClient.get<YieldPace>(`/yield/pace?${params}`, authToken());
  },

  async getRecommendations(
    propertyId: string,
    status?: string,
  ): Promise<YieldRecommendation[]> {
    const params = new URLSearchParams({ propertyId });
    if (status) params.set('status', status);
    return apiClient.get<YieldRecommendation[]>(
      `/yield/recommendations?${params}`,
      authToken(),
    );
  },

  async generateRecommendations(
    propertyId: string,
  ): Promise<YieldRecommendation[]> {
    return apiClient.post<YieldRecommendation[]>(
      '/yield/recommendations/generate',
      { propertyId },
      authToken(),
    );
  },

  async applyRecommendation(id: string): Promise<YieldRecommendation> {
    return apiClient.post<YieldRecommendation>(
      `/yield/recommendations/${id}/apply`,
      {},
      authToken(),
    );
  },

  async dismissRecommendation(id: string): Promise<YieldRecommendation> {
    return apiClient.post<YieldRecommendation>(
      `/yield/recommendations/${id}/dismiss`,
      {},
      authToken(),
    );
  },

  async getCompetitors(propertyId: string): Promise<CompetitorRate[]> {
    return apiClient.get<CompetitorRate[]>(
      `/yield/competitors?propertyId=${propertyId}`,
      authToken(),
    );
  },

  async createCompetitor(
    data: CreateCompetitorRateDto,
  ): Promise<CompetitorRate> {
    return apiClient.post<CompetitorRate>(
      '/yield/competitors',
      data,
      authToken(),
    );
  },
};
