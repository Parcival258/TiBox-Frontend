import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import type { EquipmentCatalogs } from '@/features/inventory/types/equipmentCatalogs'
import type { Equipment } from '@/features/inventory/types/equipmentCore'
import { DateInput } from '@/shared/ui/DateInput'
import { AppLoader } from '@/shared/ui/Loaders'
import { formatDate } from '@/shared/utils/dateFormat'
import {
  getMaintenanceAttachments,
  getMaintenanceHistory,
  maintenanceAttachmentUrl,
} from '../services/maintenanceService'
import {
  MaintenanceFieldGroup,
  MaintenanceInput,
  MaintenanceSelect,
  MaintenanceTextarea,
} from '../components/MaintenanceFieldControls'
import {
  maintenanceStatusLabel,
  maintenanceTypeLabel,
  priorityLabel,
} from '@/shared/utils/enumLabels'
import type {
  EquipmentGroup,
  EquipmentGroupPayload,
  MaintenanceAttachment,
  MaintenanceFilters,
  MaintenanceHistoryItem,
  MaintenanceRecord,
  MaintenanceStage,
  MaintenanceSchedule,
} from '../types'
import type { ModuleState } from '@/shared/types/ui'

type StagePayload = Partial<{
  actionsTaken: string
  componentsCost: number
  componentsUsed: string
  cost: number
  description: string
  diagnosis: string
  finalDestination: string
  finalEquipmentState: string
  initialEquipmentState: string
  nextMaintenanceAt: string
  partsReplaced: string
  performedAt: string
  receptionObservations: string
  receivedByName: string
  softwareWork: string
  technicalObservations: string
}>

type MaintenancePageProps = {
  canClose: boolean
  canCreate: boolean
  canUpdate: boolean
  catalogs: EquipmentCatalogs | null
  equipment: Equipment[]
  equipmentGroups: EquipmentGroup[]
  filters: MaintenanceFilters
  records: MaintenanceRecord[]
  schedules: MaintenanceSchedule[]
  status: ModuleState
  onCancel: (scheduleId: string) => void
  onChangeFilters: (filters: MaintenanceFilters) => void
  onCreateGroup: (payload: EquipmentGroupPayload) => Promise<void>
  onCreateSchedule: () => void
  onFinish: (schedule: MaintenanceSchedule, payload: StagePayload) => Promise<void>
  onMarkPending: (scheduleId: string) => void
  onReschedule: (scheduleId: string, scheduledFor: string) => void
  onStart: (scheduleId: string) => void
  onUpdateClosure: (recordId: string, payload: StagePayload) => Promise<void>
  onUpdateExecution: (recordId: string, payload: StagePayload) => Promise<void>
  onUpdateReception: (recordId: string, payload: StagePayload) => Promise<void>
  onUploadEvidence: (recordId: string, stage: MaintenanceStage, file: File) => Promise<void>
}

const stages: Array<{ key: MaintenanceStage; label: string }> = [
  { key: 'reception', label: 'Recepcion' },
  { key: 'execution', label: 'Ejecucion' },
  { key: 'closure', label: 'Cierre' },
]

const finalDestinationOptions = [
  { label: 'Entregado', value: 'entregado' },
  { label: 'Almacenado', value: 'almacenado' },
  { label: 'Pendiente de entrega', value: 'pendiente_entrega' },
  { label: 'Retirado', value: 'retirado' },
]

