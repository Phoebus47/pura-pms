import { tm30ReportsAPI } from './tm30-reports';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token'),
}));

import { apiClient } from './client';

describe('tm30ReportsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists by property', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await tm30ReportsAPI.list({ propertyId: 'prop-1' });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/tm30-reports?propertyId=prop-1',
      'token',
    );
  });

  it('generates reports', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ created: [], skipped: [] });
    await tm30ReportsAPI.generate({
      propertyId: 'prop-1',
      generatedBy: 'user-1',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/tm30-reports/generate',
      expect.objectContaining({ propertyId: 'prop-1' }),
      'token',
    );
  });
});
