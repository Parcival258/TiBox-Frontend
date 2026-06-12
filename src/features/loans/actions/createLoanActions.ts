import {
  approveEquipmentLoan,
  createEquipmentLoan,
  rejectEquipmentLoan,
  requestEquipmentLoan,
  returnEquipmentLoan,
} from '../services/loanService'
import type {
  CreateEquipmentLoanPayload,
  RequestEquipmentLoanPayload,
  ReturnEquipmentLoanPayload,
} from '@/shared/types/inventory'

type LoanActionDependencies = {
  refreshEquipmentLoans: () => Promise<unknown>
  refreshOperationalData: () => Promise<unknown>
  showSuccess: (message: string, subText?: string) => void
}

export function createLoanActions({
  refreshEquipmentLoans,
  refreshOperationalData,
  showSuccess,
}: LoanActionDependencies) {
  return {
    createEquipmentLoan: async (payload: CreateEquipmentLoanPayload) => {
      await createEquipmentLoan(payload)
      showSuccess('Prestamo registrado', 'El seguimiento quedo activo hasta la devolucion.')
      await refreshOperationalData()
    },
    requestEquipmentLoan: async (payload: RequestEquipmentLoanPayload) => {
      await requestEquipmentLoan(payload)
      showSuccess('Solicitud enviada', 'El equipo de inventario revisara tu solicitud.')
      await refreshEquipmentLoans()
    },
    approveEquipmentLoan: async (loanId: string, equipmentId: string) => {
      await approveEquipmentLoan(loanId, equipmentId)
      showSuccess('Solicitud aprobada', 'El prestamo quedo activo.')
      await refreshOperationalData()
    },
    rejectEquipmentLoan: async (loanId: string, reason: string) => {
      await rejectEquipmentLoan(loanId, reason)
      showSuccess('Solicitud rechazada', 'La decision quedo registrada.')
      await refreshEquipmentLoans()
    },
    returnEquipmentLoan: async (loanId: string, payload: ReturnEquipmentLoanPayload) => {
      await returnEquipmentLoan(loanId, payload)
      showSuccess('Devolucion registrada', 'El prestamo quedo cerrado correctamente.')
      await refreshOperationalData()
    },
  }
}
