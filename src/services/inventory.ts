import { getJson } from './api'
import type { DashboardSummary, Equipment, Headquarter } from '../types/inventory'

export function getDashboard() {
  return getJson<DashboardSummary>('/api/v1/dashboard')
}

export function getEquipment() {
  return getJson<Equipment[]>('/api/v1/equipment')
}

export function getHeadquarters() {
  return getJson<Headquarter[]>('/api/v1/headquarters')
}
