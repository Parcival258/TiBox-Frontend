import type { Person } from '@/shared/types/person'

export type EquipmentAssignment = {
  id: string
  user: Person
  assigner: Person
  assignedAt: string
  returnedAt: string | null
  notes: string | null
}
