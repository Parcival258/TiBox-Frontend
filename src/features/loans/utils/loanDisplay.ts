import type { Equipment } from '@/features/inventory/types/equipmentCore'
import type { EquipmentLoan } from '../types'

export const loanStatusStyles: Record<string, string> = {
  active: 'border-cyan-800 bg-cyan-950/40 text-cyan-200',
  overdue: 'border-red-800 bg-red-950/40 text-red-200',
  rejected: 'border-rose-800 bg-rose-950/40 text-rose-200',
  requested: 'border-amber-800 bg-amber-950/40 text-amber-200',
  returned: 'border-emerald-800 bg-emerald-950/40 text-emerald-200',
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function equipmentLabel(equipment: NonNullable<EquipmentLoan['equipment']> | Equipment) {
  const model = [equipment.brand, equipment.model].filter(Boolean).join(' ')

  return `${equipment.internalCode} / ${model || equipment.type}`
}
