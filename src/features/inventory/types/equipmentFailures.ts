import type { Person } from '@/shared/types/person'

export type CreateFailureReportPayload = {
  equipmentId: string
  title: string
  description: string
  priority?: string
}

export type FailureReport = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  reporter: Person
  createdAt: string
  closedAt: string | null
}
