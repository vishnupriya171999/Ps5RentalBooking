# PS5 Rental Backend

Node.js, Express, TypeScript, and PostgreSQL using ES modules.

## Run locally

From `backend/`, run `npm ci` and `npm run dev`. Configure database credentials
and matching RSA JWT keys in `.env` using `.env.example` as a reference. Preserve
existing credentials. `DATABASE_URL` is preferred; separate `DB_*` variables are
also supported. PostgreSQL connections require verified TLS.

Local host and port are shared with the frontend in `../network.config.json`.
Edit that file and restart both servers when changing ports. Remove local
`PORT`/`HOST` overrides if you want to use the shared settings.

`npm run build` compiles to `dist/`; `npm start` runs the compiled Node server.
Run `npm test` and `npm run typecheck` to verify changes. Tests stub database
queries and do not create real accounts.

## Structure and endpoints

`src/app.ts` configures Express, JSON responses, CORS, and the API prefix.
`src/routes/` maps endpoints to `src/handlers/`; handlers call SQL functions in
`src/dao/`, using the pool in `src/db.ts`. `server.ts` checks database connectivity
and manages the conventional Node listener. `src/config.ts` resolves network
settings and environment overrides.

- `GET /`: liveness response.
- `GET /api/v1/availability/consoles`: public connection test returning database
  time (`SELECT NOW()`), not inventory.
- `POST /api/v1/auth/login`: public, rate-limited login.
- `GET /api/v1/auth/me`: verified JWT user.
- `GET /api/v1/auth/managers` and `GET /api/v1/auth/managers/:mobile`: active account required.
- `POST /api/v1/auth/managers`: active ADMIN account required; rate limited.
- `PUT /api/v1/auth/managers/:id`: active ADMIN account required.

See [Login and sessions](LOGIN.md) for manager schema/migration requirements.
No booking or reverse-geocoding endpoint is currently implemented.

## Deploy independently

See [Network configuration](../NETWORK_CONFIGURATION.md) for Vercel and
conventional Node deployment settings. The backend needs its own database/JWT
environment values and `CORS_ORIGINS` for the deployed frontend. Production does
not require the frontend directory or the shared local configuration file.
