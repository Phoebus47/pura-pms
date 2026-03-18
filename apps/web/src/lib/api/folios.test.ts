import { foliosAPI } from './folios';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('foliosAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get folio by id', async () => {
    const mockResponse = { id: 'folio-1' };
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await foliosAPI.getById('folio-1');
    expect(apiClient.get).toHaveBeenCalledWith('/folios/folio-1');
    expect(result).toEqual(mockResponse);
  });

  it('should get folios by reservation id', async () => {
    const mockResponse = [{ id: 'folio-1' }];
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await foliosAPI.getByReservationId('res-1');
    expect(apiClient.get).toHaveBeenCalledWith('/folios/reservation/res-1');
    expect(result).toEqual(mockResponse);
  });

  it('should create a folio', async () => {
    const mockData = { reservationId: 'res-1' };
    const mockResponse = { id: 'folio-1', ...mockData };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const result = await foliosAPI.create(mockData);
    expect(apiClient.post).toHaveBeenCalledWith('/folios', mockData);
    expect(result).toEqual(mockResponse);
  });

  it('should post a transaction', async () => {
    const mockData = {
      windowNumber: 1,
      trxCodeId: 'code-1',
      amountNet: 100,
      userId: 'user-1',
      businessDate: '2025-01-15',
    };
    const mockResponse = { id: 'trx-1', ...mockData };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const result = await foliosAPI.postTransaction('folio-1', mockData);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/folios/folio-1/transactions',
      mockData,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get transaction codes', async () => {
    const mockResponse = [{ id: 'code-1', code: 'ROOM' }];
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await foliosAPI.getTransactionCodes();
    expect(apiClient.get).toHaveBeenCalledWith('/financial/transaction-codes');
    expect(result).toEqual(mockResponse);
  });
});
