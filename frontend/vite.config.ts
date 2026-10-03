import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ command, mode }) => {
  const frontendRoot = fileURLToPath(new URL('.', import.meta.url));
  const env = loadEnv(mode, frontendRoot, '');
  const apiOrigin = env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
  if (apiOrigin) {
    const url = new URL(apiOrigin);
    if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
      throw new Error('VITE_API_BASE_URL must be an HTTP(S) origin without an API path, query, credentials, or fragment.');
    }
  }

  // Production builds work with frontend/ deployed on its own.
  if (command === 'build') return { plugins: [react(), tailwindcss()] };

  const localPath = new URL('../network.config.json', import.meta.url);
  const local = existsSync(localPath)
    ? JSON.parse(readFileSync(localPath, 'utf8')) as { host: string; frontendPort: number; backendPort: number }
    : undefined;
  const host = env.FRONTEND_HOST || local?.host;
  const port = Number(env.FRONTEND_PORT || local?.frontendPort);
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Configure network.config.json, or set FRONTEND_HOST and FRONTEND_PORT for standalone frontend development.');
  }
  if (!apiOrigin && (!local?.host || !Number.isInteger(local.backendPort) || local.backendPort < 1 || local.backendPort > 65535)) {
    throw new Error('Configure backendPort in network.config.json, or set VITE_API_BASE_URL to your backend origin.');
  }
  const proxy = apiOrigin ? undefined : { '/api': `http://${local!.host}:${local!.backendPort}` };
  return {
    plugins: [react(), tailwindcss()],
    server: { host, port, strictPort: true, open: '/customer', proxy },
    preview: { host, port, strictPort: true, proxy },
  };
});
