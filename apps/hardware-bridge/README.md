# PURA Hardware Bridge

Local loopback agent so the front-desk browser can print, encode a key card,
and scan a passport or Thai ID. This package ships **mock adapters only**
(no vendor SDKs).

## Bind address

Listens on **127.0.0.1:9247** by default (loopback only).

| Env    | Default     | Description  |
| ------ | ----------- | ------------ |
| `HOST` | `127.0.0.1` | Bind address |
| `PORT` | `9247`      | Bind port    |

## Run

```bash
pnpm --filter hardware-bridge dev
# or, after build:
pnpm --filter hardware-bridge build
pnpm --filter hardware-bridge start
```

CORS allows `http://localhost:3000` and `http://127.0.0.1:3000`.

## HTTP API

- `GET /health`
- `GET /devices`
- `POST /print`
- `POST /keycard/encode`
- `POST /scan/passport`
- `POST /scan/id-card`
