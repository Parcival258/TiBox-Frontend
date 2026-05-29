import { getJson, postJson } from './api'
import type { User } from '../types/inventory'

type AuthResponse = {
  user: User
}

type SerializedAuthResponse = {
  data: AuthResponse
}

function unwrapAuthResponse(response: AuthResponse | SerializedAuthResponse) {
  return 'data' in response ? response.data : response
}

export function getCurrentUser() {
  return getJson<AuthResponse | SerializedAuthResponse>('/api/v1/me').then(unwrapAuthResponse)
}

export function login(email: string, password: string) {
  return postJson<AuthResponse | SerializedAuthResponse>('/api/v1/auth/login', {
    email,
    password,
  }).then(unwrapAuthResponse)
}

export function logout() {
  return postJson<{ message: string }>('/api/v1/auth/logout')
}
