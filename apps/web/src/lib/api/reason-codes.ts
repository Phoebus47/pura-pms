import { apiClient } from './client';

export type ReasonCategory =
  | 'VOID'
  | 'ADJUSTMENT'
  | 'DISCOUNT'
  | 'TRANSFER'
  | 'OTHER';

export interface ReasonCode {
  id: string;
  code: string;
  description: string;
  category: ReasonCategory;
  isActive: boolean;
}

export const reasonCodesAPI = {
  async list(): Promise<ReasonCode[]> {
    return apiClient.get<ReasonCode[]>('/financial/reason-codes');
  },
};
