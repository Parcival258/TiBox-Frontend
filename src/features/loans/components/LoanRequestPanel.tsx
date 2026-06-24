import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { EquipmentCatalogs } from '@/features/inventory/types/equipmentCatalogs'
import type { Equipment } from '@/features/inventory/types/equipmentCore'
import type { LoanFormState } from '../utils/loanFormState'
import { equipmentLabel } from '../utils/loanDisplay'
import { Input, SearchableSelect, Select, Textarea } from './LoanFieldControls'

type LoanRequestPanelProps = {
  canCreate: boolean
  canRequest: boolean
  catalogs: EquipmentCatalogs | null
  equipment: Equipment[]
  form: LoanFormState
  hasError: boolean
  isSubmitting: boolean
  setForm: Dispatch<SetStateAction<LoanFormState>>
  onCreate: (event: FormEvent) => void
  onRequest: (event: FormEvent) => void
}

const requestModeOptions = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Correo', value: 'correo' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Otro', value: 'otro' },
]

export function LoanRequestPanel({
  canCreate,
  canRequest,
  catalogs,
  equipment,
  form,
  hasError,
  isSubmitting,
  setForm,
  onCreate,
  onRequest,
}: LoanRequestPanelProps) {
  return (
    <aside className="min-w-0 space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-cyan-300">
          {canCreate ? 'Registro' : 'Solicitud'}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">
          {canCreate ? 'Nuevo prestamo' : 'Solicitar equipo'}
        </h3>
      </div>

      {hasError && (
        <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          No fue posible guardar la operacion.
        </p>
      )}

      {canCreate ? (
        <form className="space-y-3" onSubmit={onCreate}>
          <SearchableSelect
            label="Equipo"
            placeholder="Buscar por codigo, serial, marca o modelo"
            value={form.equipmentId}
            onChange={(equipmentId) => setForm((current) => ({ ...current, equipmentId }))}
            options={equipment.map((item) => ({
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
          <Select
            label="Usuario existente"
            value={form.userId}
            onChange={(userId) => setForm((current) => ({ ...current, borrowerName: '', userId }))}
            options={(catalogs?.responsibles ?? []).map((responsible) => ({
              label: responsible.name,
              value: responsible.id,
            }))}
          />
          <Input
            disabled={Boolean(form.userId)}
            label="Nombre libre"
            value={form.borrowerName}
            onChange={(borrowerName) => setForm((current) => ({ ...current, borrowerName }))}
          />
          <Input
            label="Que solicita"
            value={form.requestedItem}
            onChange={(requestedItem) => setForm((current) => ({ ...current, requestedItem }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Fecha solicitud"
              type="date"
              value={form.requestedAt}
              onChange={(requestedAt) => setForm((current) => ({ ...current, requestedAt }))}
            />
            <Input
              label="Fecha prestamo"
              type="date"
              value={form.loanedAt}
              onChange={(loanedAt) => setForm((current) => ({ ...current, loanedAt }))}
            />
          </div>
          <Input
            label="Devolucion estimada"
            type="date"
            value={form.estimatedReturnAt}
            onChange={(estimatedReturnAt) =>
              setForm((current) => ({ ...current, estimatedReturnAt }))
            }
          />
          <Select
            label="Modo"
            value={form.requestMode}
            onChange={(requestMode) => setForm((current) => ({ ...current, requestMode }))}
            options={requestModeOptions}
          />
          <Textarea
            label="Firma imagen"
            value={form.signatureImage}
            onChange={(signatureImage) => setForm((current) => ({ ...current, signatureImage }))}
          />
          <Textarea
            label="Observacion"
            value={form.notes}
            onChange={(notes) => setForm((current) => ({ ...current, notes }))}
          />
          <button
            className="rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              isSubmitting ||
              !form.equipmentId ||
              !form.requestedItem ||
              !form.estimatedReturnAt ||
              (!form.userId && !form.borrowerName)
            }
            type="submit"
          >
            {isSubmitting ? 'Guardando...' : 'Crear prestamo'}
          </button>
        </form>
      ) : canRequest ? (
        <form className="space-y-3" onSubmit={onRequest}>
          <Input
            label="Que necesitas"
            value={form.requestedItem}
            onChange={(requestedItem) => setForm((current) => ({ ...current, requestedItem }))}
          />
          <Input
            label="Devolucion estimada"
            type="date"
            value={form.estimatedReturnAt}
            onChange={(estimatedReturnAt) =>
              setForm((current) => ({ ...current, estimatedReturnAt }))
            }
          />
          <Textarea
            label="Observaciones"
            value={form.notes}
            onChange={(notes) => setForm((current) => ({ ...current, notes }))}
          />
          <button
            className="w-full rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || !form.requestedItem || !form.estimatedReturnAt}
            type="submit"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>
          <p className="text-xs text-slate-500">
            Inventario elegira el equipo adecuado cuando revise la solicitud.
          </p>
        </form>
      ) : (
        <p className="text-sm text-slate-400">No tienes permisos para solicitar equipos.</p>
      )}
    </aside>
  )
}
