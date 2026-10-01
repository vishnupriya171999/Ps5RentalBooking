import { jwtDecode } from 'jwt-decode'
import type { LoginDetails } from '../store/authSlice'

export const LOGIN_STORAGE_KEY = 'loginDetails'

export const decodeLoginToken = (token: string): LoginDetails => {
  const payload = jwtDecode<Record<string, unknown>>(token)

  if (token.split('.').length !== 3 || !Number.isSafeInteger(payload.id) ||
      typeof payload.name !== 'string' || typeof payload.mobile !== 'string' ||
      typeof payload.role !== 'string' || !payload.role.trim() ||
      typeof payload.exp !== 'number' || !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now() ||
      payload.iss !== 'ps5-rental-backend' || payload.aud !== 'ps5-rental-admin') {
    throw new Error('Invalid or expired login token.')
  }

  return {
    token,
    expiresAt: Number(payload.exp) * 1000,
    user: {
      id: Number(payload.id),
      name: String(payload.name),
      mobile: String(payload.mobile),
      role: String(payload.role),
    },
  }
}

export const loadLoginDetails = (): LoginDetails | null => {
  try {
    const raw = localStorage.getItem(LOGIN_STORAGE_KEY)

    if (!raw) return null

    const saved: unknown = JSON.parse(raw)

    if (
      typeof saved !== 'object' ||
      saved === null ||
      !('token' in saved) ||
      typeof saved.token !== 'string'
    ) {
      return null
    }

    const loginDetails = decodeLoginToken(saved.token)

    if (loginDetails.expiresAt <= Date.now()) {
      return null
    }

    return loginDetails
  } catch {
    try { localStorage.removeItem(LOGIN_STORAGE_KEY) } catch { /* Storage may be unavailable. */ }
    return null
  }
}

