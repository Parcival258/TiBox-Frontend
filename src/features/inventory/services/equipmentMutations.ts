import { deleteJson, patchJson, postJson } from '@/shared/services/api'
import type { Equipment, EquipmentPayload } from '@/shared/types/inventory'

export function createEquipment(payload: EquipmentPayload) {
  return postJson<Equipment>('/api/v1/equipment', payload)
}

export function updateEquipment(equipmentId: string, payload: Partial<EquipmentPayload>) {
  return patchJson<Equipment>(`/api/v1/equipment/${equipmentId}`, payload)
}

export function deleteEquipment(equipmentId: string) {
  return deleteJson(`/api/v1/equipment/${equipmentId}`)
}
