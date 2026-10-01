import axios from 'axios'
import api from './client'

export interface Manager {
  id: number
  name: string
  mobile: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  passwordExpiresAt: string
}
export interface ManagerInput {
  name: string
  mobile: string
  role: string
  isActive: boolean
  password?: string
}
interface ManagerResponse { success: boolean; manager: Manager }

export const fetchManagers = async (signal?: AbortSignal) =>
  (await api.get<{ success: boolean; managers: Manager[] }>('/auth/managers', { signal })).data.managers
export const fetchManager = async (mobile: string, signal?: AbortSignal) =>
  (await api.get<ManagerResponse>(`/auth/managers/${encodeURIComponent(mobile)}`, { signal })).data.manager
export const saveManager = async (input: ManagerInput, id?: number) =>
  (id === undefined
    ? await api.post<ManagerResponse>('/auth/managers', input)
    : await api.put<ManagerResponse>(`/auth/managers/${id}`, input)).data.manager
export const managerError = (error: unknown) => {
  if (axios.isAxiosError(error)) return error.response?.data?.message || 'Cannot reach the server. Please try again.'
  return 'Something went wrong. Please try again.'
}
