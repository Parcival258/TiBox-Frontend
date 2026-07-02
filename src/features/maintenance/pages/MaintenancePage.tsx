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
import { MaintenanceScheduleBoard } from '../components/MaintenanceScheduleBoard'
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
  closedAt: string
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
  receivedAt: string
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
  onDeleteGroup: (groupId: string) => Promise<void>
  onCreateSchedule: () => void
  onFinish: (schedule: MaintenanceSchedule, payload: StagePayload) => Promise<void>
  onMarkPending: (scheduleId: string) => void
  onReschedule: (scheduleId: string, scheduledFor: string) => void
  onStart: (scheduleId: string) => void
  onUpdateClosure: (recordId: string, payload: StagePayload) => Promise<void>
  onUpdateExecution: (recordId: string, payload: StagePayload) => Promise<void>
  onUpdateGroup: (groupId: string, payload: EquipmentGroupPayload) => Promise<void>
  onUpdateReception: (recordId: string, payload: StagePayload) => Promise<void>
  onDeleteEvidence: (recordId: string, attachmentId: string) => Promise<void>
  onUploadEvidence: (recordId: string, stage: MaintenanceStage, file: File) => Promise<void>
}

const stages: Array<{ key: MaintenanceStage; label: string }> = [
  { key: 'reception', label: 'Recepcion' },
  { key: 'execution', label: 'Ejecucion' },
  { key: 'closure', label: 'Cierre' },
]

type MaintenanceTab = 'processes' | 'groups' | 'schedule'

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
  onCancel,
  onChangeFilters,
  onCreateGroup,
  onDeleteGroup,
  onCreateSchedule,
  onFinish,
  onMarkPending,
  onReschedule,
  onStart,
  onUpdateClosure,
  onUpdateExecution,
  onUpdateGroup,
  onUpdateReception,
  onDeleteEvidence,
  onUploadEvidence,
  records,
  schedules,
  status,
}: MaintenancePageProps) {
  const [activeTab, setActiveTab] = useState<MaintenanceTab>('processes')
  const [activeType, setActiveType] = useState<'preventive' | 'corrective'>('preventive')
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(records[0]?.id ?? null)
  const [activeStage, setActiveStage] = useState<MaintenanceStage>('reception')
  const [attachments, setAttachments] = useState<MaintenanceAttachment[]>([])
  const [history, setHistory] = useState<MaintenanceHistoryItem[]>([])

  const visibleRecords = useMemo(
    () => records.filter((record) => record.maintenanceType === activeType),
    [activeType, records]
  )
  const processMetrics = useMemo(() => getProcessMetrics(visibleRecords), [visibleRecords])
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

    setActiveStage(selectedRecord.currentStage ?? 'reception')
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

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Mantenimientos</h2>
          <p className="text-sm text-slate-400">
            Procesos por etapas, grupos de equipos y agenda de mantenimiento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <MaintenanceTabs
        activeTab={activeTab}
        groupsCount={equipmentGroups.length}
        openSchedulesCount={
          schedules.filter((schedule) =>
            ['scheduled', 'pending', 'in_progress', 'rescheduled', 'overdue'].includes(schedule.status)
          ).length
        }
        recordsCount={visibleRecords.length}
        onChange={setActiveTab}
      />

      {activeTab === 'processes' && (
        <div className="grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)]">
          <MaintenanceProcessInbox
            activeType={activeType}
            catalogs={catalogs}
            equipmentGroups={equipmentGroups}
            filters={filters}
            metrics={processMetrics}
            records={visibleRecords}
            selectedRecordId={selectedRecord?.id ?? null}
            status={status}
            onChangeFilters={updateFilters}
            onChangeType={(maintenanceType) => {
              setActiveType(maintenanceType)
              onChangeFilters({ ...filters, maintenanceType })
            }}
            onSelect={setSelectedRecordId}
          />

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
                onDeleteEvidence={onDeleteEvidence}
                onUploadEvidence={onUploadEvidence}
              />
            ) : (
              <ProcessDetailEmptyState activeType={activeType} />
            )}
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <EquipmentGroupsPanel
            equipment={equipment}
            equipmentGroups={equipmentGroups}
            activeGroupId={filters.equipmentGroupId}
            records={records}
            onCreateGroup={onCreateGroup}
            onDeleteGroup={onDeleteGroup}
            onUpdateGroup={onUpdateGroup}
          />
      )}

      {activeTab === 'schedule' && (
        <MaintenanceScheduleBoard
          canClose={canClose}
          canCreate={canCreate}
          canUpdate={canUpdate}
          schedules={schedules}
          status={status}
          onCancel={onCancel}
          onCreateSchedule={onCreateSchedule}
          onFinish={onFinish}
          onMarkPending={onMarkPending}
          onReschedule={onReschedule}
          onStart={onStart}
        />
      )}
    </section>
  )
}

