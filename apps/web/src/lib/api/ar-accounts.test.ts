import { describe, it, expect, vi, beforeEach } from 'vitest';
import { arAccountsAPI, arInvoicesAPI } from './ar-accounts';
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

describe('arAccountsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockReturnValue('token123');
  });

  it('lists accounts via GET /ar-accounts', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await arAccountsAPI.list('prop_1');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/ar-accounts?propertyId=prop_1',
      'token123',
    );
  });

  it('creates an account via POST /ar-accounts', async () => {
    const payload = {
      propertyId: 'prop_1',
      companyName: 'Acme',
      creditLimit: 50000,
    };
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'ar_1', ...payload });
    await arAccountsAPI.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/ar-accounts',
      payload,
      'token123',
    );
  });

  it('loads aging and statement', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({});
    await arAccountsAPI.aging('ar_1', '2026-08-14');
    await arAccountsAPI.statement('ar_1', '2026-08-14');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/ar-accounts/ar_1/aging?asOf=2026-08-14',
      'token123',
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      '/ar-accounts/ar_1/statement?asOf=2026-08-14',
      'token123',
    );
  });

  it('transfers a folio via POST /ar-accounts/:id/transfer', async () => {
    const payload = { folioId: 'fol_1', userId: 'user-1' };
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'inv_1' });
    await arAccountsAPI.transfer('ar_1', payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/ar-accounts/ar_1/transfer',
      payload,
      'token123',
    );
  });

  it('allocates a payment via POST /ar-invoices/:id/payments', async () => {
    const payload = {
      amount: 50,
      method: 'CASH',
      paidBy: 'user-1',
      businessDate: '2026-08-14',
    };
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'inv_1' });
    await arInvoicesAPI.allocate('inv_1', payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/ar-invoices/inv_1/payments',
      payload,
      'token123',
    );
  });
});
