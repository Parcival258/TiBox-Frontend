import type { FormEvent } from 'react'
import type { EquipmentLoan } from '../types'
import { equipmentLabel } from '../utils/loanDisplay'
import { Textarea } from './LoanFieldControls'

type LoanReturnModalProps = {
  isSubmitting: boolean
  loan: EquipmentLoan
  receivedSignatureImage: string
  returnNotes: string
  onClose: () => void
  onReceivedSignatureImageChange: (value: string) => void
  onReturnNotesChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function LoanReturnModal({
  isSubmitting,
  loan,
  receivedSignatureImage,
  returnNotes,
  onClose,
  onReceivedSignatureImageChange,
  onReturnNotesChange,
  onSubmit,
}: LoanReturnModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <form
        className="w-full max-w-xl rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-300">Recibir equipo</p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              {loan.equipment ? equipmentLabel(loan.equipment) : 'Equipo sin asignar'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{loan.borrowerLabel}</p>
          </div>
          <button
            className="rounded-md border border-slate-700 px-2.5 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
        <div className="mt-5 space-y-3">
          <Textarea
            label="Firma recibido"
            value={receivedSignatureImage}
            onChange={onReceivedSignatureImageChange}
          />
          <Textarea label="Observacion" value={returnNotes} onChange={onReturnNotesChange} />
        </div>
        <div className="mt-5 flex justify-end">
          <button
            className="rounded-md border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:text-white disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            Registrar devolucion
          </button>
        </div>
      </form>
    </div>
  )
}
