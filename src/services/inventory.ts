import { getJson } from './api'
import type {
  DashboardSummary,
  Equipment,
  EquipmentLifeSheet,
  Headquarter,
  PaginatedResponse,
} from '../types/inventory'

export function getDashboard() {
  return getJson<DashboardSummary>('/api/v1/dashboard')
}

export async function getEquipment() {
  const response = await getJson<PaginatedResponse<Equipment>>('/api/v1/equipment')

  return response.data
}

export function getEquipmentLifeSheet(equipmentId: string) {
  return getJson<EquipmentLifeSheet>(`/api/v1/equipment/${equipmentId}/life-sheet`)
}

export function getHeadquarters() {
  return getJson<Headquarter[]>('/api/v1/headquarters')
}
