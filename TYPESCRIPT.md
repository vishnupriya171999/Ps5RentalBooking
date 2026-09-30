# TypeScript development

Application code uses `.tsx` for React components and `.ts` for data, API helpers,
routes, handlers, and database access. Both apps enable strict type checking.
Functions use `const` arrow syntax. Use concrete event and prop types instead of `any`.

## Frontend

From `frontend`:

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

The production build checks types before bundling. Shared booking types are in
`src/types.ts`. The admin submit handler uses `FormEvent<HTMLFormElement>`.
Authentication is not connected yet; validation does not grant admin access.
Password hashing belongs in the backend, not in the browser bundle.

## Backend

From `backend`:

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

Development runs `server.ts` with `tsx watch`. Production runs `dist/server.js`
after compiling. Relative backend imports keep `.js` extensions so the compiled
Node ESM output resolves correctly. Existing environment variables are unchanged.
Run production commands from the backend directory so dotenv finds its `.env`.

Use npm and the package-lock files for this setup. In VS Code, choose the workspace
TypeScript version. If an already-open editor still reports JavaScript diagnostics,
run **TypeScript: Restart TS Server** and reopen the renamed `.ts`/`.tsx` file.
