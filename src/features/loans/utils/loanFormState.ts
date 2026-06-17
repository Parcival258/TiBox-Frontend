import type {
  CreateEquipmentLoanPayload,
  RequestEquipmentLoanPayload,
  ReturnEquipmentLoanPayload,
} from '../types'
import { today } from './loanDisplay'

export type LoanFormState = {
  borrowerName: string
  equipmentId: string
  estimatedReturnAt: string
  loanedAt: string
  notes: string
  requestedAt: string
  requestedItem: string
  requestMode: string
  signatureImage: string
  userId: string
}

export function createInitialLoanForm(): LoanFormState {
  const currentDate = today()

  return {
    borrowerName: '',
    equipmentId: '',
    estimatedReturnAt: '',
    loanedAt: currentDate,
    notes: '',
    requestedAt: currentDate,
    requestedItem: '',
    requestMode: 'presencial',
    signatureImage: '',
    userId: '',
  }
}

export function createLoanPayload(form: LoanFormState): CreateEquipmentLoanPayload {
  return {
    borrowerName: form.userId ? undefined : form.borrowerName || undefined,
    equipmentId: form.equipmentId,
    estimatedReturnAt: form.estimatedReturnAt,
    loanedAt: form.loanedAt || undefined,
    notes: form.notes || undefined,
    requestedAt: form.requestedAt || undefined,
    requestedItem: form.requestedItem,
    requestMode: form.requestMode || undefined,
    signatureImage: form.signatureImage || undefined,
    userId: form.userId || undefined,
  }
}

export function createLoanRequestPayload(form: LoanFormState): RequestEquipmentLoanPayload {
  return {
    estimatedReturnAt: form.estimatedReturnAt,
    notes: form.notes || undefined,
    requestedItem: form.requestedItem,
  }
}

export function createReturnLoanPayload(
  notes: string,
  receivedSignatureImage: string,
): ReturnEquipmentLoanPayload {
  return {
    notes: notes || undefined,
    receivedSignatureImage: receivedSignatureImage || undefined,
    returnedAt: today(),
  }
}
