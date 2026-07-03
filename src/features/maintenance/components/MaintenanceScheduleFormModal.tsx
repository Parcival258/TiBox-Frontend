import { useMemo, useState, type FormEvent } from 'react'
import { useEscapeKey } from '@/shared/hooks/useEscapeKey'
import { ApiError } from '@/shared/services/api'
import type {
  CreateMaintenanceSchedulePayload,
  EquipmentGroup,
  MaintenanceScheduleCatalogs,
} from '../types'
import type { EquipmentCatalogs } from '@/features/inventory/types/equipmentCatalogs'
import type { Equipment } from '@/features/inventory/types/equipmentCore'
import {
  MaintenanceFieldGroup,
  MaintenanceInput,
  MaintenanceSearchableSelect,
  MaintenanceSelect,
  MaintenanceTextarea,
} from './MaintenanceFieldControls'
import { maintenanceEquipmentLabel } from '../utils/maintenanceDisplay'
import {
  emptyMaintenanceScheduleForm,
  fallbackMaintenancePriorities,
  fallbackMaintenanceStatuses,
  fallbackMaintenanceTypes,
  maintenanceScheduleFormToPayload,
  type MaintenanceScheduleFormState,
} from '../utils/maintenanceScheduleFormState'

type MaintenanceScheduleFormModalProps = {
  catalogs: MaintenanceScheduleCatalogs | null
  equipment: Equipment[]
  equipmentCatalogs: EquipmentCatalogs | null
  equipmentGroups: EquipmentGroup[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateMaintenanceSchedulePayload | CreateMaintenanceSchedulePayload[]) => Promise<void>
}

function responsibleSearchText(responsible: { email?: string; jobTitle?: string | null; name: string }) {
  return [responsible.name, responsible.email, responsible.jobTitle].filter(Boolean).join(' ')
}

function scheduleFormErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'No tienes permisos para programar mantenimientos.'
    }

    if (error.status === 422) {
      return 'El backend rechazo algun equipo, fecha o tecnico seleccionado.'
    }

    return `No fue posible programar el mantenimiento. ${error.message}`
  }

  if (error instanceof Error && error.message === 'Selected group has no equipment') {
    return 'El grupo seleccionado no tiene equipos activos para programar.'
  }

  return 'No fue posible programar el mantenimiento. Revisa equipo, fecha y permisos.'
}

export function MaintenanceScheduleFormModal(props: MaintenanceScheduleFormModalProps) {
  if (!props.isOpen) {
    return null
  }

  return <MaintenanceScheduleFormContent {...props} key="maintenance-schedule-form" />
}

