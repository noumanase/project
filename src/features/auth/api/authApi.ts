// ─────────────────────────────────────────────────────────────────────────────
// features/auth/api/authApi.ts
//
// All HTTP calls related to authentication.
// Features own their own API files — they import the shared client,
// not axios directly.
// ─────────────────────────────────────────────────────────────────────────────

import { apiClient } from '@shared/api'
import type { LoginCredentials, LoginResponse } from '@shared/types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  // Call this on app boot to validate the stored token is still valid
  // and get a fresh user object (role may have changed since last login)
  getMe: async () => {
    const { data } = await apiClient.get<{ data: LoginResponse['user'] }>('/auth/me')
    return data.data
  },
}
