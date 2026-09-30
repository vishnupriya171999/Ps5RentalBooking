import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const http = axios.create({
  baseURL: `${apiOrigin}/api/v1`,
  timeout: 10000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

const api = {
  get: <T = unknown>(url: string, config: AxiosRequestConfig = {}) => http.get<T>(url, config),
  post: <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) => http.post<T>(url, data, config),
  put: <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) => http.put<T>(url, data, config),
  patch: <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) => http.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config: AxiosRequestConfig = {}) => http.delete<T>(url, config),
}

export default api
