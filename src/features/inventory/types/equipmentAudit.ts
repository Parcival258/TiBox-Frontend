import type { Person } from '@/shared/types/person'

export type AuditLog = {
  id: string
  action: string
  user: Person
  createdAt: string
}
