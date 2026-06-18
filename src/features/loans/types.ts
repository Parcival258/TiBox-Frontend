import type { Responsible } from '@/shared/types/person'

export type EquipmentLoanStatus =
  | 'requested'
  | 'active'
  | 'returned'
  | 'overdue'
  | 'cancelled'
  | 'rejected'

export type LoanEquipment = {
  id: string
  internalCode: string
  assetTag?: string | null
  serial?: string
  type: string
  brand: string | null
  model: string | null
}

export type EquipmentLoan = {
  id: string
  borrowerLabel: string
  borrowerName: string | null
  equipment: LoanEquipment | null
  estimatedReturnAt: string
  loanedAt: string | null
  notes: string | null
  receivedSignatureImage: string | null
  requestedAt: string
  requestedItem: string
  requestMode: string | null
  returnedAt: string | null
  signatureImage: string | null
  status: EquipmentLoanStatus
  statusLabel: string
  rejectionReason: string | null
  user: Responsible | null
}

export type RequestEquipmentLoanPayload = {
  estimatedReturnAt: string
  notes?: string
  requestedItem: string
}

export type CreateEquipmentLoanPayload = {
  borrowerName?: string
  equipmentId: string
  estimatedReturnAt: string
  loanedAt?: string
  notes?: string
  receivedSignatureImage?: string
  requestedAt?: string
  requestedItem: string
  requestMode?: string
  signatureImage?: string
  userId?: string
}

export type ReturnEquipmentLoanPayload = {
  notes?: string
  receivedSignatureImage?: string
  returnedAt?: string
}
