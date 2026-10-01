# PS5 Rental Backend

Node.js, Express, and PostgreSQL backend using ES modules throughout.

## Structure

1. `src/constant.js`: flat endpoint names and paths, such as `CONSOLES: "/consoles"`.
2. `src/routes/availabilityRoute.js`: HTTP methods and handler mapping.
3. `src/handlers/availabilityHandler.js`: HTTP responses and request error handling.
4. `src/dao/availabilityDao.js`: SQL queries and database results.
5. `src/db.js`: environment loading and the shared PostgreSQL pool.
6. `src/routes/registerRoutes.js`: feature router registration.

`src/app.js` configures Express and JSON error responses. `server.js` checks
database connectivity, starts the HTTP server, and handles shutdown.

The API prefix `/api/v1` is mounted in `src/app.js`; the feature prefix
`/availability` is mounted in `src/routes/registerRoutes.js`.
In your editor, use Find All References on `CONSOLES` to locate its route.
Use Go to Definition on the route's `getAllConsoles` handler and then on
`availabilityDao.getAllConsoles` to navigate to the handler and DAO.

## Run

Use Node.js 20 or later. From the backend directory:

```sh
npm ci
npm run dev
```

For a new setup, copy `.env.example` to `.env` and set `DATABASE_URL` to the
PostgreSQL connection string from your Neon dashboard. Existing `.env` settings
are preserved. `db.js` uses the existing `pg` driver with TLS certificate and
hostname verification. The old `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
and `DB_PORT` settings are no longer used. No serverless driver is required.
Use `npm start` to run without the development watcher.

## Endpoints

- `GET /`: server running message.
- `GET /api/v1/availability/consoles`: currently runs the requested connection
  test `SELECT NOW() AS current_time`, returned as `{ success, message, data }`.
  The `data` array contains one object with `current_time`.

The current query needs no tables. This project does not create or modify
database tables automatically. The root endpoint is a liveness
response; it does not query the database on every request.

The frontend continues to call `/availability/consoles` using its `/api/v1`
base URL. Keep the backend on port 5000 for the existing Vite proxy.

CORS currently allows all origins, preserving the existing behavior.
Both npm and Yarn lockfiles were already present; the commands above use npm.
The repository's root `.gitignore` currently excludes the entire backend.
