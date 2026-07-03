import {
  approveEquipmentLoan,
  createEquipmentLoan,
  rejectEquipmentLoan,
  requestEquipmentLoan,
  returnEquipmentLoan,
} from '../services/loanService'
import type {
  CreateEquipmentLoanPayload,
  EquipmentLoan,
  RequestEquipmentLoanPayload,
  ReturnEquipmentLoanPayload,
} from '../types'

type LoanActionDependencies = {
  refreshEquipmentLoans: () => Promise<unknown>
  refreshOperationalData: () => Promise<unknown>
  showSuccess: (message: string, subText?: string) => void
  upsertEquipmentLoan: (loan: EquipmentLoan) => void
}

export function createLoanActions({
  refreshEquipmentLoans,
  refreshOperationalData,
  showSuccess,
  upsertEquipmentLoan,
}: LoanActionDependencies) {
  return {
    createEquipmentLoan: async (payload: CreateEquipmentLoanPayload) => {
      const loan = await createEquipmentLoan(payload)
      upsertEquipmentLoan(loan)
      showSuccess('Prestamo registrado', 'El seguimiento quedo activo hasta la devolucion.')
      await refreshOperationalData()
    },
    requestEquipmentLoan: async (payload: RequestEquipmentLoanPayload) => {
      const loan = await requestEquipmentLoan(payload)
      upsertEquipmentLoan(loan)
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
