# PS5 Rental frontend

React, TypeScript, and Vite. Application code lives in `src/`, with customer pages
at `/customer` and the admin login at `/admin`.

```sh
npm install
npm run dev
```

Run `npm run typecheck`, `npm run lint`, and `npm test` before building with
`npm run build`. The build includes strict TypeScript checking.

Local host and ports are shared with the backend in `../network.config.json`.
Change that file and restart both servers. No frontend `.env` is required locally.

For separate deployment, set `VITE_API_BASE_URL` to the backend origin before
building (without `/api/v1`). Set `CORS_ORIGINS` on the backend to the frontend
origin. See [Network configuration](../NETWORK_CONFIGURATION.md) for local
overrides and Vercel/Node hosting instructions. `.env.example` lists available
frontend environment settings.
