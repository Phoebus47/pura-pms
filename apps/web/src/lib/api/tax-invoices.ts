import { apiClient, getAuthToken } from './client';

export type TaxInvoiceStatus = 'OPEN' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID';

export interface TaxInvoice {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  folioId: string | null;
  reservationId: string | null;
  businessDate: string;
  taxId: string;
  branchNumber: string | null;
  buyerName: string | null;
  amountNet: number;
  amountTax: number;
  amountTotal: number;
  status: TaxInvoiceStatus;
  issuedAt: string | null;
  issuedBy: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: string | null;
  property?: {
    id: string;
    name: string;
    address: string | null;
    taxId: string | null;
  };
  folio?: { id: string; folioNumber: string } | null;
  reservation?: {
    id: string;
    confirmNumber: string;
    guest: { firstName: string; lastName: string };
  } | null;
}

export interface IssueTaxInvoiceDto {
  folioId: string;
  taxId: string;
  branchNumber?: string;
  buyerName?: string;
  issuedBy: string;
}

export interface VoidTaxInvoiceDto {
  reason: string;
  voidedBy: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const taxInvoicesAPI = {
  async list(propertyId: string, businessDate?: string): Promise<TaxInvoice[]> {
    const params = new URLSearchParams({ propertyId });
    if (businessDate) {
      params.set('businessDate', businessDate);
    }
    return apiClient.get<TaxInvoice[]>(
      `/tax-invoices?${params.toString()}`,
      authToken(),
    );
  },

  async getById(id: string): Promise<TaxInvoice> {
    return apiClient.get<TaxInvoice>(`/tax-invoices/${id}`, authToken());
  },

  async issue(data: IssueTaxInvoiceDto): Promise<TaxInvoice> {
    return apiClient.post<TaxInvoice>('/tax-invoices', data, authToken());
  },

  async void(id: string, data: VoidTaxInvoiceDto): Promise<TaxInvoice> {
    return apiClient.post<TaxInvoice>(
      `/tax-invoices/${id}/void`,
      data,
      authToken(),
    );
  },
};