export function MaintenancePage({
  canClose,
  canCreate,
  canUpdate,
  catalogs,
  equipment,
  equipmentGroups,
  filters,
  onChangeFilters,
  onCreateGroup,
  onCreateSchedule,
  onUpdateClosure,
  onUpdateExecution,
  onUpdateReception,
  onUploadEvidence,
  records,
  status,
}: MaintenancePageProps) {
  const [activeType, setActiveType] = useState<'preventive' | 'corrective'>('preventive')
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(records[0]?.id ?? null)
  const [activeStage, setActiveStage] = useState<MaintenanceStage>('reception')
  const [attachments, setAttachments] = useState<MaintenanceAttachment[]>([])
  const [history, setHistory] = useState<MaintenanceHistoryItem[]>([])
  const [groupForm, setGroupForm] = useState({ description: '', equipmentIds: [] as string[], name: '' })
  const [groupState, setGroupState] = useState<'idle' | 'saving' | 'error'>('idle')

  const visibleRecords = useMemo(
    () => records.filter((record) => record.maintenanceType === activeType),
    [activeType, records]
  )
  const selectedRecord =
    visibleRecords.find((record) => record.id === selectedRecordId) ?? visibleRecords[0] ?? null

  useEffect(() => {
    if (!selectedRecord && selectedRecordId) {
      setSelectedRecordId(null)
    }

    if (selectedRecord && selectedRecord.id !== selectedRecordId) {
      setSelectedRecordId(selectedRecord.id)
    }
  }, [selectedRecord, selectedRecordId])

  useEffect(() => {
    if (!selectedRecord) {
      setAttachments([])
      setHistory([])
      return
    }

    getMaintenanceAttachments(selectedRecord.id).then(setAttachments).catch(() => setAttachments([]))
    getMaintenanceHistory(selectedRecord.id).then(setHistory).catch(() => setHistory([]))
  }, [selectedRecord])

  function updateFilters(changes: MaintenanceFilters) {
    onChangeFilters({
      ...filters,
      ...changes,
      maintenanceType: activeType,
    })
  }

  async function handleCreateGroup(event: FormEvent) {
    event.preventDefault()
    setGroupState('saving')

    try {
      await onCreateGroup({
        description: groupForm.description,
        equipmentIds: groupForm.equipmentIds,
        name: groupForm.name,
      })
      setGroupForm({ description: '', equipmentIds: [], name: '' })
      setGroupState('idle')
    } catch {
      setGroupState('error')
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Mantenimientos</h2>
          <p className="text-sm text-slate-400">
            Planeacion, ejecucion, cierre y seguimiento de procesos preventivos y correctivos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`rounded-md border px-3 py-2 text-sm transition ${
              activeType === 'preventive'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100'
                : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
            type="button"
            onClick={() => {
              setActiveType('preventive')
              onChangeFilters({ ...filters, maintenanceType: 'preventive' })
            }}
          >
            Mantenimientos Preventivos
          </button>
          <button
            className={`rounded-md border px-3 py-2 text-sm transition ${
              activeType === 'corrective'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100'
                : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
            type="button"
            onClick={() => {
              setActiveType('corrective')
              onChangeFilters({ ...filters, maintenanceType: 'corrective' })
            }}
          >
            Mantenimientos Correctivos
          </button>
          {canCreate && (
            <button
              className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400"
              type="button"
              onClick={onCreateSchedule}
            >
              Nuevo mantenimiento
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <MaintenanceFiltersPanel
            catalogs={catalogs}
            equipmentGroups={equipmentGroups}
            filters={filters}
            onChange={updateFilters}
          />
          <EquipmentGroupsPanel
            equipment={equipment}
            equipmentGroups={equipmentGroups}
            form={groupForm}
            state={groupState}
            onChange={setGroupForm}
            onSubmit={handleCreateGroup}
          />
          <MaintenanceRecordList
            records={visibleRecords}
            selectedRecordId={selectedRecord?.id ?? null}
            status={status}
            onSelect={setSelectedRecordId}
          />
        </aside>

        <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900">
          {selectedRecord ? (
            <MaintenanceRecordDetail
              activeStage={activeStage}
              attachments={attachments}
              canClose={canClose}
              canUpdate={canUpdate}
              history={history}
              record={selectedRecord}
              onChangeStage={setActiveStage}
              onRefreshAttachments={() =>
                getMaintenanceAttachments(selectedRecord.id).then(setAttachments)
              }
              onUpdateClosure={onUpdateClosure}
              onUpdateExecution={onUpdateExecution}
              onUpdateReception={onUpdateReception}
              onUploadEvidence={onUploadEvidence}
            />
          ) : (
            <div className="p-8 text-center text-sm text-slate-400">
              No hay mantenimientos {maintenanceTypeLabel(activeType).toLowerCase()}s para los filtros seleccionados.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function MaintenanceFiltersPanel({
  catalogs,
  equipmentGroups,
  filters,
  onChange,
}: {
  catalogs: EquipmentCatalogs | null
  equipmentGroups: EquipmentGroup[]
  filters: MaintenanceFilters
  onChange: (filters: MaintenanceFilters) => void
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="text-sm font-semibold text-white">Filtros</h3>
      <div className="mt-3 space-y-3">
        <MaintenanceSelect
          label="Sede"
          value={filters.headquarterId ?? ''}
          options={(catalogs?.headquarters ?? []).map((headquarter) => ({
            label: headquarter.name,
            value: headquarter.id,
          }))}
          onChange={(headquarterId) => onChange({ headquarterId })}
        />
        <MaintenanceSelect
          label="Grupo"
          value={filters.equipmentGroupId ?? ''}
          options={equipmentGroups.map((group) => ({ label: group.name, value: group.id }))}
          onChange={(equipmentGroupId) => onChange({ equipmentGroupId })}
        />
        <MaintenanceSelect
          label="Estado"
          value={filters.status ?? ''}
          options={[
            { label: 'Pendiente', value: 'pending' },
            { label: 'En proceso', value: 'in_progress' },
            { label: 'Finalizado', value: 'completed' },
            { label: 'Cancelado', value: 'cancelled' },
          ]}
          onChange={(status) => onChange({ status })}
        />
        <DateInput
          label="Desde"
          value={filters.scheduledFrom ?? ''}
          onChange={(scheduledFrom) => onChange({ scheduledFrom })}
        />
        <DateInput
          label="Hasta"
          value={filters.scheduledTo ?? ''}
          onChange={(scheduledTo) => onChange({ scheduledTo })}
        />
      </div>
    </section>
  )
}

function EquipmentGroupsPanel({
  equipment,
  equipmentGroups,
  form,
  onChange,
  onSubmit,
  state,
}: {
  equipment: Equipment[]
  equipmentGroups: EquipmentGroup[]
  form: { description: string; equipmentIds: string[]; name: string }
  onChange: (form: { description: string; equipmentIds: string[]; name: string }) => void
  onSubmit: (event: FormEvent) => void
  state: 'idle' | 'saving' | 'error'
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="text-sm font-semibold text-white">Grupos de equipos</h3>
      <div className="mt-3 space-y-2">
        {equipmentGroups.slice(0, 4).map((group) => (
          <div className="rounded-md border border-slate-800 bg-slate-950 p-3" key={group.id}>
            <p className="text-sm font-medium text-slate-100">{group.name}</p>
            <p className="text-xs text-slate-500">{group.equipment.length} equipos</p>
          </div>
        ))}
      </div>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <MaintenanceInput
          label="Nombre del grupo"
          required
          value={form.name}
          onChange={(name) => onChange({ ...form, name })}
        />
        <MaintenanceTextarea
          label="Descripcion"
          minHeightClassName="min-h-20"
          value={form.description}
          onChange={(description) => onChange({ ...form, description })}
        />
        <label className="block text-sm">
          <span className="text-slate-500">Equipos</span>
          <select
            className="mt-1 min-h-28 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
            multiple
            value={form.equipmentIds}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              onChange({
                ...form,
                equipmentIds: Array.from(event.target.selectedOptions).map((option) => option.value),
              })
            }
          >
            {equipment.map((item) => (
              <option key={item.id} value={item.id}>
                {item.internalCode} / {item.type}
              </option>
            ))}
          </select>
        </label>
        {state === 'error' && (
          <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-xs text-red-200">
            No fue posible guardar el grupo.
          </p>
        )}
        <button
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-500 hover:text-white disabled:opacity-60"
          disabled={state === 'saving'}
          type="submit"
        >
          {state === 'saving' ? 'Guardando...' : 'Crear grupo'}
        </button>
      </form>
    </section>
  )
}

function MaintenanceRecordList({
  onSelect,
  records,
  selectedRecordId,
  status,
}: {
  onSelect: (recordId: string) => void
  records: MaintenanceRecord[]
  selectedRecordId: string | null
  status: ModuleState
}) {
  if (status === 'loading') {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <AppLoader label="Cargando mantenimientos..." />
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <h3 className="px-1 pb-2 text-sm font-semibold text-white">Seguimiento</h3>
      <div className="space-y-2">
        {records.map((record) => (
          <button
            className={`block w-full rounded-md border p-3 text-left transition ${
              record.id === selectedRecordId
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-800 bg-slate-950 hover:border-slate-600'
            }`}
            key={record.id}
            type="button"
            onClick={() => onSelect(record.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  {record.equipment?.internalCode ?? 'Equipo sin codigo'}
                </p>
                <p className="text-xs text-slate-500">
                  {record.equipment?.type ?? 'Equipo'} / {formatDate(record.scheduledDate)}
                </p>
              </div>
              <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                {maintenanceStatusLabel(record.status)}
              </span>
            </div>
            <ProgressLine record={record} compact />
          </button>
        ))}
        {records.length === 0 && (
          <p className="rounded-md border border-slate-800 bg-slate-950 px-3 py-4 text-sm text-slate-500">
            Sin mantenimientos abiertos para mostrar.
          </p>
        )}
      </div>
    </section>
  )
}

function MaintenanceRecordDetail({
  activeStage,
  attachments,
  canClose,
  canUpdate,
  history,
  onChangeStage,
  onRefreshAttachments,
  onUpdateClosure,
  onUpdateExecution,
  onUpdateReception,
  onUploadEvidence,
  record,
}: {
  activeStage: MaintenanceStage
  attachments: MaintenanceAttachment[]
  canClose: boolean
  canUpdate: boolean
  history: MaintenanceHistoryItem[]
  onChangeStage: (stage: MaintenanceStage) => void
  onRefreshAttachments: () => Promise<unknown>
  onUpdateClosure: (recordId: string, payload: StagePayload) => Promise<void>
  onUpdateExecution: (recordId: string, payload: StagePayload) => Promise<void>
  onUpdateReception: (recordId: string, payload: StagePayload) => Promise<void>
  onUploadEvidence: (recordId: string, stage: MaintenanceStage, file: File) => Promise<void>
  record: MaintenanceRecord
}) {
  return (
    <div className="min-w-0">
      <div className="border-b border-slate-800 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">
              {maintenanceTypeLabel(record.maintenanceType)}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              {record.equipment?.internalCode ?? 'Mantenimiento'} / {record.equipment?.type ?? 'Equipo'}
            </h3>
            <p className="text-sm text-slate-400">
              {record.equipment?.headquarter?.name ?? 'Sin sede'} / {record.equipment?.location?.area ?? 'Sin ubicacion'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <Metric label="Estado" value={maintenanceStatusLabel(record.status)} />
            <Metric label="Prioridad" value={priorityLabel(record.priority)} />
            <Metric label="Fecha" value={formatDate(record.scheduledDate ?? record.performedAt)} />
          </div>
        </div>
        <div className="mt-5">
          <ProgressLine record={record} />
        </div>
      </div>

      <div className="grid min-h-[560px] gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {stages.map((stage) => (
              <button
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  activeStage === stage.key
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
                key={stage.key}
                type="button"
                onClick={() => onChangeStage(stage.key)}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {activeStage === 'reception' && (
            <ReceptionStageForm
              disabled={!canUpdate}
              record={record}
              onSubmit={(payload) => onUpdateReception(record.id, payload)}
            />
          )}
          {activeStage === 'execution' && (
            <ExecutionStageForm
              disabled={!canUpdate}
              record={record}
              onSubmit={(payload) => onUpdateExecution(record.id, payload)}
            />
          )}
          {activeStage === 'closure' && (
            <ClosureStageForm
              disabled={!canClose}
              record={record}
              onSubmit={(payload) => onUpdateClosure(record.id, payload)}
            />
          )}

          <EvidencePanel
            activeStage={activeStage}
            attachments={attachments}
            recordId={record.id}
            onRefresh={onRefreshAttachments}
            onUploadEvidence={onUploadEvidence}
          />
        </div>

        <HistoryPanel history={history} />
      </div>
    </div>
  )
}

function ReceptionStageForm({
  disabled,
  onSubmit,
  record,
}: {
  disabled: boolean
  onSubmit: (payload: StagePayload) => Promise<void>
  record: MaintenanceRecord
}) {
  const [form, setForm] = useState({
    description: record.description ?? '',
    initialEquipmentState: record.initialEquipmentState ?? '',
    receptionObservations: record.receptionObservations ?? '',
  })

  return (
    <StageForm disabled={disabled} onSubmit={() => onSubmit(form)} submitLabel="Guardar recepcion">
      <MaintenanceFieldGroup title="Recepcion">
        <MaintenanceTextarea
          label="Estado inicial del equipo"
          value={form.initialEquipmentState}
          onChange={(initialEquipmentState) => setForm({ ...form, initialEquipmentState })}
        />
        <MaintenanceTextarea
          label="Observaciones"
          value={form.receptionObservations}
          onChange={(receptionObservations) => setForm({ ...form, receptionObservations })}
        />
        <MaintenanceTextarea
          label="Descripcion general"
          value={form.description}
          onChange={(description) => setForm({ ...form, description })}
        />
      </MaintenanceFieldGroup>
    </StageForm>
  )
}

function ExecutionStageForm({
  disabled,
  onSubmit,
  record,
}: {
  disabled: boolean
  onSubmit: (payload: StagePayload) => Promise<void>
  record: MaintenanceRecord
}) {
  const [form, setForm] = useState({
    actionsTaken: record.actionsTaken ?? '',
    componentsCost: record.componentsCost ?? record.cost ?? '',
    componentsUsed: record.componentsUsed ?? record.partsReplaced ?? '',
    diagnosis: record.diagnosis ?? '',
    softwareWork: record.softwareWork ?? '',
    technicalObservations: record.technicalObservations ?? '',
  })

  return (
    <StageForm
      disabled={disabled}
      onSubmit={() =>
        onSubmit({
          ...form,
          componentsCost: form.componentsCost ? Number(form.componentsCost) : undefined,
          cost: form.componentsCost ? Number(form.componentsCost) : undefined,
          partsReplaced: form.componentsUsed,
        })
      }
      submitLabel="Guardar ejecucion"
    >
      <MaintenanceFieldGroup title="Ejecucion del mantenimiento">
        <MaintenanceTextarea
          label="Actividades realizadas"
          value={form.actionsTaken}
          onChange={(actionsTaken) => setForm({ ...form, actionsTaken })}
        />
        <MaintenanceTextarea
          label="Observaciones tecnicas"
          value={form.technicalObservations}
          onChange={(technicalObservations) => setForm({ ...form, technicalObservations })}
        />
        <MaintenanceTextarea
          label="Componentes y materiales utilizados"
          value={form.componentsUsed}
          onChange={(componentsUsed) => setForm({ ...form, componentsUsed })}
        />
        <MaintenanceInput
          label="Costo de componentes"
          type="number"
          value={String(form.componentsCost)}
          onChange={(componentsCost) => setForm({ ...form, componentsCost })}
        />
        <MaintenanceTextarea
          label="Software instalado o configurado"
          value={form.softwareWork}
          onChange={(softwareWork) => setForm({ ...form, softwareWork })}
        />
        <MaintenanceTextarea
          label="Diagnostico"
          value={form.diagnosis}
          onChange={(diagnosis) => setForm({ ...form, diagnosis })}
        />
      </MaintenanceFieldGroup>
    </StageForm>
  )
}

function ClosureStageForm({
  disabled,
  onSubmit,
  record,
}: {
  disabled: boolean
  onSubmit: (payload: StagePayload) => Promise<void>
  record: MaintenanceRecord
}) {
  const [form, setForm] = useState({
    finalDestination: record.finalDestination ?? '',
    finalEquipmentState: record.finalEquipmentState ?? '',
    nextMaintenanceAt: record.nextMaintenanceAt ?? '',
    performedAt: record.performedAt?.slice(0, 10) ?? '',
    receivedByName: record.receivedByName ?? '',
  })

  return (
    <StageForm disabled={disabled} onSubmit={() => onSubmit(form)} submitLabel="Cerrar mantenimiento">
      <MaintenanceFieldGroup title="Cierre">
        <MaintenanceTextarea
          label="Estado final del equipo"
          value={form.finalEquipmentState}
          onChange={(finalEquipmentState) => setForm({ ...form, finalEquipmentState })}
        />
        <MaintenanceInput
          label="Persona que recibe"
          value={form.receivedByName}
          onChange={(receivedByName) => setForm({ ...form, receivedByName })}
        />
        <MaintenanceSelect
          label="Destino final"
          value={form.finalDestination}
          options={finalDestinationOptions}
          onChange={(finalDestination) => setForm({ ...form, finalDestination })}
        />
        <MaintenanceInput
          label="Fecha de cierre"
          type="date"
          value={form.performedAt}
          onChange={(performedAt) => setForm({ ...form, performedAt })}
        />
        <MaintenanceInput
          label="Proximo mantenimiento"
          type="date"
          value={form.nextMaintenanceAt}
          onChange={(nextMaintenanceAt) => setForm({ ...form, nextMaintenanceAt })}
        />
      </MaintenanceFieldGroup>
    </StageForm>
  )
}

function StageForm({
  children,
  disabled,
  onSubmit,
  submitLabel,
}: {
  children: ReactNode
  disabled: boolean
  onSubmit: () => Promise<void>
  submitLabel: string
}) {
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setState('saving')

    try {
      await onSubmit()
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {children}
      {state === 'error' && (
        <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          No fue posible guardar esta etapa.
        </p>
      )}
      <button
        className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || state === 'saving'}
        type="submit"
      >
        {state === 'saving' ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}

function EvidencePanel({
  activeStage,
  attachments,
  onRefresh,
  onUploadEvidence,
  recordId,
}: {
  activeStage: MaintenanceStage
  attachments: MaintenanceAttachment[]
  onRefresh: () => Promise<unknown>
  onUploadEvidence: (recordId: string, stage: MaintenanceStage, file: File) => Promise<void>
  recordId: string
}) {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error'>('idle')
  const stageAttachments = attachments.filter((attachment) => attachment.maintenanceStage === activeStage)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setUploadState('uploading')

    try {
      await onUploadEvidence(recordId, activeStage, file)
      await onRefresh()
      setUploadState('idle')
      event.target.value = ''
    } catch {
      setUploadState('error')
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Evidencias</h4>
          <p className="text-xs text-slate-500">Imagenes, PDF, Word o Excel asociados a la etapa.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-500">
          {uploadState === 'uploading' ? 'Cargando...' : 'Adjuntar'}
          <input
            className="sr-only"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFile}
          />
        </label>
      </div>
      {uploadState === 'error' && (
        <p className="mt-3 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          No fue posible cargar la evidencia.
        </p>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {stageAttachments.map((attachment) => (
          <a
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-500"
            href={maintenanceAttachmentUrl(recordId, attachment.id)}
            key={attachment.id}
            rel="noreferrer"
            target="_blank"
          >
            <span className="block truncate">{attachment.fileName}</span>
            <span className="text-xs text-slate-500">{formatDate(attachment.createdAt)}</span>
          </a>
        ))}
        {stageAttachments.length === 0 && (
          <p className="text-sm text-slate-500">Sin evidencias en esta etapa.</p>
        )}
      </div>
    </section>
  )
}

function HistoryPanel({ history }: { history: MaintenanceHistoryItem[] }) {
  return (
    <aside className="border-t border-slate-800 p-5 lg:border-l lg:border-t-0">
      <h4 className="text-sm font-semibold text-white">Historial</h4>
      <div className="mt-4 space-y-3">
        {history.map((item) => (
          <div className="rounded-md border border-slate-800 bg-slate-950 p-3" key={item.id}>
            <p className="text-sm text-slate-200">{historyActionLabel(item.action)}</p>
            <p className="text-xs text-slate-500">
              {item.user?.name ?? 'Sistema'} / {formatDate(item.createdAt)}
            </p>
          </div>
        ))}
        {history.length === 0 && <p className="text-sm text-slate-500">Sin cambios registrados.</p>}
      </div>
    </aside>
  )
}

function ProgressLine({ compact = false, record }: { compact?: boolean; record: MaintenanceRecord }) {
  const completed = completedStageCount(record)

  return (
    <div className={compact ? 'mt-3' : ''}>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all"
          style={{ width: `${(completed / stages.length) * 100}%` }}
        />
      </div>
      {!compact && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {stages.map((stage, index) => (
            <div
              className={`rounded-md border px-3 py-2 text-center text-xs ${
                index < completed
                  ? 'border-cyan-700 bg-cyan-500/10 text-cyan-100'
                  : 'border-slate-800 text-slate-500'
              }`}
              key={stage.key}
            >
              {stage.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function completedStageCount(record: MaintenanceRecord) {
  if (record.status === 'completed') {
    return 3
  }

  if (record.currentStage === 'execution') {
    return 2
  }

  if (record.currentStage === 'reception') {
    return 1
  }

  return 0
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-100">{value}</p>
    </div>
  )
}

function historyActionLabel(action: string) {
  const labels: Record<string, string> = {
    'maintenance_record.closure_updated': 'Cierre actualizado',
    'maintenance_record.created': 'Mantenimiento creado',
    'maintenance_record.execution_updated': 'Ejecucion actualizada',
    'maintenance_record.reception_updated': 'Recepcion actualizada',
    'maintenance_record.updated': 'Mantenimiento actualizado',
  }

  return labels[action] ?? action
}
