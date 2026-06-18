import type { FormEvent } from 'react'
import type { EquipmentLoan, LoanEquipment } from '../types'
import { equipmentLabel } from '../utils/loanDisplay'
import { SearchableSelect } from './LoanFieldControls'

type LoanApprovalModalProps = {
  approvalEquipmentId: string
  isSubmitting: boolean
  loan: EquipmentLoan
  requestableEquipment: LoanEquipment[]
  onApprovalEquipmentChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: FormEvent) => void
}

export function LoanApprovalModal({
  approvalEquipmentId,
  isSubmitting,
  loan,
  requestableEquipment,
  onApprovalEquipmentChange,
  onCancel,
  onSubmit,
}: LoanApprovalModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <form
        className="w-full max-w-xl rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onSubmit={onSubmit}
      >
        <p className="text-xs uppercase tracking-wide text-emerald-300">Asignar equipo</p>
        <h3 className="mt-1 text-lg font-semibold text-white">{loan.requestedItem}</h3>
        <p className="mt-1 text-sm text-slate-400">Solicitud de {loan.borrowerLabel}</p>
        <div className="mt-5">
          <SearchableSelect
            label="Equipo a entregar"
            placeholder="Buscar equipo disponible"
            value={approvalEquipmentId}
            onChange={onApprovalEquipmentChange}
            options={requestableEquipment.map((item) => ({
              label: equipmentLabel(item),
              searchText: [
                item.internalCode,
                item.assetTag,
                item.serial,
                item.type,
                item.brand,
                item.model,
              ]
                .filter(Boolean)
                .join(' '),
              value: item.id,
            }))}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="rounded-md border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-100 disabled:opacity-50"
            disabled={isSubmitting || !approvalEquipmentId}
            type="submit"
          >
            Aprobar y asignar
          </button>
        </div>
      </form>
    </div>
  )
}
