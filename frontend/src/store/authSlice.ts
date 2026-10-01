import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AdminUser {
  id: number
  name: string
  mobile: string
  role: string
}

export interface LoginDetails {
  token: string
  user: AdminUser
  expiresAt: number
}

interface AuthState {
  loginDetails: LoginDetails | null
}

const initialState: AuthState = {
  loginDetails: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setLoginDetails: (
      state,
      action: PayloadAction<LoginDetails>
    ) => {
      state.loginDetails = action.payload

    },

    logout: state => {
      state.loginDetails = null
    },
  },
})

export const {
  setLoginDetails,
  logout,
} = authSlice.actions

export default authSlice.reducer