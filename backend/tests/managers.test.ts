import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PRIVATE_KEY = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
process.env.JWT_PUBLIC_KEY = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const { default: app } = await import('../src/app.js');
const { default: pool } = await import('../src/db.js');

test('only active administrators can create managers, with passwords stored as hashes', async t => {
  const originalQuery = pool.query;
  const queries: { text: string; values: unknown[] }[] = [];
  let databaseError: string | null = null;
  let actor: { id: number; role: string; isActive: boolean } | null = { id: 42, role: 'ADMIN', isActive: true };
  let actorLookupFails = false;
  pool.query = (async (text: string, values: unknown[]) => {
    if (text.startsWith('SELECT')) {
      assert.match(text, /WHERE "ID" = \$1/);
      assert.equal(values[0], 42);
      if (actorLookupFails) throw new Error('Database unavailable');
      return { rows: actor ? [actor] : [] };
    }
    queries.push({ text, values });
    if (databaseError) throw Object.assign(new Error('Database failure'), { code: databaseError });
    return { rows: [{ id: 1, name: values[0], mobile: values[1], role: values[3], isActive: values[4] }] };
  }) as unknown as typeof pool.query;
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1/auth/managers`;
  const body = { name: 'Test Admin', mobile: '9876543210', password: 'Test-password-42', role: 'MANAGER' };
  const sign = (role: string, expiresIn = 3600, key = keys.privateKey) => jwt.sign({ id: 42, role }, key, {
    algorithm: 'RS256', issuer: 'ps5-rental-backend', audience: 'ps5-rental-admin', expiresIn,
  });
  const token = sign('ADMIN');
  const create = async (data: unknown, bearer: string | null = token) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) }, body: JSON.stringify(data),
  });
  try {
    await t.test('missing, malformed, expired, or forged JWTs cannot create accounts', async () => {
      const otherKeys = generateKeyPairSync('rsa', { modulusLength: 2048 });
      for (const bearer of [null, 'bad-token', sign('ADMIN', -1), sign('ADMIN', 3600, otherKeys.privateKey)]) {
        assert.equal((await create({ ...body, role: 'ADMIN' }, bearer)).status, 401);
      }
      assert.equal(queries.length, 0);
    });
    await t.test('current database role blocks non-admins even with ADMIN token and payload', async () => {
      for (const role of ['MANAGER', 'SUPPORT']) {
        actor = { id: 42, role, isActive: true };
        assert.equal((await create({ ...body, role: 'ADMIN' }, sign(role))).status, 403);
        assert.equal((await create({ ...body, role: 'ADMIN' }, token)).status, 403);
      }
      assert.equal(queries.length, 0);
    });
    await t.test('inactive, deleted, and unverifiable administrator accounts cannot create', async () => {
      actor = { id: 42, role: 'ADMIN', isActive: false };
      assert.equal((await create(body)).status, 403);
      actor = null;
      assert.equal((await create(body)).status, 403);
      actorLookupFails = true;
      assert.equal((await create(body)).status, 500);
      actorLookupFails = false;
      assert.equal(queries.length, 0);
    });
    actor = { id: 42, role: 'Admin', isActive: true };
    assert.equal((await create({ ...body, password: null })).status, 400);
    assert.equal((await create({ ...body, mobile: 123 })).status, 400);
    assert.equal((await create({ ...body, role: undefined })).status, 400);
    assert.equal((await create({ ...body, role: null })).status, 400);
    assert.equal(queries.length, 0);
    const response = await create({ ...body, role: ' MANAGER ', passwordExpiresAt: '2100-01-01' });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const result = await response.json();
    assert.equal(result.manager.role, 'MANAGER');
    assert.equal(result.manager.isActive, true);
    assert.equal(queries[0].values[3], 'MANAGER');
    assert.ok(!JSON.stringify(result).includes(body.password));
    assert.match(queries[0].text, /VALUES \(\$1, \$2, \$3, \$4, \$5\)/);
    assert.match(queries[0].text, /"PASSWORD"/);
    const hash = queries[0].values[2] as string;
    assert.notEqual(hash, body.password);
    assert.equal(await bcrypt.compare(body.password, hash), true);
    assert.ok(!JSON.stringify(result).includes(hash));
    assert.equal((await (await create({ ...body, isActive: false })).json()).manager.isActive, false);
    assert.equal((await create({ ...body, isActive: 'false' })).status, 400);
    const adminResponse = await create({ ...body, role: 'ADMIN' });
    assert.equal(adminResponse.status, 201);
    assert.equal((await adminResponse.json()).manager.role, 'ADMIN');
    databaseError = '23505';
    assert.equal((await create(body)).status, 409);
    databaseError = '08006';
    assert.equal((await create(body)).status, 500);
  } finally {
    pool.query = originalQuery;
    await new Promise<void>(resolve => server.close(() => resolve()));
    await pool.end();
  }
});
