import { apiClient } from './client';

export type TransactionType =
  | 'CHARGE'
  | 'PAYMENT'
  | 'ADJUSTMENT'
  | 'TRANSFER'
  | 'DEPOSIT'
  | 'REFUND';

export type TrxGroup =
  | 'ROOM'
  | 'FOOD'
  | 'BEVERAGE'
  | 'SPA'
  | 'FITNESS'
  | 'LAUNDRY'
  | 'TELEPHONE'
  | 'INTERNET'
  | 'MINIBAR'
  | 'PARKING'
  | 'MISC'
  | 'TAX'
  | 'SERVICE'
  | 'DISCOUNT';

export interface TransactionCode {
  id: string;
  code: string;
  description: string;
  descriptionTh?: string;
  type: TransactionType;
  group: TrxGroup;
  hasTax: boolean;
  hasService: boolean;
  taxId?: string;
  serviceRate?: number;
  glAccountCode: string;
  departmentCode?: string;
}

export interface CreateTransactionCodeDto {
  code: string;
  description: string;
  descriptionTh?: string;
  type: TransactionType;
  group: TrxGroup;
  hasTax: boolean;
  hasService: boolean;
  taxId?: string;
  serviceRate?: number;
  glAccountCode: string;
  departmentCode?: string;
}

export type UpdateTransactionCodeDto = Partial<CreateTransactionCodeDto>;

export const transactionCodesAPI = {
  async list(): Promise<TransactionCode[]> {
    return apiClient.get<TransactionCode[]>('/financial/transaction-codes');
  },

  async getById(id: string): Promise<TransactionCode> {
    return apiClient.get<TransactionCode>(`/financial/transaction-codes/${id}`);
  },

  async create(data: CreateTransactionCodeDto): Promise<TransactionCode> {
    return apiClient.post<TransactionCode>(
      '/financial/transaction-codes',
      data,
    );
  },

  async update(
    id: string,
    data: UpdateTransactionCodeDto,
  ): Promise<TransactionCode> {
    return apiClient.patch<TransactionCode>(
      `/financial/transaction-codes/${id}`,
      data,
    );
  },
};
