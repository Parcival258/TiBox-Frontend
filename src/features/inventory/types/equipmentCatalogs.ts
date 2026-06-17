import type { Responsible } from '@/shared/types/person'

export type EquipmentCatalogs = {
  statuses: readonly string[]
  ownershipTypes: readonly string[]
  types: string[]
  brands: string[]
  headquarters: Array<{ id: string; name: string; city: string | null }>
  locations: Array<{
    id: string
    headquarterId: string
    floor: string | null
    area: string | null
    office: string | null
  }>
  responsibles: Responsible[]
  technicians: Responsible[]
}

export type EquipmentType = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export type EquipmentTypePayload = {
  name: string
  description?: string
  isActive?: boolean
}
