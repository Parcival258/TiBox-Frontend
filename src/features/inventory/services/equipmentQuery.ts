import { getJson } from '@/shared/services/api'
import type {
  Equipment,
  EquipmentFilters,
} from '../types/equipmentCore'
import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { EquipmentLifeSheet } from '../types/equipmentLifeSheet'
import type { PaginatedResponse } from '@/shared/types/pagination'

function toQueryString(filters: EquipmentFilters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getEquipment(filters: EquipmentFilters = {}) {
  return getJson<PaginatedResponse<Equipment>>(`/api/v1/equipment${toQueryString(filters)}`)
}

export function getEquipmentLifeSheet(equipmentId: string) {
  return getJson<EquipmentLifeSheet>(`/api/v1/equipment/${equipmentId}/life-sheet`)
}

export function getEquipmentCatalogs() {
  return getJson<EquipmentCatalogs>('/api/v1/equipment/catalogs')
}
