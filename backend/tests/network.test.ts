import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';

const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PRIVATE_KEY = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
process.env.JWT_PUBLIC_KEY = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
process.env.CORS_ORIGINS = 'https://rental.example.com, https://preview.example.com';
const { getServerConfig } = await import('../src/config.js');
const { default: app } = await import('../src/app.js');

test('listener uses shared local settings and independent production overrides', () => {
  const saved = { HOST: process.env.HOST, PORT: process.env.PORT, NODE_ENV: process.env.NODE_ENV, VERCEL: process.env.VERCEL };
  try {
    for (const key of Object.keys(saved)) delete process.env[key];
    const local = JSON.parse(readFileSync(new URL('../../network.config.json', import.meta.url), 'utf8'));
    assert.deepEqual(getServerConfig(), { host: local.host, port: local.backendPort });

    process.env.NODE_ENV = 'production';
    assert.throws(getServerConfig, /Set PORT/);
    process.env.PORT = '8080';
    assert.deepEqual(getServerConfig(), { host: '0.0.0.0', port: 8080 });
    process.env.HOST = '127.0.0.2';
    assert.deepEqual(getServerConfig(), { host: '127.0.0.2', port: 8080 });
    for (const port of ['0', '-1', '65536', '5001.5', 'invalid']) {
      process.env.PORT = port;
      assert.throws(getServerConfig, /Set PORT/);
    }
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('separate frontend origins receive CORS headers and JWT preflight support', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    for (const origin of ['https://rental.example.com', 'https://preview.example.com']) {
      const response = await fetch(base, { headers: { Origin: origin } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('access-control-allow-origin'), origin);
      const preflight = await fetch(`${base}/api/v1/auth/managers`, {
        method: 'OPTIONS',
        headers: { Origin: origin, 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'authorization,content-type' },
      });
      assert.equal(preflight.status, 204);
      assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
      assert.match(preflight.headers.get('access-control-allow-headers') ?? '', /authorization/);
      assert.match(preflight.headers.get('access-control-allow-methods') ?? '', /PUT/);
    }
    const denied = await fetch(base, { headers: { Origin: 'https://unlisted.example.com' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('Vercel entry exports the app without starting a server or requiring PORT', async () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = '1';
  try {
    const { default: exportedApp } = await import('../server.js');
    assert.equal(exportedApp, app);
  } finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});
