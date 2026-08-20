import { guestComplaintsAPI } from './guest-complaints';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token'),
}));

describe('guestComplaintsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists complaints for a property', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await guestComplaintsAPI.list({ propertyId: 'prop-1' });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/guest-complaints?propertyId=prop-1',
      'token',
    );
  });

  it('gets one complaint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ id: 'gc-1' });
    await guestComplaintsAPI.get('gc-1');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/guest-complaints/gc-1',
      'token',
    );
  });

  it('creates a complaint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'gc-1' });
    await guestComplaintsAPI.create({
      propertyId: 'prop-1',
      category: 'Room',
      subject: 'No hot water',
      description: 'Shower cold on arrival',
      openedBy: 'usr-1',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/guest-complaints',
      {
        propertyId: 'prop-1',
        category: 'Room',
        subject: 'No hot water',
        description: 'Shower cold on arrival',
        openedBy: 'usr-1',
      },
      'token',
    );
  });

  it('starts a complaint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'gc-1' });
    await guestComplaintsAPI.start('gc-1', { assignedTo: 'usr-2' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/guest-complaints/gc-1/start',
      { assignedTo: 'usr-2' },
      'token',
    );
  });

  it('resolves a complaint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'gc-1' });
    await guestComplaintsAPI.resolve('gc-1', {
      resolvedBy: 'usr-1',
      resolutionNote: 'Engineering fixed boiler',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/guest-complaints/gc-1/resolve',
      {
        resolvedBy: 'usr-1',
        resolutionNote: 'Engineering fixed boiler',
      },
      'token',
    );
  });

  it('closes a complaint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'gc-1' });
    await guestComplaintsAPI.close('gc-1', { closedBy: 'usr-1' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/guest-complaints/gc-1/close',
      { closedBy: 'usr-1' },
      'token',
    );
  });
});
