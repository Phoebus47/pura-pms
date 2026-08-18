export const DEFAULT_AGENT_URL = 'http://127.0.0.1:9247';

export interface LocalBridgeHealth {
  ok: boolean;
  devices?: unknown;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } catch (error) {
    throw new Error(
      `Network error: ${error instanceof Error ? error.message : url}`,
    );
  }

  if (!response.ok) {
    throw new Error(`Local agent error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function agentUrl(baseUrl?: string) {
  return baseUrl || DEFAULT_AGENT_URL;
}

export const localBridge = {
  async health(baseUrl?: string): Promise<LocalBridgeHealth> {
    return requestJson<LocalBridgeHealth>(`${agentUrl(baseUrl)}/health`);
  },

  async print(payload: unknown, baseUrl?: string): Promise<unknown> {
    return requestJson(`${agentUrl(baseUrl)}/print`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async encodeKeyCard(payload: unknown, baseUrl?: string): Promise<unknown> {
    return requestJson(`${agentUrl(baseUrl)}/keycard/encode`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async scanPassport(baseUrl?: string): Promise<unknown> {
    return requestJson(`${agentUrl(baseUrl)}/scan/passport`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async scanThaiId(baseUrl?: string): Promise<unknown> {
    return requestJson(`${agentUrl(baseUrl)}/scan/id-card`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};
