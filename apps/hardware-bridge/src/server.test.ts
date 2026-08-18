import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startListening, stopListening } from './server.js';
import type { ListeningServer } from './server.js';

interface JsonResponse {
  status: number;
  body: unknown;
  headers: Headers;
}

async function requestJson(
  port: number,
  path: string,
  init: {
    method?: string;
    body?: unknown;
    origin?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<JsonResponse> {
  const headers: Record<string, string> = { ...init.headers };
  if (init.origin) {
    headers.Origin = init.origin;
  }
  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  return {
    status: response.status,
    body: (await response.json()) as unknown,
    headers: response.headers,
  };
}

describe('hardware-bridge HTTP server', () => {
  let live: ListeningServer;

  beforeAll(async () => {
    live = await startListening('127.0.0.1', 0);
  });

  afterAll(async () => {
    await stopListening(live.server);
  });

  it('lists mock devices', async () => {
    const response = await requestJson(live.port, '/devices');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns health', async () => {
    const response = await requestJson(live.port, '/health');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.body).toMatchObject({
      ok: true,
      service: 'pura-hardware-bridge',
    });
  });

  it('prints a mock job', async () => {
    const response = await requestJson(live.port, '/print', {
      method: 'POST',
      body: { copies: 2, jobType: 'FOLIO' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ printed: true, copies: 2 });
  });

  it('returns 400 when encode is missing roomNumber', async () => {
    const response = await requestJson(live.port, '/keycard/encode', {
      method: 'POST',
      body: { guestName: 'Somchai' },
    });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'roomNumber is required' });
  });

  it('encodes a mock keycard', async () => {
    const response = await requestJson(live.port, '/keycard/encode', {
      method: 'POST',
      body: { roomNumber: '305', vendor: 'VINGCARD' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      encoded: true,
      vendor: 'VINGCARD',
      roomNumber: '305',
    });
    const body = response.body as { vendorReference: string };
    expect(body.vendorReference.startsWith('MOCK-')).toBe(true);
  });

  it('scans a mock passport', async () => {
    const response = await requestJson(live.port, '/scan/passport', {
      method: 'POST',
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      firstName: 'Somchai',
      lastName: 'Jaidee',
      nationality: 'THA',
      idType: 'PASSPORT',
      idNumber: 'AA1234567',
    });
  });

  it('scans a mock Thai ID card', async () => {
    const response = await requestJson(live.port, '/scan/id-card', {
      method: 'POST',
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      firstName: 'Niran',
      lastName: 'Suksawat',
      nationality: 'TH',
      idType: 'NATIONAL_ID',
      idNumber: '1103700123456',
    });
  });

  it('returns 404 for unknown paths', async () => {
    const response = await requestJson(live.port, '/no-such-route');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Not found' });
  });

  it('handles CORS preflight from the web app origin', async () => {
    const response = await fetch(`http://127.0.0.1:${live.port}/print`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:3000',
    );
  });
});
