// Vite replaces VITE_* variables at build time. Use the backend origin only;
// /api/v1 is appended here for every versioned API request.
export const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
export const API_BASE_URL = `${API_ORIGIN}/api/v1`
export const LOCATION_REVERSE_URL = `${API_ORIGIN}/api/location/reverse`
