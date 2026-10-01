import test from 'node:test'
import assert from 'node:assert/strict'
import authReducer, { logout, setLoginDetails } from './authSlice'
import { decodeLoginToken, loadLoginDetails, LOGIN_STORAGE_KEY } from '../auth/session'

const tokenFor = (extra: Record<string, unknown> = {}) => {
  const claims = { id: 1, name: 'Test Admin', mobile: '9876543210', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600,
    iss: 'ps5-rental-backend', aud: 'ps5-rental-admin', ...extra }
  return `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.test-signature`
}

test('decoded login data contains only the token, expiry and public user claims', () => {
  const details = decodeLoginToken(tokenFor({ password: 'must-not-be-in-user', PASSWORD: 'must-not-be-in-user' }))
  assert.deepEqual(Object.keys(details.user).sort(), ['id', 'mobile', 'name', 'role'])
  assert.equal(details.user.name, 'Test Admin')
  assert.ok(details.expiresAt > Date.now())
  const state = authReducer(undefined, setLoginDetails(details))
  assert.equal(state.loginDetails?.token, details.token)
  assert.equal(authReducer(state, logout()).loginDetails, null)
})

test('malformed, expired, invalid-role and wrong-audience tokens are rejected', () => {
  for (const token of ['bad-token', tokenFor({ exp: 1 }), tokenFor({ role: null }), tokenFor({ aud: 'another-app' })]) {
    assert.throws(() => decodeLoginToken(token))
  }
})

test('refresh restores claims from the token and removes invalid saved sessions', t => {
  const existing = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
  } })
  t.after(() => { if (existing) Object.defineProperty(globalThis, 'localStorage', existing); else Reflect.deleteProperty(globalThis, 'localStorage') })
  values.set(LOGIN_STORAGE_KEY, JSON.stringify({ token: tokenFor(), user: { name: 'Edited storage' } }))
  assert.equal(loadLoginDetails()?.user.name, 'Test Admin')
  values.set(LOGIN_STORAGE_KEY, JSON.stringify({ token: tokenFor({ exp: 1 }) }))
  assert.equal(loadLoginDetails(), null)
  assert.equal(values.has(LOGIN_STORAGE_KEY), false)
  values.set(LOGIN_STORAGE_KEY, '{bad-json')
  assert.equal(loadLoginDetails(), null)
})
