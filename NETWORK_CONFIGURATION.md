# Hosts, ports, and separate deployments

## Local development: edit one file

Edit `network.config.json` in the repository root:

```json
{
  "host": "127.0.0.1",
  "frontendPort": 5173,
  "backendPort": 5001
}
```

Both applications read this file. `host` is the local hostname or IP used by both
servers, such as `127.0.0.1` or `localhost`. These are public network settings;
keep database credentials and JWT keys in `backend/.env`.

Run `npm run dev` in `backend/` and `frontend/` in separate terminals. Open the
frontend URL printed by Vite. Restart both processes after editing the settings.
Vite fails if the configured frontend port is occupied, rather than choosing a
different port silently.

Changing only `backendPort` to `6000` changes both the backend listener and the
frontend proxy target:

```text
Browser: http://127.0.0.1:5173/api/v1/auth/login
                         ↓ Vite proxy
Backend: http://127.0.0.1:6000/api/v1/auth/login
```

Do not also set local `PORT`, `HOST`, or `VITE_API_BASE_URL` unless you deliberately
want an override. Backend `PORT`/`HOST` override the listener only; the frontend
does not read backend secrets or backend environment files. `VITE_API_BASE_URL`
switches browser calls to that origin directly, bypassing the development proxy.

## Deploy frontend and backend separately

Each application can be deployed from its own directory. Production does not
require `network.config.json` or the other application's source files.

| Project | Setting | Example |
| --- | --- | --- |
| Frontend | Root directory | `frontend` |
| Frontend | Build command / output | `npm run build` / `dist` |
| Frontend | `VITE_API_BASE_URL` | `https://your-backend.example.com` |
| Backend | Root directory | `backend` |
| Backend | `CORS_ORIGINS` | `https://your-frontend.example.com` |
| Backend | Credentials | `DATABASE_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` |

Set these in the hosting provider's project environment settings. The frontend
URL must be the backend **origin only**, without `/api/v1`, a query, or credentials.
All versioned requests append `/api/v1` through `frontend/src/config/api.ts`.
For example, login becomes `https://your-backend.example.com/api/v1/auth/login`.

Vite embeds `VITE_API_BASE_URL` when building. Rebuild/redeploy the frontend after
changing it. Never put database credentials or JWT private keys in `VITE_*`
variables, which are exposed to the browser. Without this URL the frontend uses
same-origin `/api` requests, which requires a production reverse proxy; the
current frontend Vercel rewrite serves the SPA and is not an API proxy.

`CORS_ORIGINS` accepts comma-separated exact frontend origins, including any
preview deployments you want to allow. Use origins without paths or trailing
slashes. If unset, the backend retains its existing all-origin CORS behavior.
CORS does not replace API authentication.

### Vercel backend

Use Vercel's Express framework with `backend` as the project root. The existing
`src/app.ts` imports Express and exports the app without starting a listener,
matching Vercel's Express entry-point convention. Let the platform build/serve
the app; `server.ts` also exports the app and skips its listener when `VERCEL` is
set. `npm start` is for conventional Node hosting. Vercel manages the public
HTTPS address and port, so do not configure a localhost URL or local `PORT` there.
Set the backend environment values above and `NODE_ENV=production`.

### Conventional Node backend (Render, a container, or a VPS)

Run `npm run build`, then `npm start` from `backend/`. Set
`NODE_ENV=production` and use the provider's `PORT`; set `PORT` yourself if your
host does not supply it. The listener defaults to `HOST=0.0.0.0` in production.
The backend verifies database connectivity before opening its listener.

### Standalone frontend development

If you copy only `frontend/`, set `FRONTEND_HOST`, `FRONTEND_PORT`, and
`VITE_API_BASE_URL` in its `.env.local`. These replace the shared local settings.
For standalone backend development, set `HOST` and `PORT` in `backend/.env`.

## Code locations

- `network.config.json`: shared local host and ports.
- `frontend/vite.config.ts`: local listener, API proxy, and origin validation.
- `frontend/src/config/api.ts`: browser API origin and URL constants.
- `frontend/src/api/client.ts`: shared Axios client, JWT headers, and errors.
- `backend/src/config.ts`: backend listener settings, API prefix, and CORS origins.
- `backend/src/app.ts`: Express app usable by a serverless host.
- `backend/server.ts`: listener and shutdown lifecycle for conventional Node.

The location form also uses the shared API origin, but its existing
`POST /api/location/reverse` endpoint is still unimplemented. Booking persistence
and the other existing feature limitations are unaffected by network settings.

References: [Vite environment variables](https://vite.dev/guide/env-and-mode.html)
and [Express on Vercel](https://vercel.com/docs/frameworks/backend/express).
