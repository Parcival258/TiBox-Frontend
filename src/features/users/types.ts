export type User = {
  id: string
  name: string
  email: string
  roleId?: string | null
  phone?: string | null
  jobTitle?: string | null
  department?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  role: {
    id: string
    name: string
    slug: string
  } | null
  permissions: string[]
}

export type RoleOption = {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
}

export type UserPayload = {
  name: string
  email: string
  password?: string
  roleId?: string
  phone?: string
  jobTitle?: string
  department?: string
  isActive?: boolean
}
