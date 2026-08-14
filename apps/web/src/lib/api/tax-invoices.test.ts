import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taxInvoicesAPI } from './tax-invoices';
import { apiClient, getAuthToken } from './client';

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>();
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
    getAuthToken: vi.fn(),
  };
});

const mockInvoice = {
  id: 'ti_1',
  invoiceNumber: 'TI-2026-000001',
  propertyId: 'prop_1',
  folioId: 'fol_1',
  reservationId: 'res_1',
  businessDate: '2026-08-14T00:00:00.000Z',
  taxId: '1234567890123',
  branchNumber: null,
  buyerName: 'Ann Guest',
  amountNet: 1000,
  amountTax: 70,
  amountTotal: 1070,
  status: 'OPEN' as const,
  issuedAt: '2026-08-14T00:00:00.000Z',
  issuedBy: 'user-1',
  voidReason: null,
  voidedAt: null,
  voidedBy: null,
};

describe('taxInvoicesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockReturnValue('token123');
  });

  it('lists invoices via GET /tax-invoices', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([mockInvoice]);

    const result = await taxInvoicesAPI.list('prop_1', '2026-08-14');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/tax-invoices?propertyId=prop_1&businessDate=2026-08-14',
      'token123',
    );
    expect(result).toEqual([mockInvoice]);
  });

  it('loads one invoice via GET /tax-invoices/:id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockInvoice);

    const result = await taxInvoicesAPI.getById('ti_1');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/tax-invoices/ti_1',
      'token123',
    );
    expect(result).toEqual(mockInvoice);
  });

  it('issues an invoice via POST /tax-invoices', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(mockInvoice);
    const payload = {
      folioId: 'fol_1',
      taxId: '1234567890123',
      issuedBy: 'user-1',
    };

    const result = await taxInvoicesAPI.issue(payload);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/tax-invoices',
      payload,
      'token123',
    );
    expect(result).toEqual(mockInvoice);
  });

  it('voids an invoice via POST /tax-invoices/:id/void', async () => {
    const voided = { ...mockInvoice, status: 'VOID' as const };
    vi.mocked(apiClient.post).mockResolvedValue(voided);

    const result = await taxInvoicesAPI.void('ti_1', {
      reason: 'Wrong tax id',
      voidedBy: 'user-1',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/tax-invoices/ti_1/void',
      { reason: 'Wrong tax id', voidedBy: 'user-1' },
      'token123',
    );
    expect(result.status).toBe('VOID');
  });
});
