import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PRIVATE_KEY = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
process.env.JWT_PUBLIC_KEY = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const { default: app } = await import('../src/app.js');
const { default: pool } = await import('../src/db.js');

test('manager directory reads and updates real-shaped records safely', async t => {
  const original = pool.query;
  let actor = { id: 1, role: 'ADMIN', isActive: true };
  let missing = false;
  let failure: string | null = null;
  let updateValues: unknown[] = [];
  let updateSql = '';
  const publicRecord = { id: 2, name: 'Manager', mobile: '9876543210', role: 'MANAGER', isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01', passwordExpiresAt: '2027-01-01' };
  pool.query = (async (sql: string, values: unknown[] = []) => {
    if (sql.includes('WHERE "ID" = $1') && !sql.startsWith('UPDATE')) return { rows: [actor] };
    if (failure) throw Object.assign(new Error('Internal database details'), { code: failure });
    if (sql.startsWith('UPDATE')) {
      updateSql = sql; updateValues = values;
      return { rows: missing ? [] : [{ ...publicRecord, name: values[1], mobile: values[2], role: values[3], isActive: values[4] }] };
    }
    if (sql.includes('WHERE "MOBILE"')) return { rows: missing ? [] : [{ ID: 2, NAME: publicRecord.name, MOBILE: publicRecord.mobile, ROLE: publicRecord.role, IS_ACTIVE: true, PASSWORD: 'secret-hash', PASSWORD_SECONDS_LEFT: 5000, CREATED_AT: publicRecord.createdAt, UPDATED_AT: publicRecord.updatedAt, PASS_EXPIRY_DATE: publicRecord.passwordExpiresAt }] };
    assert.ok(!sql.includes('"PASSWORD"'));
    return { rows: [publicRecord] };
  }) as unknown as typeof pool.query;
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1/auth/managers`;
  const token = jwt.sign({ id: 1, role: 'ADMIN' }, keys.privateKey, { algorithm: 'RS256', issuer: 'ps5-rental-backend', audience: 'ps5-rental-admin', expiresIn: '1h' });
  const request = (path = '', body?: unknown) => fetch(url + path, { method: body ? 'PUT' : 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const input = { name: 'Updated Manager', mobile: '9876543211', role: 'SUPPORT', isActive: false };
  try {
    await t.test('list and mobile lookup exclude passwords', async () => {
      assert.equal((await fetch(url)).status, 401);
      const list = await request(); assert.equal(list.status, 200);
      assert.deepEqual((await list.json()).managers, [publicRecord]);
      const detail = await request('/9876543210'); assert.equal(detail.status, 200);
      assert.deepEqual((await detail.json()).manager, publicRecord);
      missing = true; assert.equal((await request('/9876543210')).status, 404); missing = false;
      assert.equal((await request('/invalid')).status, 400);
    });
    await t.test('database role and active status authorize requests', async () => {
      for (const role of ['SUPPORT', 'MANAGER', 'Admin']) {
        actor = { ...actor, role };
        assert.equal((await request()).status, 200);
        assert.equal((await request('/9876543210')).status, 200);
      }
      actor = { ...actor, role: 'SUPPORT' };
      assert.equal((await request('/2', input)).status, 403);
      actor = { ...actor, role: 'ADMIN', isActive: false };
      assert.equal((await request()).status, 403);
      assert.equal((await request('/9876543210')).status, 403);
      assert.equal((await request('/2', input)).status, 403);
      actor = { ...actor, isActive: true };
    });
    await t.test('updates preserve passwords unless replaced and persist inactive status', async () => {
      const response = await request('/2', input); assert.equal(response.status, 200);
      assert.equal((await response.json()).manager.isActive, false);
      assert.deepEqual(updateValues, [2, input.name, input.mobile, input.role, false, null]);
      assert.match(updateSql, /COALESCE\(\$6, "PASSWORD"\)/);
      assert.match(updateSql, /THEN "PASS_EXPIRY_DATE"/);
      const updated = await request('/2', { ...input, password: 'Changed-password-42' }); assert.equal(updated.status, 200);
      assert.equal(await bcrypt.compare('Changed-password-42', updateValues[5] as string), true);
      assert.ok(!(await updated.text()).includes(updateValues[5] as string));
    });
    await t.test('invalid data, self-deactivation, duplicates and missing records return clear errors', async () => {
      assert.equal((await request('/2', { ...input, mobile: "' OR 1=1 --" })).status, 400);
      assert.equal((await request('/2', { ...input, isActive: 'false' })).status, 400);
      assert.equal((await request('/2', { ...input, name: ' ' })).status, 400);
      assert.equal((await request('/2', { ...input, password: 'x'.repeat(73) })).status, 400);
      assert.equal((await request('/1', input)).status, 400);
      missing = true; assert.equal((await request('/2', input)).status, 404); missing = false;
      failure = '23505'; const duplicate = await request('/2', input); assert.equal(duplicate.status, 409);
      assert.equal((await duplicate.json()).message, 'Mobile number already exists.');
      failure = '08006'; const unavailable = await request(); assert.equal(unavailable.status, 500);
      assert.ok(!(await unavailable.text()).includes('Internal database details'));
    });
  } finally {
    pool.query = original;
    await new Promise<void>(resolve => server.close(() => resolve()));
    await pool.end();
  }
});
