import { apiClient, getAuthToken } from './client';

export type ArInvoiceStatus = 'OPEN' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID';

export interface ArInvoicePayment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  paidBy: string;
  businessDate: string;
}

export interface ArInvoice {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  arAccountId: string;
  folioId: string | null;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: ArInvoiceStatus;
  arAccount?: {
    id: string;
    accountNumber: string;
    companyName: string;
  };
  folio?: { id: string; folioNumber: string } | null;
  payments?: ArInvoicePayment[];
}

export interface ArAccount {
  id: string;
  propertyId: string;
  accountNumber: string;
  companyName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  creditLimit: number;
  currentBalance: number;
  paymentTerms: number;
  isActive: boolean;
  invoices?: ArInvoice[];
}

export interface ArAging {
  arAccountId: string;
  asOf: string;
  currentBalance: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
}

export interface ArStatement {
  accountNumber: string;
  companyName: string;
  asOf: string;
  currentBalance: number;
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
  };
  invoices: ArInvoice[];
}

export interface CreateArAccountDto {
  propertyId: string;
  accountNumber?: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  creditLimit: number;
  paymentTerms?: number;
  isActive?: boolean;
}

export interface TransferFolioDto {
  folioId: string;
  userId: string;
  remark?: string;
}

export interface AllocatePaymentDto {
  amount: number;
  method: string;
  reference?: string;
  paidBy: string;
  businessDate: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const arAccountsAPI = {
  async list(propertyId: string): Promise<ArAccount[]> {
    return apiClient.get<ArAccount[]>(
      `/ar-accounts?propertyId=${encodeURIComponent(propertyId)}`,
      authToken(),
    );
  },

  async getById(id: string): Promise<ArAccount> {
    return apiClient.get<ArAccount>(`/ar-accounts/${id}`, authToken());
  },

  async create(data: CreateArAccountDto): Promise<ArAccount> {
    return apiClient.post<ArAccount>('/ar-accounts', data, authToken());
  },

  async aging(id: string, asOf?: string): Promise<ArAging> {
    const params = asOf ? `?asOf=${encodeURIComponent(asOf)}` : '';
    return apiClient.get<ArAging>(
      `/ar-accounts/${id}/aging${params}`,
      authToken(),
    );
  },

  async statement(id: string, asOf?: string): Promise<ArStatement> {
    const params = asOf ? `?asOf=${encodeURIComponent(asOf)}` : '';
    return apiClient.get<ArStatement>(
      `/ar-accounts/${id}/statement${params}`,
      authToken(),
    );
  },

  async transfer(id: string, data: TransferFolioDto): Promise<ArInvoice> {
    return apiClient.post<ArInvoice>(
      `/ar-accounts/${id}/transfer`,
      data,
      authToken(),
    );
  },
};

export const arInvoicesAPI = {
  async list(propertyId: string, arAccountId?: string): Promise<ArInvoice[]> {
    const params = new URLSearchParams({ propertyId });
    if (arAccountId) {
      params.set('arAccountId', arAccountId);
    }
    return apiClient.get<ArInvoice[]>(
      `/ar-invoices?${params.toString()}`,
      authToken(),
    );
  },

  async allocate(id: string, data: AllocatePaymentDto): Promise<ArInvoice> {
    return apiClient.post<ArInvoice>(
      `/ar-invoices/${id}/payments`,
      data,
      authToken(),
    );
  },
};
