import { useMemo, useState, type FormEvent } from 'react'
import { useEscapeKey } from '@/shared/hooks/useEscapeKey'
import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { Equipment, EquipmentPayload } from '../types/equipmentCore'
import { EquipmentFormSections } from './equipmentForm/EquipmentFormSections'
import {
  equipmentToForm,
  formToEquipmentPayload,
  type EquipmentFormState,
} from './equipmentForm/equipmentFormState'

type EquipmentFormModalProps = {
  catalogs: EquipmentCatalogs | null
  equipment: Equipment | null
  isOpen: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (payload: EquipmentPayload) => Promise<void>
}

export type LocationSelectorState = {
  area: string
  floor: string
}

export type LocationSelectorOptions = {
  areas: Array<{ label: string; value: string }>
  floors: Array<{ label: string; value: string }>
  offices: Array<{ label: string; value: string }>
}

export function EquipmentFormModal(props: EquipmentFormModalProps) {
  if (!props.isOpen) {
    return null
  }

  return (
    <EquipmentFormModalContent
      {...props}
      key={`${props.mode}-${props.equipment?.id ?? 'new'}`}
    />
  )
}

function EquipmentFormModalContent({
  catalogs,
  equipment,
  isOpen,
  mode,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  const [form, setForm] = useState<EquipmentFormState>(() => equipmentToForm(equipment))
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [locationSelector, setLocationSelector] = useState<LocationSelectorState>(() =>
    locationSelectorFromId(equipmentToForm(equipment).locationId, catalogs)
  )

  useEscapeKey(isOpen, onClose)

  const headquarterLocations = useMemo(
    () =>
      (catalogs?.locations ?? []).filter(
        (location) => !form.headquarterId || location.headquarterId === form.headquarterId
      ),
    [catalogs?.locations, form.headquarterId]
  )
  const locationOptions = useMemo<LocationSelectorOptions>(() => {
    const floorLocations = headquarterLocations.filter(
      (location) => location.floor === locationSelector.floor
    )
    const areaLocations = floorLocations.filter((location) => location.area === locationSelector.area)

    return {
      floors: uniqueLocationOptions(headquarterLocations.map((location) => location.floor)),
      areas: uniqueLocationOptions(floorLocations.map((location) => location.area)),
      offices: areaLocations.map((location) => ({
        label: location.office || 'Sin oficina',
        value: location.id,
      })),
    }
  }, [headquarterLocations, locationSelector.area, locationSelector.floor])

  function setField<Key extends keyof EquipmentFormState>(key: Key, value: EquipmentFormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'headquarterId' ? { locationId: '' } : {}),
    }))

    if (key === 'headquarterId') {
      setLocationSelector({ floor: '', area: '' })
    }
  }

  function setLocationFloor(floor: string) {
    setLocationSelector({ floor, area: '' })
    setField('locationId', '')
  }

  function setLocationArea(area: string) {
    setLocationSelector((current) => ({ ...current, area }))
    setField('locationId', '')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    try {
      await onSubmit(formToEquipmentPayload(form))
      onClose()
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-2 py-3 sm:px-4 sm:py-8">
      <form
        className="w-full max-w-5xl rounded-lg border border-slate-800 bg-slate-900 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Equipo</p>
            <h2 className="text-xl font-semibold text-white">
              {mode === 'create' ? 'Nuevo equipo' : 'Editar equipo'}
            </h2>
          </div>
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <EquipmentFormSections
          catalogs={catalogs}
          form={form}
          locationOptions={locationOptions}
          locationSelector={locationSelector}
          onChangeField={setField}
          onChangeLocationArea={setLocationArea}
          onChangeLocationFloor={setLocationFloor}
        />

        {submitState === 'error' && (
          <p className="mx-5 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            No fue posible guardar el equipo. Revisa campos obligatorios o valores repetidos.
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitState === 'submitting'}
            type="submit"
          >
            {submitState === 'submitting' ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

function locationSelectorFromId(locationId: string, catalogs: EquipmentCatalogs | null): LocationSelectorState {
  const location = catalogs?.locations.find((item) => item.id === locationId)

  return {
    area: location?.area ?? '',
    floor: location?.floor ?? '',
  }
}

function uniqueLocationOptions(values: Array<string | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
    .sort((first, second) => first.localeCompare(second))
    .map((value) => ({ label: value, value }))
}
