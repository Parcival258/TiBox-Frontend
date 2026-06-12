import { useState } from 'react'
import type { EquipmentLoan, LoanEquipment } from '@/shared/types/inventory'
import type { ModuleState } from '@/shared/types/ui'

export function useLoansState() {
  const [equipmentLoans, setEquipmentLoans] = useState<EquipmentLoan[]>([])
  const [requestableEquipment, setRequestableEquipment] = useState<LoanEquipment[]>([])
  const [equipmentLoansStatus, setEquipmentLoansStatus] = useState<ModuleState>('loading')

  return {
    equipmentLoans,
    equipmentLoansStatus,
    requestableEquipment,
    setEquipmentLoans,
    setEquipmentLoansStatus,
    setRequestableEquipment,
  }
}
