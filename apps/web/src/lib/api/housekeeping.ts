import { apiClient, getAuthToken } from './client';
import type { RoomStatus } from './rooms';

export type HkStage = 'DIRTY' | 'CLEAN' | 'READY';
export type InspectionResult = 'PASSED' | 'FAILED';

export interface HkChecklistItem {
  code: string;
  required: boolean;
}

export interface HkBoardRoom {
  id: string;
  number: string;
  floor?: number | null;
  status: RoomStatus;
  hkStage: HkStage;
  propertyId: string;
  roomType?: { id: string; name: string; code: string };
  inspections?: Array<{
    id: string;
    result: InspectionResult;
    inspectedBy: string;
    createdAt: string;
  }>;
}

export interface InspectionLineInput {
  itemCode: string;
  passed: boolean;
  notes?: string;
}

function authToken() {
  return getAuthToken() || undefined;
}

export const housekeepingAPI = {
  async getBoard(propertyId?: string): Promise<HkBoardRoom[]> {
    const query = propertyId ? `?propertyId=${propertyId}` : '';
    return apiClient.get<HkBoardRoom[]>(
      `/housekeeping/board${query}`,
      authToken(),
    );
  },

  async getChecklist(): Promise<HkChecklistItem[]> {
    return apiClient.get<HkChecklistItem[]>(
      '/housekeeping/checklist',
      authToken(),
    );
  },

  async markClean(roomId: string): Promise<HkBoardRoom> {
    return apiClient.post<HkBoardRoom>(
      `/housekeeping/rooms/${roomId}/clean`,
      {},
      authToken(),
    );
  },

  async inspect(
    roomId: string,
    data: { inspectedBy: string; notes?: string; lines: InspectionLineInput[] },
  ): Promise<unknown> {
    return apiClient.post(
      `/housekeeping/rooms/${roomId}/inspections`,
      data,
      authToken(),
    );
  },
};