type ProcessMetrics = {
  closed: number
  execution: number
  notStarted: number
  reception: number
}

function MaintenanceProcessInbox({
  activeType,
  catalogs,
  equipmentGroups,
  filters,
  metrics,
  onChangeFilters,
  onChangeType,
  onSelect,
  records,
  selectedRecordId,
  status,
}: {
  activeType: 'preventive' | 'corrective'
  catalogs: EquipmentCatalogs | null
  equipmentGroups: EquipmentGroup[]
  filters: MaintenanceFilters
  metrics: ProcessMetrics
  onChangeFilters: (filters: MaintenanceFilters) => void
  onChangeType: (type: 'preventive' | 'corrective') => void
  onSelect: (recordId: string) => void
  records: MaintenanceRecord[]
  selectedRecordId: string | null
  status: ModuleState
}) {
  if (status === 'loading') {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <AppLoader label="Cargando procesos..." />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">Bandeja de procesos</h3>
            <p className="mt-1 text-sm text-slate-400">
              {records.length} {maintenanceTypeLabel(activeType).toLowerCase()}s visibles
            </p>
          </div>
          <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">
            {records.length}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <ProcessMetric label="Sin iniciar" value={metrics.notStarted} />
          <ProcessMetric label="Recepcion" value={metrics.reception} />
          <ProcessMetric label="Ejecucion" value={metrics.execution} />
          <ProcessMetric label="Cerrados" value={metrics.closed} />
        </div>
      </div>

      <div className="border-b border-slate-800 p-4">
        <div className="grid grid-cols-2 gap-2">
          {(['preventive', 'corrective'] as const).map((type) => (
            <button
              className={`rounded-md border px-3 py-2 text-sm transition ${
                activeType === type
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100'
                  : 'border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
              key={type}
              type="button"
              onClick={() => onChangeType(type)}
            >
              {type === 'preventive' ? 'Preventivos' : 'Correctivos'}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MaintenanceSelect
            label="Sede"
            value={filters.headquarterId ?? ''}
            options={(catalogs?.headquarters ?? []).map((headquarter) => ({
              label: headquarter.name,
              value: headquarter.id,
            }))}
            onChange={(headquarterId) => onChangeFilters({ headquarterId })}
          />
          <MaintenanceSelect
            label="Grupo"
            value={filters.equipmentGroupId ?? ''}
            options={equipmentGroups.map((group) => ({ label: group.name, value: group.id }))}
            onChange={(equipmentGroupId) => onChangeFilters({ equipmentGroupId })}
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
            onChange={(state) => onChangeFilters({ status: state })}
          />
          <DateInput
            label="Desde"
            value={filters.scheduledFrom ?? ''}
            onChange={(scheduledFrom) => onChangeFilters({ scheduledFrom })}
          />
          <DateInput
            label="Hasta"
            value={filters.scheduledTo ?? ''}
            onChange={(scheduledTo) => onChangeFilters({ scheduledTo })}
          />
        </div>
      </div>

      <div className="max-h-[720px] overflow-y-auto p-3">
        <MaintenanceRecordList
          records={records}
          selectedRecordId={selectedRecordId}
          status={status}
          onSelect={onSelect}
        />
      </div>
    </section>
  )
}

function ProcessMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-[11px] uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  )
}

function ProcessDetailEmptyState({ activeType }: { activeType: 'preventive' | 'corrective' }) {
  return (
    <div className="flex min-h-[560px] items-center justify-center p-8 text-center">
      <div>
        <h3 className="text-base font-semibold text-white">Sin proceso seleccionado</h3>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          No hay mantenimientos {maintenanceTypeLabel(activeType).toLowerCase()}s para los filtros seleccionados.
        </p>
      </div>
    </div>
  )
}

function MaintenanceTabs({
  activeTab,
  groupsCount,
  onChange,
  openSchedulesCount,
  recordsCount,
}: {
  activeTab: MaintenanceTab
  groupsCount: number
  onChange: (tab: MaintenanceTab) => void
  openSchedulesCount: number
  recordsCount: number
}) {
  const tabs: Array<{ count: number; key: MaintenanceTab; label: string }> = [
    { count: recordsCount, key: 'processes', label: 'Procesos' },
    { count: groupsCount, key: 'groups', label: 'Grupos de equipos' },
    { count: openSchedulesCount, key: 'schedule', label: 'Programacion' },
  ]

  return (
    <div className="grid gap-2 rounded-lg border border-slate-800 bg-slate-900 p-2 md:grid-cols-3">
      {tabs.map((tab) => (
        <button
          className={`flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition ${
            activeTab === tab.key
              ? 'border-cyan-600 bg-cyan-500/10 text-cyan-100'
              : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-950'
          }`}
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
        >
          <span className="font-medium">{tab.label}</span>
          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}

function EquipmentGroupsPanel({
  activeGroupId,
  equipment,
  equipmentGroups,
  records,
  onCreateGroup,
  onDeleteGroup,
  onUpdateGroup,
}: {
  activeGroupId?: string
  equipment: Equipment[]
  equipmentGroups: EquipmentGroup[]
  records: MaintenanceRecord[]
  onCreateGroup: (payload: EquipmentGroupPayload) => Promise<void>
  onDeleteGroup: (groupId: string) => Promise<void>
  onUpdateGroup: (groupId: string, payload: EquipmentGroupPayload) => Promise<void>
}) {
  const [form, setForm] = useState({ description: '', equipmentIds: [] as string[], name: '' })
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [equipmentAreaFilter, setEquipmentAreaFilter] = useState('')
  const [equipmentFloorFilter, setEquipmentFloorFilter] = useState('')
  const [equipmentHeadquarterFilter, setEquipmentHeadquarterFilter] = useState('')
  const [equipmentOfficeFilter, setEquipmentOfficeFilter] = useState('')
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState('')
  const [equipmentQuery, setEquipmentQuery] = useState('')
  const [groupQuery, setGroupQuery] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'deleting' | 'error'>('idle')
  const selectedEquipment = equipment.filter((item) => form.equipmentIds.includes(item.id))
  const selectedIds = new Set(form.equipmentIds)
  const normalizedEquipmentQuery = equipmentQuery.trim().toLowerCase()
  const normalizedGroupQuery = groupQuery.trim().toLowerCase()
  const availableEquipment = equipment.filter((item) => !selectedIds.has(item.id))
  const equipmentFloorOptions = uniqueEquipmentValues(
    availableEquipment.filter((item) => matchesHeadquarter(item, equipmentHeadquarterFilter)),
    (item) => item.location?.floor
  )
  const equipmentAreaOptions = uniqueEquipmentValues(
    availableEquipment.filter(
      (item) =>
        matchesHeadquarter(item, equipmentHeadquarterFilter) &&
        matchesLocationPart(item.location?.floor, equipmentFloorFilter)
    ),
    (item) => item.location?.area
  )
  const equipmentOfficeOptions = uniqueEquipmentValues(
    availableEquipment.filter(
      (item) =>
        matchesHeadquarter(item, equipmentHeadquarterFilter) &&
        matchesLocationPart(item.location?.floor, equipmentFloorFilter) &&
        matchesLocationPart(item.location?.area, equipmentAreaFilter)
    ),
    (item) => item.location?.office
  )
  const filteredEquipment = equipment
    .filter((item) => !selectedIds.has(item.id))
    .filter((item) => matchesHeadquarter(item, equipmentHeadquarterFilter))
    .filter((item) => matchesLocationPart(item.location?.floor, equipmentFloorFilter))
    .filter((item) => matchesLocationPart(item.location?.area, equipmentAreaFilter))
    .filter((item) => matchesLocationPart(item.location?.office, equipmentOfficeFilter))
    .filter((item) => !equipmentTypeFilter || item.type === equipmentTypeFilter)
    .filter((item) =>
      equipmentSearchText(item)
        .toLowerCase()
        .includes(normalizedEquipmentQuery)
    )
  const matchingEquipment = filteredEquipment
    .slice(0, 20)
  const visibleGroups = equipmentGroups.filter((group) => {
    if (!normalizedGroupQuery) {
      return true
    }

    return `${group.name} ${group.equipment.map((item) => item.internalCode).join(' ')}`
      .toLowerCase()
      .includes(normalizedGroupQuery)
  })
  const isEditing = Boolean(editingGroupId)

  function resetForm() {
    setForm({ description: '', equipmentIds: [], name: '' })
    setEditingGroupId(null)
    clearEquipmentFilters()
    setEquipmentQuery('')
    setState('idle')
  }

  function editGroup(group: EquipmentGroup) {
    setEditingGroupId(group.id)
    setForm({
      description: group.description ?? '',
      equipmentIds: group.equipment.map((item) => item.id),
      name: group.name,
    })
    clearEquipmentFilters()
    setEquipmentQuery('')
    setState('idle')
  }

  function clearEquipmentFilters() {
    setEquipmentAreaFilter('')
    setEquipmentFloorFilter('')
    setEquipmentHeadquarterFilter('')
    setEquipmentOfficeFilter('')
    setEquipmentTypeFilter('')
  }

  function changeEquipmentHeadquarterFilter(value: string) {
    setEquipmentHeadquarterFilter(value)
    setEquipmentFloorFilter('')
    setEquipmentAreaFilter('')
    setEquipmentOfficeFilter('')
  }

  function changeEquipmentFloorFilter(value: string) {
    setEquipmentFloorFilter(value)
    setEquipmentAreaFilter('')
    setEquipmentOfficeFilter('')
  }

  function changeEquipmentAreaFilter(value: string) {
    setEquipmentAreaFilter(value)
    setEquipmentOfficeFilter('')
  }

  function addEquipment(equipmentId: string) {
    setForm((current) => ({
      ...current,
      equipmentIds: current.equipmentIds.includes(equipmentId)
        ? current.equipmentIds
        : [...current.equipmentIds, equipmentId],
    }))
    setEquipmentQuery('')
  }

  function removeEquipment(equipmentId: string) {
    setForm((current) => ({
      ...current,
      equipmentIds: current.equipmentIds.filter((id) => id !== equipmentId),
    }))
  }

  async function submitGroup(event: FormEvent) {
    event.preventDefault()
    setState('saving')

    try {
      const payload = {
        description: form.description,
        equipmentIds: form.equipmentIds,
        name: form.name,
      }

      if (editingGroupId) {
        await onUpdateGroup(editingGroupId, payload)
      } else {
        await onCreateGroup(payload)
      }

      resetForm()
    } catch {
      setState('error')
    }
  }

  async function deleteGroup(groupId: string) {
    setState('deleting')

    try {
      await onDeleteGroup(groupId)

      if (editingGroupId === groupId) {
        resetForm()
      } else {
        setState('idle')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Grupos de equipos</h3>
            <p className="text-sm text-slate-400">Organiza equipos y revisa el avance del mantenimiento por grupo.</p>
          </div>
          <MaintenanceInput
            label="Buscar grupo o equipo"
            value={groupQuery}
            onChange={setGroupQuery}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {visibleGroups.map((group) => (
            <div
              className={`rounded-md border p-4 ${
                activeGroupId === group.id || editingGroupId === group.id
                  ? 'border-cyan-700 bg-cyan-500/10'
                  : 'border-slate-800 bg-slate-950'
              }`}
              key={group.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100">{group.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {group.equipment.map((item) => item.internalCode).join(', ') || 'Sin equipos'}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                  {group.equipment.length}
                </span>
              </div>
              <GroupProgress group={group} records={records} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500"
                  type="button"
                  onClick={() => editGroup(group)}
                >
                  Editar
                </button>
                <button
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-red-500 hover:text-red-100 disabled:opacity-50"
                  disabled={state === 'deleting'}
                  type="button"
                  onClick={() => deleteGroup(group.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {visibleGroups.length === 0 && (
            <p className="rounded-md border border-slate-800 bg-slate-950 px-4 py-8 text-center text-sm text-slate-500 md:col-span-2">
              Sin grupos para la busqueda actual.
            </p>
          )}
        </div>
      </section>

      <form className="rounded-lg border border-slate-800 bg-slate-900 p-4" onSubmit={submitGroup}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              {isEditing ? 'Editar grupo' : 'Crear grupo'}
            </h3>
            <p className="text-sm text-slate-400">{selectedEquipment.length} equipos seleccionados</p>
          </div>
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500"
            type="button"
            onClick={resetForm}
          >
            Limpiar
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <MaintenanceInput
            label="Nombre del grupo"
            required
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
          />
          <MaintenanceTextarea
            label="Descripcion"
            minHeightClassName="min-h-20"
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
          />

          <label className="block text-sm">
            <span className="text-slate-500">Buscar equipos para agregar</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              placeholder="Codigo, tipo, marca, sede, piso, area u oficina"
              type="text"
              value={equipmentQuery}
              onChange={(event) => setEquipmentQuery(event.target.value)}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <MaintenanceSelect
              label="Sede"
              value={equipmentHeadquarterFilter}
              options={uniqueEquipmentValues(availableEquipment, (item) => item.headquarter?.name).map((value) => ({
                label: value,
                value,
              }))}
              onChange={changeEquipmentHeadquarterFilter}
            />
            <MaintenanceSelect
              label="Tipo"
              value={equipmentTypeFilter}
              options={uniqueEquipmentValues(availableEquipment, (item) => item.type).map((value) => ({
                label: value,
                value,
              }))}
              onChange={setEquipmentTypeFilter}
            />
            <MaintenanceSelect
              label="Piso"
              value={equipmentFloorFilter}
              options={equipmentFloorOptions.map((value) => ({ label: value, value }))}
              onChange={changeEquipmentFloorFilter}
            />
            <MaintenanceSelect
              label="Area"
              value={equipmentAreaFilter}
              options={equipmentAreaOptions.map((value) => ({ label: value, value }))}
              onChange={changeEquipmentAreaFilter}
            />
            <MaintenanceSelect
              label="Oficina"
              value={equipmentOfficeFilter}
              options={equipmentOfficeOptions.map((value) => ({ label: value, value }))}
              onChange={setEquipmentOfficeFilter}
            />
            <div className="flex items-end gap-2">
              <span className="rounded-md border border-slate-800 px-3 py-2 text-sm text-slate-400">
                {filteredEquipment.length}/{availableEquipment.length}
              </span>
              <button
                className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                type="button"
                onClick={clearEquipmentFilters}
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto rounded-md border border-slate-800 bg-slate-950">
            {matchingEquipment.map((item) => (
              <button
                className="block w-full border-b border-slate-800 px-3 py-2 text-left text-sm text-slate-200 last:border-b-0 hover:bg-slate-800"
                key={item.id}
                type="button"
                onClick={() => addEquipment(item.id)}
              >
                <span className="block font-medium">{item.internalCode}</span>
                <span className="text-xs text-slate-500">
                  {item.type} {item.brand ? `/ ${item.brand}` : ''} {item.model ? `/ ${item.model}` : ''}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {equipmentLocationLabel(item)}
                </span>
              </button>
            ))}
            {matchingEquipment.length === 0 && (
              <p className="px-3 py-3 text-sm text-slate-500">Sin equipos disponibles.</p>
            )}
          </div>

          <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
            <p className="text-xs font-medium uppercase text-slate-500">Vista previa del grupo</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedEquipment.map((item) => (
                <span
                  className="inline-flex max-w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                  key={item.id}
                >
                  <span className="truncate">{item.internalCode} / {item.type}</span>
                  <button
                    className="text-slate-500 transition hover:text-red-200"
                    type="button"
                    onClick={() => removeEquipment(item.id)}
                  >
                    Quitar
                  </button>
                </span>
              ))}
              {selectedEquipment.length === 0 && (
                <p className="text-sm text-slate-500">Selecciona equipos para formar el grupo.</p>
              )}
            </div>
          </div>

          {state === 'error' && (
            <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-xs text-red-200">
              No fue posible guardar el grupo.
            </p>
          )}
          <button
            className="w-full rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 disabled:opacity-60"
            disabled={state === 'saving' || !form.name.trim()}
            type="submit"
          >
            {state === 'saving' ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear grupo'}
          </button>
        </div>
      </form>
    </div>
  )
}

function equipmentLocationLabel(item: Equipment) {
  return (
    [item.headquarter?.name, item.location?.floor, item.location?.area, item.location?.office]
      .filter(Boolean)
      .join(' / ') || 'Sin ubicacion'
  )
}

function equipmentSearchText(item: Equipment) {
  return [
    item.internalCode,
    item.serial,
    item.assetTag,
    item.type,
    item.brand,
    item.model,
    equipmentLocationLabel(item),
    item.currentResponsible?.name,
    item.secondaryResponsible?.name,
  ]
    .filter(Boolean)
    .join(' ')
}

function matchesHeadquarter(item: Equipment, headquarter: string) {
  return !headquarter || item.headquarter?.name === headquarter
}

function matchesLocationPart(value: string | null | undefined, filter: string) {
  return !filter || value === filter
}

function uniqueEquipmentValues(equipment: Equipment[], getValue: (item: Equipment) => string | null | undefined) {
  return Array.from(new Set(equipment.map(getValue).filter((value): value is string => Boolean(value)))).sort(
    (first, second) => first.localeCompare(second)
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
      <div className="p-4">
        <AppLoader label="Cargando mantenimientos..." />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-md border border-red-900 bg-red-950/30 px-3 py-4 text-sm text-red-200">
        No fue posible cargar los procesos.
      </div>
    )
  }

  return (
    <div>
      <div className="pb-3">
        <h4 className="text-sm font-semibold text-white">Procesos filtrados</h4>
        <p className="mt-1 text-xs text-slate-500">
          Recepcion, ejecucion, cierre y evidencias por equipo.
        </p>
      </div>
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
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100">
                  {record.equipment?.internalCode ?? 'Equipo sin codigo'}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {record.equipment?.type ?? 'Equipo'} / {record.equipment?.headquarter?.name ?? 'Sin sede'}
                </p>
              </div>
              <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                {maintenanceStatusLabel(record.status)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <ProcessFact label="Etapa" value={currentStageLabel(record)} />
              <ProcessFact label="Tipo" value={maintenanceTypeLabel(record.maintenanceType)} />
              <ProcessFact label="Programado" value={formatDate(record.scheduledDate)} />
              <ProcessFact
                label={record.status === 'completed' ? 'Cierre' : 'Recepcion'}
                value={formatDate(record.closedAt ?? record.receivedAt)}
              />
            </div>
            <div className="mt-3">
              <ProgressLine record={record} compact />
              <p className="mt-2 text-xs text-slate-500">{processNextAction(record)}</p>
            </div>
          </button>
        ))}
        {records.length === 0 && (
          <p className="rounded-md border border-slate-800 bg-slate-950 px-3 py-4 text-sm text-slate-500">
            Sin mantenimientos abiertos para mostrar.
          </p>
        )}
      </div>
    </div>
  )
}

function ProcessFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1.5">
      <p className="text-[11px] uppercase text-slate-600">{label}</p>
      <p className="truncate text-xs text-slate-300">{value}</p>
    </div>
  )
}

function GroupProgress({ group, records }: { group: EquipmentGroup; records: MaintenanceRecord[] }) {
  const equipmentIds = new Set(group.equipment.map((item) => item.id))
  const groupRecords = records.filter((record) => record.equipment?.id && equipmentIds.has(record.equipment.id))
  const completedEquipment = new Set(
    groupRecords
      .filter((record) => record.status === 'completed')
      .map((record) => record.equipment?.id)
      .filter(Boolean)
  )
  const total = group.equipment.length
  const percent = total > 0 ? Math.round((completedEquipment.size / total) * 100) : 0

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Avance del grupo</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
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
  onDeleteEvidence,
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
  onDeleteEvidence: (recordId: string, attachmentId: string) => Promise<void>
  onUpdateClosure: (recordId: string, payload: StagePayload) => Promise<void>
  onUpdateExecution: (recordId: string, payload: StagePayload) => Promise<void>
  onUpdateReception: (recordId: string, payload: StagePayload) => Promise<void>
  onUploadEvidence: (recordId: string, stage: MaintenanceStage, file: File) => Promise<void>
  record: MaintenanceRecord
}) {
  return (
    <div className="min-w-0">
      <div className="border-b border-slate-800 p-5">
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(600px,auto)]">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">
              Proceso seleccionado / {maintenanceTypeLabel(record.maintenanceType)}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              {record.equipment?.internalCode ?? 'Mantenimiento'} / {record.equipment?.type ?? 'Equipo'}
            </h3>
            <p className="text-sm text-slate-400">
              {record.equipment?.headquarter?.name ?? 'Sin sede'} / {record.equipment?.location?.area ?? 'Sin ubicacion'}
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3 xl:grid-cols-5">
            <Metric label="Estado" value={maintenanceStatusLabel(record.status)} />
            <Metric label="Prioridad" value={priorityLabel(record.priority)} />
            <Metric label="Programado" value={formatDate(record.scheduledDate ?? record.performedAt)} />
            <Metric label="Recepcion real" value={formatDate(record.receivedAt)} />
            <Metric label="Cierre real" value={formatDate(record.closedAt ?? record.performedAt)} />
          </div>
        </div>
        <div className="mt-5">
          <StageStepper activeStage={activeStage} record={record} onChangeStage={onChangeStage} />
          <div className="mt-3">
            <ProgressLine record={record} compact />
          </div>
        </div>
      </div>

      <div className="grid min-h-[560px] gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="p-5">
          <div className="mb-4 rounded-md border border-slate-800 bg-slate-950 px-4 py-3">
            <p className="text-xs font-medium uppercase text-slate-500">Etapa activa</p>
            <h4 className="mt-1 text-base font-semibold text-white">{stageLabel(activeStage)}</h4>
            <p className="mt-1 text-sm text-slate-400">{stageWorkSummary(activeStage)}</p>
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
            onDeleteEvidence={onDeleteEvidence}
            onUploadEvidence={onUploadEvidence}
          />
        </div>

        <HistoryPanel history={history} />
      </div>
    </div>
  )
}

function StageStepper({
  activeStage,
  onChangeStage,
  record,
}: {
  activeStage: MaintenanceStage
  onChangeStage: (stage: MaintenanceStage) => void
  record: MaintenanceRecord
}) {
  const completed = completedStageCount(record)

  return (
    <div className="grid gap-2 md:grid-cols-3">
      {stages.map((stage, index) => {
        const isComplete = index < completed
        const isActive = activeStage === stage.key

        return (
          <button
            className={`rounded-md border px-3 py-3 text-left transition ${
              isActive
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100'
                : isComplete
                  ? 'border-cyan-800 bg-slate-950 text-slate-100 hover:border-cyan-600'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600'
            }`}
            key={stage.key}
            type="button"
            onClick={() => onChangeStage(stage.key)}
          >
            <span className="text-[11px] uppercase text-slate-500">Paso {index + 1}</span>
            <span className="mt-1 block text-sm font-medium">{stage.label}</span>
            <span className="mt-1 block text-xs text-slate-500">
              {isComplete ? 'Con datos' : isActive ? 'En edicion' : 'Pendiente'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function stageLabel(stage: MaintenanceStage) {
  return stages.find((item) => item.key === stage)?.label ?? 'Etapa'
}

function stageWorkSummary(stage: MaintenanceStage) {
  if (stage === 'reception') {
    return 'Datos de entrada, estado inicial y observaciones de recepcion.'
  }

  if (stage === 'execution') {
    return 'Actividades realizadas, diagnostico, materiales y trabajo tecnico.'
  }

  return 'Estado final, entrega, destino y proximo mantenimiento.'
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
    receivedAt: isoDateValue(record.receivedAt) || todayDateInput(),
  })

  return (
    <StageForm disabled={disabled} onSubmit={() => onSubmit(form)} submitLabel="Guardar recepcion">
      <MaintenanceFieldGroup title="Recepcion">
        <MaintenanceInput
          label="Fecha real de recepcion"
          type="date"
          value={form.receivedAt}
          onChange={(receivedAt) => setForm({ ...form, receivedAt })}
        />
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
    closedAt: isoDateValue(record.closedAt ?? record.performedAt) || todayDateInput(),
    finalDestination: record.finalDestination ?? '',
    finalEquipmentState: record.finalEquipmentState ?? '',
    nextMaintenanceAt: isoDateValue(record.nextMaintenanceAt),
    receivedByName: record.receivedByName ?? '',
  })

  return (
    <StageForm
      disabled={disabled}
      onSubmit={() => onSubmit({ ...form, performedAt: form.closedAt })}
      submitLabel="Cerrar mantenimiento"
    >
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
          label="Fecha real de cierre"
          type="date"
          value={form.closedAt}
          onChange={(closedAt) => setForm({ ...form, closedAt })}
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
  onDeleteEvidence,
  onRefresh,
  onUploadEvidence,
  recordId,
}: {
  activeStage: MaintenanceStage
  attachments: MaintenanceAttachment[]
  onDeleteEvidence: (recordId: string, attachmentId: string) => Promise<void>
  onRefresh: () => Promise<unknown>
  onUploadEvidence: (recordId: string, stage: MaintenanceStage, file: File) => Promise<void>
  recordId: string
}) {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'deleting' | 'error'>('idle')
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

  async function handleDelete(attachmentId: string) {
    setUploadState('deleting')

    try {
      await onDeleteEvidence(recordId, attachmentId)
      await onRefresh()
      setUploadState('idle')
    } catch {
      setUploadState('error')
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Evidencias de {stageLabel(activeStage)}</h4>
          <p className="text-xs text-slate-500">Imagenes, PDF, Word o Excel asociados solo a este paso.</p>
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
          <div
            className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
            key={attachment.id}
          >
            <a
              className="min-w-0 flex-1 text-slate-200 transition hover:text-cyan-200"
              href={maintenanceAttachmentUrl(recordId, attachment.id)}
              rel="noreferrer"
              target="_blank"
            >
              <span className="block truncate">{attachment.fileName}</span>
              <span className="text-xs text-slate-500">{formatDate(attachment.createdAt)}</span>
            </a>
            <button
              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-red-500 hover:text-red-100 disabled:opacity-50"
              disabled={uploadState === 'deleting'}
              type="button"
              onClick={() => handleDelete(attachment.id)}
            >
              Quitar
            </button>
          </div>
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

function getProcessMetrics(records: MaintenanceRecord[]): ProcessMetrics {
  return records.reduce<ProcessMetrics>(
    (metrics, record) => {
      if (record.status === 'completed') {
        metrics.closed += 1
        return metrics
      }

      if (record.currentStage === 'reception') {
        metrics.reception += 1
        return metrics
      }

      if (record.currentStage === 'execution' || record.currentStage === 'closure') {
        metrics.execution += 1
        return metrics
      }

      if (record.status !== 'cancelled') {
        metrics.notStarted += 1
      }

      return metrics
    },
    { closed: 0, execution: 0, notStarted: 0, reception: 0 }
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

function currentStageLabel(record: MaintenanceRecord) {
  if (record.status === 'completed') {
    return 'Cierre completo'
  }

  if (record.currentStage === 'closure') {
    return 'Cierre'
  }

  if (record.currentStage === 'execution') {
    return 'Ejecucion'
  }

  if (record.currentStage === 'reception') {
    return 'Recepcion'
  }

  return 'Sin iniciar'
}

function processNextAction(record: MaintenanceRecord) {
  if (record.status === 'completed') {
    return 'Proceso cerrado. Puedes consultar evidencias e historial.'
  }

  if (record.currentStage === 'execution') {
    return 'Siguiente paso: revisar cierre y entrega del equipo.'
  }

  if (record.currentStage === 'reception') {
    return 'Siguiente paso: registrar actividades de ejecucion.'
  }

  return 'Siguiente paso: registrar recepcion del equipo.'
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

function isoDateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

function todayDateInput() {
  return new Date().toISOString().slice(0, 10)
}
