import type { User, UserPayload } from '../types'

export type UserForm = {
  department: string
  email: string
  isActive: boolean
  jobTitle: string
  name: string
  password: string
  phone: string
  roleId: string
}

export const emptyUserForm: UserForm = {
  department: '',
  email: '',
  isActive: true,
  jobTitle: '',
  name: '',
  password: '',
  phone: '',
  roleId: '',
}

export function userToForm(user: User): UserForm {
  return {
    department: user.department ?? '',
    email: user.email,
    isActive: user.isActive ?? true,
    jobTitle: user.jobTitle ?? '',
    name: user.name,
    password: '',
    phone: user.phone ?? '',
    roleId: user.role?.id ?? user.roleId ?? '',
  }
}

export function userFormToPayload(form: UserForm): UserPayload {
  return {
    department: optional(form.department),
    email: form.email.trim(),
    isActive: form.isActive,
    jobTitle: optional(form.jobTitle),
    name: form.name.trim(),
    phone: optional(form.phone),
    roleId: optional(form.roleId),
    ...(form.password ? { password: form.password } : {}),
  }
}

function optional(value: string) {
  return value.trim() || undefined
}
