import { guestMessagesAPI } from './guest-messages';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token'),
}));

import { apiClient } from './client';

describe('guestMessagesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists by property', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await guestMessagesAPI.list({ propertyId: 'prop-1' });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/guest-messages?propertyId=prop-1',
      'token',
    );
  });

  it('creates a message', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'msg-1' });
    await guestMessagesAPI.create({
      propertyId: 'prop-1',
      guestId: 'gst-1',
      direction: 'OUTBOUND',
      content: 'Welcome',
      sentBy: 'usr-1',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/guest-messages',
      expect.objectContaining({ content: 'Welcome' }),
      'token',
    );
  });

  it('marks a message read', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'msg-1' });
    await guestMessagesAPI.markRead('msg-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/guest-messages/msg-1/read',
      {},
      'token',
    );
  });
});
