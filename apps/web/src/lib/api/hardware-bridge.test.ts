import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { hardwareBridgeAPI } from './hardware-bridge';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token123'),
}));

describe('hardwareBridgeAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads catalog, agents, and jobs', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await hardwareBridgeAPI.getCatalog();
    await hardwareBridgeAPI.listAgents('prop-1');
    await hardwareBridgeAPI.listJobs('prop-1');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/hardware-bridge/catalog',
      'token123',
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      '/hardware-bridge/agents?propertyId=prop-1',
      'token123',
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      '/hardware-bridge/jobs?propertyId=prop-1',
      'token123',
    );
  });

  it('registers an agent and sends a heartbeat', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'agent-1' });
    await hardwareBridgeAPI.registerAgent({
      propertyId: 'prop-1',
      name: 'Desk PC',
      machineId: 'fd-01',
    });
    await hardwareBridgeAPI.heartbeat('agent-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/hardware-bridge/agents',
      expect.objectContaining({ machineId: 'fd-01' }),
      'token123',
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/hardware-bridge/agents/agent-1/heartbeat',
      {},
      'token123',
    );
  });

  it('creates, simulates, completes, and fails jobs', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'job-1' });
    await hardwareBridgeAPI.createJob({
      propertyId: 'prop-1',
      type: 'PRINT',
      requestedBy: 'front-desk',
      payload: { jobType: 'receipt' },
    });
    await hardwareBridgeAPI.simulateJob('job-1');
    await hardwareBridgeAPI.completeJob('job-1', { printed: true });
    await hardwareBridgeAPI.failJob('job-1', 'offline');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/hardware-bridge/jobs',
      expect.objectContaining({ type: 'PRINT' }),
      'token123',
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/hardware-bridge/jobs/job-1/simulate',
      {},
      'token123',
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/hardware-bridge/jobs/job-1/complete',
      { result: { printed: true } },
      'token123',
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/hardware-bridge/jobs/job-1/fail',
      { errorMessage: 'offline' },
      'token123',
    );
  });
});
