import { getJson, patchJson, postJson } from '@/shared/services/api'
import type {
  CreateEquipmentLoanPayload,
  EquipmentLoan,
  LoanEquipment,
  RequestEquipmentLoanPayload,
  ReturnEquipmentLoanPayload,
} from '../types'
import type { PaginatedResponse } from '@/shared/types/pagination'

export async function getEquipmentLoans() {
  const response = await getJson<PaginatedResponse<EquipmentLoan>>('/api/v1/equipment-loans?perPage=50')
  return response.data
}

export function createEquipmentLoan(payload: CreateEquipmentLoanPayload) {
  return postJson<EquipmentLoan>('/api/v1/equipment-loans', payload)
}

export function requestEquipmentLoan(payload: RequestEquipmentLoanPayload) {
  return postJson<EquipmentLoan>('/api/v1/equipment-loans/requests', payload)
}

export function getRequestableEquipment() {
  return getJson<LoanEquipment[]>('/api/v1/equipment-loans/requestable-equipment')
}

export function approveEquipmentLoan(loanId: string, equipmentId: string) {
  return patchJson<EquipmentLoan>(`/api/v1/equipment-loans/${loanId}/approve`, { equipmentId })
}

export function rejectEquipmentLoan(loanId: string, reason: string) {
  return patchJson<EquipmentLoan>(`/api/v1/equipment-loans/${loanId}/reject`, { reason })
}

export function returnEquipmentLoan(loanId: string, payload: ReturnEquipmentLoanPayload) {
  return patchJson<EquipmentLoan>(`/api/v1/equipment-loans/${loanId}/return`, payload)
}
