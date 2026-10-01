import axios from 'axios'
import api from './client'

interface LoginResponse {
  success: boolean
  token: string
}

export const loginAdmin = async (
  mobile: string,
  password: string
): Promise<string> => {
  try {
    const body = { mobile, password }
    const response = await api.post<LoginResponse>(
      '/auth/login',
      body
    )

    if (
      !response.data.success ||
      typeof response.data.token !== 'string'
    ) {
      throw new Error('Login failed. Please try again.')
    }

    return response.data.token
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error(
          'Mobile number or password is wrong.',
          { cause: error }
        )
      }

      if (error.response?.status === 403) {
        throw new Error(
          error.response?.data?.message || 'Your account is unavailable. Contact your administrator.',
          { cause: error }
        )
      }

      if (error.response?.status === 429) {
        throw new Error(
          'Too many attempts. Try again in 15 minutes.',
          { cause: error }
        )
      }

      throw new Error(
        error.response
          ? 'Login failed. Please try again.'
          : 'Cannot reach the server. Please try again.',
        { cause: error }
      )
    }

    throw error
  }
}
