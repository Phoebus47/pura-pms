import { guestFeedbackAPI } from './guest-feedback';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token'),
}));

describe('guestFeedbackAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists feedback for a property', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await guestFeedbackAPI.list({ propertyId: 'prop-1' });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/guest-feedback?propertyId=prop-1',
      'token',
    );
  });

  it('creates feedback', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'fb-1' });
    await guestFeedbackAPI.create({
      propertyId: 'prop-1',
      guestId: 'gst-1',
      score: 5,
      comment: 'Excellent',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/guest-feedback',
      {
        propertyId: 'prop-1',
        guestId: 'gst-1',
        score: 5,
        comment: 'Excellent',
      },
      'token',
    );
  });

  it('marks feedback reviewed', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'fb-1' });
    await guestFeedbackAPI.review('fb-1', { reviewedBy: 'usr-1' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/guest-feedback/fb-1/review',
      { reviewedBy: 'usr-1' },
      'token',
    );
  });
});
