import { deleteJson, getJson, patchJson, postJson } from '@/shared/services/api'
import type { RoleOption, User, UserPayload } from '../types'

type UsersResponse = {
  users: User[]
}

type SerializedUsersResponse = {
  data: UsersResponse
}

type UserResponse = {
  user: User
}

type SerializedUserResponse = {
  data: UserResponse
}

type SerializedUser = {
  data: User
}

function unwrapUsers(response: UsersResponse | SerializedUsersResponse) {
  const users = 'data' in response ? response.data.users : response.users

  if (!Array.isArray(users)) {
    throw new Error('La respuesta de usuarios no tiene el formato esperado')
  }

  return users
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<User>
  return typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string'
}

export function unwrapUser(response: UserResponse | SerializedUserResponse | SerializedUser) {
  const candidate = 'data' in response
    ? ('user' in response.data ? response.data.user : response.data)
    : response.user

  if (!isUser(candidate)) {
    throw new Error('La respuesta del usuario no tiene el formato esperado')
  }

  return candidate
}

export function getUsers() {
  return getJson<UsersResponse | SerializedUsersResponse>('/api/v1/users').then(unwrapUsers)
}

export function getUserRoles() {
  return getJson<RoleOption[]>('/api/v1/users/roles')
}

export function createUser(payload: UserPayload & { password: string }) {
  return postJson<UserResponse | SerializedUserResponse | SerializedUser>('/api/v1/users', payload).then(unwrapUser)
}

export function updateUser(userId: string, payload: UserPayload) {
  return patchJson<UserResponse | SerializedUserResponse | SerializedUser>(`/api/v1/users/${userId}`, payload).then(unwrapUser)
}

export function reactivateUser(userId: string) {
  return patchJson<UserResponse | SerializedUserResponse | SerializedUser>(`/api/v1/users/${userId}/reactivate`).then(unwrapUser)
}

export function deleteUser(userId: string) {
  return deleteJson(`/api/v1/users/${userId}`)
}
