import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import bcrypt from 'bcrypt';

const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PRIVATE_KEY = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
process.env.JWT_PUBLIC_KEY = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const { default: app } = await import('../src/app.js');
const { default: pool } = await import('../src/db.js');

test('manager creation accepts normal JSON without a setup key and stores only a password hash', async () => {
  const originalQuery = pool.query;
  const queries: { text: string; values: unknown[] }[] = [];
  let databaseError: string | null = null;
  pool.query = (async (text: string, values: unknown[]) => {
    queries.push({ text, values });
    if (databaseError) throw Object.assign(new Error('Database failure'), { code: databaseError });
    return { rows: [{ id: 1, name: values[0], mobile: values[1], role: values[3], isActive: values[4] }] };
  }) as unknown as typeof pool.query;
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1/auth/managers`;
  const body = { name: 'Test Admin', mobile: '9876543210', password: 'Test-password-42', role: 'MANAGER' };
  const create = async (data: unknown) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  try {
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
