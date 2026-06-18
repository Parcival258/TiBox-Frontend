import { useState, type FormEvent } from 'react'
import { useEscapeKey } from '@/shared/hooks/useEscapeKey'
import { formatDate } from '@/shared/utils/dateFormat'
import type { FinishMaintenanceSchedulePayload, MaintenanceSchedule } from '../types'
import { scheduleEquipmentName } from '../utils/maintenanceDisplay'
import {
  createFinishMaintenanceForm,
  finishMaintenanceFormToPayload,
  type FinishMaintenanceFormState,
} from '../utils/finishMaintenanceFormState'
import { MaintenanceInput, MaintenanceTextarea } from './MaintenanceFieldControls'

type MaintenanceFinishModalProps = {
  onClose: () => void
  onSubmit: (payload: FinishMaintenanceSchedulePayload) => Promise<void>
  schedule: MaintenanceSchedule | null
}

export function MaintenanceFinishModal({
  onClose,
  onSubmit,
  schedule,
}: MaintenanceFinishModalProps) {
  const [form, setForm] = useState<FinishMaintenanceFormState>(createFinishMaintenanceForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEscapeKey(Boolean(schedule), onClose)

  if (!schedule) {
    return null
  }

  const activeSchedule = schedule

  function setField<Key extends keyof FinishMaintenanceFormState>(
    key: Key,
    value: FinishMaintenanceFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setHasError(false)

    try {
      await onSubmit(finishMaintenanceFormToPayload(form, activeSchedule))
      setForm(createFinishMaintenanceForm())
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <form
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Finalizar mantenimiento</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{scheduleEquipmentName(schedule)}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {schedule.assignedTechnician?.name ?? 'Sin tecnico asignado'} / {formatDate(schedule.scheduledFor)}
            </p>
          </div>
          <button
            className="rounded-md border border-slate-700 px-2.5 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        {hasError && (
          <p className="mt-4 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            No fue posible finalizar el mantenimiento.
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <MaintenanceInput
            label="Fecha realizada"
            type="date"
            value={form.performedAt}
            onChange={(value) => setField('performedAt', value)}
          />
          <MaintenanceInput
            label="Costo"
            type="number"
            value={form.cost}
            onChange={(value) => setField('cost', value)}
          />
        </div>
        <div className="mt-4 grid gap-4">
          <MaintenanceTextarea
            label="Descripcion"
            minHeightClassName="min-h-24"
            value={form.description}
            onChange={(value) => setField('description', value)}
          />
          <MaintenanceTextarea
            label="Diagnostico"
            minHeightClassName="min-h-24"
            value={form.diagnosis}
            onChange={(value) => setField('diagnosis', value)}
          />
          <MaintenanceTextarea
            label="Acciones realizadas"
            minHeightClassName="min-h-24"
            value={form.actionsTaken}
            onChange={(value) => setField('actionsTaken', value)}
          />
          <MaintenanceTextarea
            label="Partes reemplazadas"
            minHeightClassName="min-h-24"
            value={form.partsReplaced}
            onChange={(value) => setField('partsReplaced', value)}
          />
          <MaintenanceInput
            label="Proximo mantenimiento"
            type="date"
            value={form.nextMaintenanceAt}
            onChange={(value) => setField('nextMaintenanceAt', value)}
          />
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || !form.diagnosis || !form.actionsTaken}
            type="submit"
          >
            {isSubmitting ? 'Guardando...' : 'Finalizar'}
          </button>
        </div>
      </form>
    </div>
  )
}
