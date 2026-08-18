import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_AGENT_URL, localBridge } from './local-bridge';

describe('localBridge', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('checks health on the default agent URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, devices: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const health = await localBridge.health();
    expect(health.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      `${DEFAULT_AGENT_URL}/health`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('prints, encodes, and scans on a custom base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const baseUrl = 'http://127.0.0.1:9999';
    await localBridge.print({ jobType: 'receipt' }, baseUrl);
    await localBridge.encodeKeyCard(
      { roomNumber: '101', vendor: 'GENERIC' },
      baseUrl,
    );
    await localBridge.scanPassport(baseUrl);
    await localBridge.scanThaiId(baseUrl);
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/print`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/keycard/encode`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/scan/passport`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/scan/id-card`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('connection refused')),
    );
    await expect(localBridge.health()).rejects.toThrow('Network error');
  });
});
