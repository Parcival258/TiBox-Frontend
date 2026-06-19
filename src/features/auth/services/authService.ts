import { getJson, postJson, refreshCsrfToken } from '@/shared/services/api'
import type { User } from '@/features/users/types'

type AuthResponse = {
  user: User
}

type SerializedAuthResponse = {
  data: AuthResponse
}

function unwrapAuthResponse(response: AuthResponse | SerializedAuthResponse) {
  return 'data' in response ? response.data : response
}

export async function getCurrentUser() {
  await refreshCsrfToken()
  return getJson<AuthResponse | SerializedAuthResponse>('/api/v1/me').then(unwrapAuthResponse)
}

export async function login(email: string, password: string) {
  await refreshCsrfToken()
  return postJson<AuthResponse | SerializedAuthResponse>('/api/v1/auth/login', {
    email,
    password,
  }).then(unwrapAuthResponse)
}

export function logout() {
  return postJson<{ message: string }>('/api/v1/auth/logout')
}
