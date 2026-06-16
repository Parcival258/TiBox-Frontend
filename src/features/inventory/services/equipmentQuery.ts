import { getJson } from '@/shared/services/api'
import type {
  Equipment,
  EquipmentCatalogs,
  EquipmentFilters,
  EquipmentLifeSheet,
  PaginatedResponse,
} from '@/shared/types/inventory'

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
