import { apiClient } from './client';
import { reasonCodesAPI } from './reason-codes';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('reasonCodesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list reason codes', async () => {
    const mockResponse = [
      {
        id: 'reason-1',
        code: 'VOID',
        description: 'Void',
        category: 'VOID',
        isActive: true,
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await reasonCodesAPI.list();
    expect(apiClient.get).toHaveBeenCalledWith('/financial/reason-codes');
    expect(result).toEqual(mockResponse);
  });
});
