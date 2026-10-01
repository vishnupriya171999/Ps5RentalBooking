import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { AddressInfo } from 'node:net';
import type { SecurityManager } from '../src/dao/authDao.js';

const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PRIVATE_KEY = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
process.env.JWT_PUBLIC_KEY = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const { default: app } = await import('../src/app.js');
const { default: pool } = await import('../src/db.js');

test('login API validates the database account before issuing a JWT', async t => {
  const password = 'Test-password-42';
  const manager: SecurityManager = { ID: 1, IS_ACTIVE: true, CREATED_AT: '', UPDATED_AT: '', PASS_EXPIRY_DATE: '', NAME: 'Test Admin', MOBILE: '9876543210', ROLE: 'ADMIN', PASSWORD: await bcrypt.hash(password, 12), PASSWORD_SECONDS_LEFT: 864000 };
  let account: SecurityManager | null = manager;
  let unavailable = false;
  const queries: { text: string; values: unknown }[] = [];
  const originalQuery = pool.query;
  pool.query = (async (text: string, values: unknown) => {
    queries.push({ text, values });
    if (unavailable) throw new Error('Database unavailable');
    return { rows: account ? [account] : [] };
  }) as unknown as typeof pool.query;
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1/auth/login`;
  const login = async (body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    await t.test('successful login signs public details only', async () => {
      const response = await login({ mobile: manager.MOBILE, password });
      assert.equal(response.status, 200);
      const body = await response.json();
      const claims = jwt.verify(body.token, keys.publicKey, { algorithms: ['RS256'], issuer: 'ps5-rental-backend', audience: 'ps5-rental-admin' });
      assert.equal(jwt.decode(body.token, { complete: true })?.header.alg, 'RS256');
      const otherKeys = generateKeyPairSync('rsa', { modulusLength: 2048 });
      assert.throws(() => jwt.verify(body.token, otherKeys.publicKey, { algorithms: ['RS256'] }));
      assert.throws(() => jwt.verify(body.token, keys.publicKey, { algorithms: ['HS256'] }));
      assert.ok(typeof claims !== 'string');
      assert.equal(claims.id, manager.ID);
      assert.equal(claims.role, 'ADMIN');
      assert.equal(claims.exp! - claims.iat!, 8 * 60 * 60);
      assert.ok(!('PASSWORD' in claims));
      assert.ok(!JSON.stringify(body).includes(manager.PASSWORD));
      assert.deepEqual(body.manager, { id: 1, name: 'Test Admin', mobile: manager.MOBILE, role: 'ADMIN' });
      assert.match(queries[0].text, /"MOBILE" = \$1/);
      assert.deepEqual(queries[0].values, [manager.MOBILE]);
      assert.equal(response.headers.get('cache-control'), 'no-store');
    });
    await t.test('wrong password and unknown user return the same common error', async () => {
      const wrong = await login({ mobile: manager.MOBILE, password: 'wrong' });
      account = null;
      const missing = await login({ mobile: manager.MOBILE, password });
      assert.equal(wrong.status, 401); assert.equal(missing.status, 401);
      assert.deepEqual(await wrong.json(), await missing.json());
      account = manager;
    });
    await t.test('missing fields, SQL input and oversized password fail validation', async () => {
      const count = queries.length;
      for (const body of [{}, { mobile: "' OR 1=1 --", password }, { mobile: manager.MOBILE, password: 'x'.repeat(73) }]) assert.equal((await login(body)).status, 400);
      assert.equal(queries.length, count);
    });
    await t.test('stored roles can log in; expired or plaintext-password accounts cannot', async () => {
      account = { ...manager, IS_ACTIVE: false }; assert.equal((await login({ mobile: manager.MOBILE, password })).status, 403);
      account = { ...manager, ROLE: 'Support' }; assert.equal((await login({ mobile: manager.MOBILE, password })).status, 200);
      account = { ...manager, PASSWORD_SECONDS_LEFT: -1 }; assert.equal((await login({ mobile: manager.MOBILE, password })).status, 403);
      account = { ...manager, PASSWORD: password }; assert.equal((await login({ mobile: manager.MOBILE, password })).status, 401);
      account = manager;
    });
    await t.test('JWT expiry never exceeds password expiry', async () => {
      account = { ...manager, PASSWORD_SECONDS_LEFT: 30 };
      const body = await (await login({ mobile: manager.MOBILE, password })).json();
      const claims = jwt.verify(body.token, keys.publicKey, { algorithms: ['RS256'] }) as jwt.JwtPayload;
      assert.equal(claims.exp! - claims.iat!, 30); account = manager;
    });
    await t.test('database errors return a safe failure and no token', async () => {
      unavailable = true;
      const response = await login({ mobile: manager.MOBILE, password });
      assert.equal(response.status, 500); assert.equal((await response.json()).token, undefined); unavailable = false;
    });
    await t.test('middleware rejects missing, forged, expired and older-than-eight-hour tokens', async () => {
      const me = (token?: string) => fetch(url.replace('/login', '/me'), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      assert.equal((await me()).status, 401);
      assert.equal((await me('bad-token')).status, 401);
      const issue = (iat: number, expiresIn: number) => jwt.sign({ id: 1, name: 'Test Admin', mobile: manager.MOBILE, role: 'Support', iat }, keys.privateKey,
        { algorithm: 'RS256', issuer: 'ps5-rental-backend', audience: 'ps5-rental-admin', expiresIn });
      const now = Math.floor(Date.now() / 1000);
      assert.equal((await me(issue(now - 30000, 86400))).status, 401);
      assert.equal((await me(issue(now - 10, 1))).status, 401);
      const response = await me(issue(now, 28800));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).user.role, 'Support');
    });
    await t.test('repeated failures are rate limited', async () => {
      let status = 0;
      for (let index = 0; index < 12 && status !== 429; index++) status = (await login({})).status;
      assert.equal(status, 429);
    });
  } finally { pool.query = originalQuery; await new Promise<void>(resolve => server.close(() => resolve())); await pool.end(); }
});
