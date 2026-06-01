import type { User } from '../types/inventory'

export function can(user: User | null, permission: string) {
  return Boolean(user?.permissions.includes(permission))
}

export function canAny(user: User | null, permissions: string[]) {
  return permissions.some((permission) => can(user, permission))
}