function MaintenanceScheduleFormContent({
  catalogs,
  equipment,
  equipmentCatalogs,
  equipmentGroups,
  isOpen,
  onClose,
  onSubmit,
}: MaintenanceScheduleFormModalProps) {
  const [form, setForm] = useState<MaintenanceScheduleFormState>(emptyMaintenanceScheduleForm)
  const [scope, setScope] = useState<'equipment' | 'group'>('equipment')
  const [groupId, setGroupId] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEscapeKey(isOpen, onClose)

  const equipmentOptions = useMemo(
    () =>
      equipment
        .filter((item) => item.status !== 'retired')
        .map((item) => ({
          label: maintenanceEquipmentLabel(item),
          searchText: [
            item.internalCode,
            item.assetTag,
            item.serial,
            item.type,
            item.brand,
            item.model,
            item.currentResponsible?.name,
            item.headquarter?.name,
            item.location?.area,
            item.location?.office,
          ]
            .filter(Boolean)
            .join(' '),
          value: item.id,
        })),
    [equipment]
  )
  const selectedGroup = equipmentGroups.find((group) => group.id === groupId) ?? null
  const equipmentById = useMemo(() => new Map(equipment.map((item) => [item.id, item])), [equipment])
  const groupEquipment =
    selectedGroup?.equipment
      .map((item) => equipmentById.get(item.id))
      .filter((item): item is Equipment => Boolean(item))
      .filter((item) => item.status !== 'retired') ?? []

  function setField<Key extends keyof MaintenanceScheduleFormState>(
    key: Key,
    value: MaintenanceScheduleFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')
    setErrorMessage('')

    try {
      const basePayload = maintenanceScheduleFormToPayload(form)

      if (scope === 'group') {
        const { equipmentId: _unusedEquipmentId, ...scheduleFields } = basePayload
        const groupPayload = groupEquipment.map((item) => ({
          ...scheduleFields,
          equipmentId: item.id,
          notes: [basePayload.notes, selectedGroup ? `Grupo: ${selectedGroup.name}` : '']
            .filter(Boolean)
            .join('\n'),
        }))

        if (groupPayload.length === 0) {
          throw new Error('Selected group has no equipment')
        }

        await onSubmit(groupPayload)
      } else {
        await onSubmit(basePayload)
      }
      onClose()
    } catch (error) {
      setErrorMessage(scheduleFormErrorMessage(error))
      setSubmitState('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-2 py-3 sm:px-4 sm:py-8">
      <form
        className="w-full max-w-3xl rounded-lg border border-slate-800 bg-slate-900 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Mantenimientos</p>
            <h2 className="text-xl font-semibold text-white">Nuevo mantenimiento</h2>
          </div>
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <MaintenanceFieldGroup title="Planeacion">
            <MaintenanceSelect
              label="Alcance"
              value={scope}
              onChange={(value) => {
                const nextScope = value as 'equipment' | 'group'
                setScope(nextScope)
                setField('equipmentId', '')
                setGroupId('')
              }}
              options={[
                { label: 'Un equipo', value: 'equipment' },
                { label: 'Grupo completo', value: 'group' },
              ]}
            />
            {scope === 'equipment' ? (
              <MaintenanceSearchableSelect
                label="Equipo"
                placeholder="Buscar equipo"
                required
                value={form.equipmentId}
                onChange={(value) => setField('equipmentId', value)}
                options={equipmentOptions}
              />
            ) : (
              <>
                <MaintenanceSelect
                  label="Grupo"
                  required
                  value={groupId}
                  onChange={setGroupId}
                  options={equipmentGroups.map((group) => ({
                    label: `${group.name} (${group.equipment.length} equipos)`,
                    value: group.id,
                  }))}
                />
                {selectedGroup && (
                  <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
                    <p className="text-xs font-medium uppercase text-slate-500">Equipos incluidos</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {groupEquipment.map((item) => item.internalCode).join(', ') || 'Sin equipos activos'}
                    </p>
                    {selectedGroup.equipment.length !== groupEquipment.length && (
                      <p className="mt-2 text-xs text-amber-200">
                        Algunos equipos del grupo no estan disponibles para programacion.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            <MaintenanceInput
              label="Fecha programada"
              required
              type="date"
              value={form.scheduledFor}
              onChange={(value) => setField('scheduledFor', value)}
            />
            <MaintenanceSelect
              label="Tipo"
              value={form.maintenanceType}
              onChange={(value) => setField('maintenanceType', value as 'preventive' | 'corrective')}
              options={catalogs?.maintenanceTypes ?? fallbackMaintenanceTypes}
            />
            <MaintenanceSelect
              label="Estado"
              value={form.status}
              onChange={(value) => setField('status', value)}
              options={catalogs?.statuses ?? fallbackMaintenanceStatuses}
            />
          </MaintenanceFieldGroup>

          <MaintenanceFieldGroup title="Seguimiento">
            <MaintenanceSelect
              label="Prioridad"
              value={form.priority}
              onChange={(value) => setField('priority', value)}
              options={catalogs?.priorities ?? fallbackMaintenancePriorities}
            />
            <MaintenanceSearchableSelect
              label="Tecnico"
              placeholder="Buscar tecnico"
              value={form.assignedTechnicianId}
              onChange={(value) => setField('assignedTechnicianId', value)}
              options={(equipmentCatalogs?.responsibles ?? []).map((responsible) => ({
                label: responsible.name,
                searchText: responsibleSearchText(responsible),
                value: responsible.id,
              }))}
            />
            <MaintenanceInput
              label="Frecuencia meses"
              min="1"
              type="number"
              value={form.frequencyMonths}
              onChange={(value) => setField('frequencyMonths', value)}
            />
          </MaintenanceFieldGroup>

          <div className="md:col-span-2">
            <MaintenanceFieldGroup title="Notas">
              <MaintenanceTextarea
                label="Notas"
                value={form.notes}
                onChange={(value) => setField('notes', value)}
              />
            </MaintenanceFieldGroup>
          </div>
        </div>

        {submitState === 'error' && (
          <p className="mx-5 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {errorMessage || 'No fue posible programar el mantenimiento. Revisa equipo, fecha y permisos.'}
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
