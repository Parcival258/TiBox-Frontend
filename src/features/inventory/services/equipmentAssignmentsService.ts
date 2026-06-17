import { patchJson, postJson } from '@/shared/services/api'
import type { EquipmentAssignment } from '../types/equipmentAssignments'

export function assignEquipment(equipmentId: string, userId: string, notes?: string) {
  return postJson<EquipmentAssignment>(`/api/v1/equipment/${equipmentId}/assignments`, {
    userId,
    notes,
  })
}

export function returnEquipment(equipmentId: string, notes?: string) {
  return patchJson<EquipmentAssignment>(`/api/v1/equipment/${equipmentId}/assignments/current/return`, {
    notes,
  })
}
