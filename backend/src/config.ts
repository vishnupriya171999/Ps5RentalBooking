import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface LocalNetwork {
  host: string;
  frontendPort: number;
  backendPort: number;
}

// Find the shared local settings from both src/ and compiled dist/src/.
// Hosted deployments use environment variables and need no parent-directory files.
const loadLocalNetwork = (): Partial<LocalNetwork> => {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return {};
  let directory = dirname(fileURLToPath(import.meta.url));
  while (true) {
    const path = join(directory, 'network.config.json');
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8'));
    const parent = dirname(directory);
    if (parent === directory) return {};
    directory = parent;
  }
};

export const API_PREFIX = '/api/v1';
export const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) ?? [];

// Resolve listener settings only when starting a conventional Node server.
// Serverless platforms import the Express app without opening a local port.
export const getServerConfig = () => {
  const local = loadLocalNetwork();
  const host = process.env.HOST?.trim() || local.host || '0.0.0.0';
  const port = Number(process.env.PORT || local.backendPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Set PORT to an integer between 1 and 65535, or configure backendPort in network.config.json for local development.');
  }
  return { host, port };
};
