import { deleteJson, getJson, patchJson, postJson } from '@/shared/services/api'
import type { EquipmentType, EquipmentTypePayload } from '../types/equipmentCatalogs'

export function getEquipmentTypes() {
  return getJson<EquipmentType[]>('/api/v1/equipment-types')
}

export function createEquipmentType(payload: EquipmentTypePayload) {
  return postJson<EquipmentType>('/api/v1/equipment-types', payload)
}

export function updateEquipmentType(equipmentTypeId: string, payload: EquipmentTypePayload) {
  return patchJson<EquipmentType>(`/api/v1/equipment-types/${equipmentTypeId}`, payload)
}

export function deactivateEquipmentType(equipmentTypeId: string) {
  return deleteJson(`/api/v1/equipment-types/${equipmentTypeId}`)
}
