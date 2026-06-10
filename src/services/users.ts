import { deleteJson, getJson, patchJson, postJson } from './api'
import type { RoleOption, User, UserPayload } from '../types/inventory'

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

function unwrapUsers(response: UsersResponse | SerializedUsersResponse) {
  return 'data' in response ? response.data.users : response.users
}

function unwrapUser(response: UserResponse | SerializedUserResponse) {
  return 'data' in response ? response.data.user : response.user
}

export function getUsers() {
  return getJson<UsersResponse | SerializedUsersResponse>('/api/v1/users').then(unwrapUsers)
}

export function getUserRoles() {
  return getJson<RoleOption[]>('/api/v1/users/roles')
}

export function createUser(payload: UserPayload & { password: string }) {
  return postJson<UserResponse | SerializedUserResponse>('/api/v1/users', payload).then(unwrapUser)
}

export function updateUser(userId: string, payload: UserPayload) {
  return patchJson<UserResponse | SerializedUserResponse>(`/api/v1/users/${userId}`, payload).then(unwrapUser)
}

export function deleteUser(userId: string) {
  return deleteJson(`/api/v1/users/${userId}`)
}
