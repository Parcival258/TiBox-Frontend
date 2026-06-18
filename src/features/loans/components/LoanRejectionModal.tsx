import type { FormEvent } from 'react'
import type { EquipmentLoan } from '../types'
import { Textarea } from './LoanFieldControls'

type LoanRejectionModalProps = {
  isSubmitting: boolean
  loan: EquipmentLoan
  rejectionReason: string
  onCancel: () => void
  onRejectionReasonChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function LoanRejectionModal({
  isSubmitting,
  loan,
  rejectionReason,
  onCancel,
  onRejectionReasonChange,
  onSubmit,
}: LoanRejectionModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <form
        className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onSubmit={onSubmit}
      >
        <p className="text-xs uppercase tracking-wide text-rose-300">Rechazar solicitud</p>
        <h3 className="mt-1 text-lg font-semibold text-white">{loan.requestedItem}</h3>
        <div className="mt-4">
          <Textarea
            label="Motivo del rechazo"
            value={rejectionReason}
            onChange={onRejectionReasonChange}
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
            className="rounded-md border border-rose-800 px-3 py-2 text-sm font-medium text-rose-200 disabled:opacity-50"
            disabled={isSubmitting || rejectionReason.trim().length < 2}
            type="submit"
          >
            Confirmar rechazo
          </button>
        </div>
      </form>
    </div>
  )
}
