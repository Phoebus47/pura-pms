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
  creditLimitExceeded?: boolean;
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
  creditLimit?: number | null;
  arAccountId?: string | null;
  businessDate: string;
  windows: FolioWindow[];
  createdAt: string;
}

export interface FolioListItem {
  id: string;
  folioNumber: string;
  status: FolioStatus;
  balance: number;
  reservationId: string;
  reservation?: {
    confirmNumber?: string;
    guest?: { firstName: string; lastName: string };
    room?: { number: string };
  };
}

export interface ListFoliosParams {
  propertyId?: string;
  status?: FolioStatus;
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
  foreignAmount?: number;
  currency?: string;
}

export interface VoidTransactionDto {
  userId: string;
  reasonCodeId: string;
  remark?: string;
}

export const foliosAPI = {
  async list(filters?: ListFoliosParams): Promise<FolioListItem[]> {
    const params = new URLSearchParams();
    if (filters?.propertyId) {
      params.append('propertyId', filters.propertyId);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    const query = params.toString();
    return apiClient.get<FolioListItem[]>(
      query ? `/folios?${query}` : '/folios',
    );
  },

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

  async checkout(folioId: string, data: { userId: string }): Promise<Folio> {
    return apiClient.post<Folio>(`/folios/${folioId}/checkout`, data);
  },

  async setCreditLimit(
    folioId: string,
    creditLimit: number | null,
  ): Promise<Folio> {
    return apiClient.patch<Folio>(`/folios/${folioId}/credit-limit`, {
      creditLimit,
    });
  },

  async setArAccount(
    folioId: string,
    arAccountId: string | null,
  ): Promise<Folio> {
    return apiClient.patch<Folio>(`/folios/${folioId}/ar-account`, {
      arAccountId,
    });
  },

  async getTransactionCodes(): Promise<TransactionCode[]> {
    // This will be properly implemented in Phase 3, but we might need it now
    return apiClient.get<TransactionCode[]>('/financial/transaction-codes');
  },
};
