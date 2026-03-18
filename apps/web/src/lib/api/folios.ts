import { apiClient } from './client';
import type { TransactionCode } from './transaction-codes';

export type FolioType = 'GUEST' | 'MASTER' | 'COMPANY';
export type FolioStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'POSTED_TO_CITY_LEDGER'
  | 'TRANSFERRED';

export interface FolioTransaction {
  id: string;
  windowId: string;
  trxCodeId: string;
  trxCode: TransactionCode;
  businessDate: string;
  createdAt: string;
  amountNet: number;
  amountService: number;
  amountTax: number;
  amountTotal: number;
  sign: number;
  reference?: string;
  remark?: string;
  userId: string;
  isVoid: boolean;
  reasonCodeId?: string;
  relatedTrxId?: string;
}

export interface FolioWindow {
  id: string;
  folioId: string;
  windowNumber: number;
  description?: string;
  balance: number;
  transactions: FolioTransaction[];
}

export interface Folio {
  id: string;
  folioNumber: string;
  reservationId: string;
  type: FolioType;
  status: FolioStatus;
  balance: number;
  businessDate: string;
  windows: FolioWindow[];
  createdAt: string;
}

export interface CreateFolioDto {
  reservationId: string;
  type?: FolioType;
}

export interface PostTransactionDto {
  windowNumber: number;
  trxCodeId: string;
  amountNet: number;
  reference?: string;
  remark?: string;
  userId: string;
  reasonCodeId?: string;
  businessDate: string;
}

export interface VoidTransactionDto {
  userId: string;
  reasonCodeId: string;
  remark?: string;
}

export const foliosAPI = {
  async getById(id: string): Promise<Folio> {
    return apiClient.get<Folio>(`/folios/${id}`);
  },

  async getByReservationId(reservationId: string): Promise<Folio[]> {
    return apiClient.get<Folio[]>(`/folios/reservation/${reservationId}`);
  },

  async create(data: CreateFolioDto): Promise<Folio> {
    return apiClient.post<Folio>('/folios', data);
  },

  async postTransaction(
    folioId: string,
    data: PostTransactionDto,
  ): Promise<FolioTransaction> {
    return apiClient.post<FolioTransaction>(
      `/folios/${folioId}/transactions`,
      data,
    );
  },

  async voidTransaction(
    transactionId: string,
    data: VoidTransactionDto,
  ): Promise<FolioTransaction> {
    return apiClient.post<FolioTransaction>(
      `/folios/transactions/${transactionId}/void`,
      data,
    );
  },

  async getTransactionCodes(): Promise<TransactionCode[]> {
    // This will be properly implemented in Phase 3, but we might need it now
    return apiClient.get<TransactionCode[]>('/financial/transaction-codes');
  },
};
