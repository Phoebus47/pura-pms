import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import {
  encodeKeycard,
  getHealth,
  isEncodeError,
  listDevices,
  printJob,
  scanIdCard,
  scanPassport,
  type ErrorResponse,
} from './adapters.js';
import { applyCors, isPreflight } from './cors.js';

export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 9247;

const NOT_FOUND: ErrorResponse = { message: 'Not found' };
const INVALID_JSON: ErrorResponse = { message: 'Invalid JSON' };

export interface ListeningServer {
  server: Server;
  host: string;
  port: number;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readRawBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  const raw = await readRawBody(req);
  if (raw.trim().length === 0) {
    return {};
  }
  return JSON.parse(raw) as unknown;
}

function routeKey(method: string, pathname: string): string {
  return `${method} ${pathname}`;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  applyCors(req, res);

  if (isPreflight(req)) {
    res.statusCode = 204;
    res.end();
    return;
  }

  const method = req.method ?? 'GET';
  const pathname = new URL(req.url ?? '/', `http://${DEFAULT_HOST}`).pathname;
  const key = routeKey(method, pathname);

  try {
    switch (key) {
      case 'GET /health':
        sendJson(res, 200, getHealth());
        return;
      case 'GET /devices':
        sendJson(res, 200, listDevices());
        return;
      case 'POST /print':
        sendJson(res, 200, printJob(await parseJsonBody(req)));
        return;
      case 'POST /keycard/encode': {
        const outcome = encodeKeycard(await parseJsonBody(req));
        if (isEncodeError(outcome)) {
          sendJson(res, 400, outcome);
          return;
        }
        sendJson(res, 200, outcome);
        return;
      }
      case 'POST /scan/passport':
        sendJson(res, 200, scanPassport());
        return;
      case 'POST /scan/id-card':
        sendJson(res, 200, scanIdCard());
        return;
      default:
        sendJson(res, 404, NOT_FOUND);
    }
  } catch {
    sendJson(res, 400, INVALID_JSON);
  }
}

export function createHardwareBridgeServer(): Server {
  return createServer((req, res) => {
    void handleRequest(req, res);
  });
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

export function startListening(
  host = process.env.HOST ?? DEFAULT_HOST,
  port = parsePort(process.env.PORT, DEFAULT_PORT),
): Promise<ListeningServer> {
  const server = createHardwareBridgeServer();

  return new Promise((resolve, reject) => {
    const onError = (error: Error): void => {
      reject(error);
    };

    server.once('error', onError);
    server.listen(port, host, () => {
      server.removeListener('error', onError);
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to bind hardware-bridge server'));
        return;
      }
      resolve({ server, host, port: address.port });
    });
  });
}

export function stopListening(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
