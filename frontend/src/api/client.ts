import axios from 'axios'
import { store } from '../store/store'
import { logout } from '../store/authSlice'
import type { AxiosRequestConfig } from 'axios'

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const http = axios.create({
  baseURL: `${apiOrigin}/api/v1`,
  timeout: 10000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

http.interceptors.request.use(config => {
  const session = store.getState().auth.loginDetails
  if (session && session.expiresAt <= Date.now()) store.dispatch(logout())
  if (session && session.expiresAt > Date.now()) config.headers.Authorization = `Bearer ${session.token}`
  return config
})
http.interceptors.response.use(response => response, error => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.url !== '/auth/login') store.dispatch(logout())
  return Promise.reject(error)
})

const api = {
  get: <T = unknown>(url: string, config: AxiosRequestConfig = {}) => http.get<T>(url, config),
  post: <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) => http.post<T>(url, data, config),
  put: <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) => http.put<T>(url, data, config),
  patch: <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) => http.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config: AxiosRequestConfig = {}) => http.delete<T>(url, config),
}

export default api
