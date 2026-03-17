import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './client';
import { transactionCodesAPI } from './transaction-codes';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('transactionCodesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list calls GET /financial/transaction-codes', async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );
    await transactionCodesAPI.list();
    expect(apiClient.get).toHaveBeenCalledWith('/financial/transaction-codes');
  });

  it('getById calls GET /financial/transaction-codes/:id', async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {},
    );
    await transactionCodesAPI.getById('tc-1');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/financial/transaction-codes/tc-1',
    );
  });

  it('create calls POST /financial/transaction-codes', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {},
    );
    await transactionCodesAPI.create({
      code: '1000',
      description: 'Room Charge',
      type: 'CHARGE',
      group: 'ROOM',
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4000-01',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/financial/transaction-codes',
      expect.objectContaining({ code: '1000' }),
    );
  });

  it('update calls PATCH /financial/transaction-codes/:id', async () => {
    (apiClient.patch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {},
    );
    await transactionCodesAPI.update('tc-1', { description: 'Updated' });
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/financial/transaction-codes/tc-1',
      { description: 'Updated' },
    );
  });
});
