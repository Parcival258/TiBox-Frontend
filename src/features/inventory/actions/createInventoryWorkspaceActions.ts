import {
  createEquipment,
  deleteEquipment,
  restoreEquipment,
  updateEquipment,
} from '../services/equipmentMutations'
import { getEquipment, getEquipmentLifeSheet } from '../services/equipmentQuery'
import {
  downloadEquipmentImportTemplate,
  readEquipmentImportFile,
  type EquipmentImportResult,
} from '../utils/equipmentBulkImport'
import { downloadEquipmentCsv } from '../utils/equipmentCsv'
import { defaultEquipmentFilters } from '../constants/equipmentFilters'
import type {
  Equipment,
  EquipmentFilters,
  EquipmentPayload,
} from '../types/equipmentCore'
import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { LifeSheetState, LoadState } from '@/shared/types/ui'

type InventoryWorkspaceActionDependencies = {
  editingEquipment: Equipment | null
  equipmentCatalogs: EquipmentCatalogs | null
  equipmentFilters: EquipmentFilters
  equipmentFormMode: 'create' | 'edit'
  lifeSheetStatus: LifeSheetState
  refreshAlerts: () => Promise<unknown>
  refreshCoreData: (filters?: EquipmentFilters) => Promise<unknown>
  refreshMaintenanceSchedules: () => void
  refreshSelectedLifeSheet: (equipmentId?: string | null) => Promise<unknown>
  selectedEquipmentId: string | null
  setEditingEquipment: (equipment: Equipment | null) => void
  setEquipment: (equipment: Equipment[]) => void
  setEquipmentFilters: (filters: EquipmentFilters) => void
  setEquipmentFormMode: (mode: 'create' | 'edit') => void
  setEquipmentMeta: (meta: Awaited<ReturnType<typeof getEquipment>>['meta']) => void
  setIsEquipmentFormOpen: (isOpen: boolean) => void
  setLifeSheet: (lifeSheet: Awaited<ReturnType<typeof getEquipmentLifeSheet>> | null) => void
  setLifeSheetStatus: (status: LifeSheetState) => void
  setSelectedEquipmentId: (equipmentId: string | null) => void
  setStatus: (status: LoadState) => void
  showSuccess: (message: string, subText?: string) => void
  canViewAlerts: boolean
  canViewMaintenance: boolean
}

export function createInventoryWorkspaceActions({
  canViewAlerts,
  canViewMaintenance,
  editingEquipment,
  equipmentCatalogs,
  equipmentFilters,
  equipmentFormMode,
  lifeSheetStatus,
  refreshAlerts,
  refreshCoreData,
  refreshMaintenanceSchedules,
  refreshSelectedLifeSheet,
  selectedEquipmentId,
  setEditingEquipment,
  setEquipment,
  setEquipmentFilters,
  setEquipmentFormMode,
  setEquipmentMeta,
  setIsEquipmentFormOpen,
  setLifeSheet,
  setLifeSheetStatus,
  setSelectedEquipmentId,
  setStatus,
  showSuccess,
}: InventoryWorkspaceActionDependencies) {
  function handleSelectEquipment(equipmentId: string) {
    if (equipmentId === selectedEquipmentId) {
      if (lifeSheetStatus === 'error' || lifeSheetStatus === 'idle') {
        refreshSelectedLifeSheet(equipmentId)
      }

      return
    }

    setSelectedEquipmentId(equipmentId)
    setLifeSheet(null)
    setLifeSheetStatus('loading')
  }

  function openEquipmentDetails(equipmentId: string) {
    setSelectedEquipmentId(equipmentId)
    setLifeSheet(null)
    setLifeSheetStatus('loading')

    return getEquipmentLifeSheet(equipmentId)
      .then((response) => {
        setLifeSheet(response)
        setLifeSheetStatus('ready')
      })
      .catch(() => {
        setLifeSheet(null)
        setLifeSheetStatus('error')
      })
  }

  function openCreateEquipment() {
    setEquipmentFormMode('create')
    setEditingEquipment(null)
    setIsEquipmentFormOpen(true)
  }

  function openEditEquipment(equipmentItem: Equipment) {
    setEquipmentFormMode('edit')
    setEditingEquipment(equipmentItem)
    setIsEquipmentFormOpen(true)
  }

  async function handleSubmitEquipment(payload: EquipmentPayload) {
    if (equipmentFormMode === 'create') {
      const createdEquipment = await createEquipment(payload)
      setSelectedEquipmentId(createdEquipment.id)
      await refreshCoreData()
      await refreshSelectedLifeSheet(createdEquipment.id)
      return
    }

    if (!editingEquipment) {
      return
    }

    await updateEquipment(editingEquipment.id, payload)
    await refreshCoreData()

    if (selectedEquipmentId === editingEquipment.id) {
      await refreshSelectedLifeSheet(editingEquipment.id)
    }
  }

  function handleDeleteEquipment(equipmentId: string) {
    return deleteEquipment(equipmentId)
      .then(async () => {
        if (selectedEquipmentId === equipmentId) {
          setSelectedEquipmentId(null)
          setLifeSheet(null)
          setLifeSheetStatus('idle')
        }

        await refreshCoreData()
        if (canViewMaintenance) {
          refreshMaintenanceSchedules()
        }
        if (canViewAlerts) {
          refreshAlerts()
        }
      })
      .catch(() => setStatus('error'))
  }

  function handleRestoreEquipment(equipmentId: string) {
    return restoreEquipment(equipmentId)
      .then(async () => {
        setSelectedEquipmentId(equipmentId)
        await refreshCoreData()
        await refreshSelectedLifeSheet(equipmentId)
        showSuccess('Equipo reintegrado', 'El equipo vuelve a estar activo en el inventario.')
        if (canViewMaintenance) {
          refreshMaintenanceSchedules()
        }
        if (canViewAlerts) {
          refreshAlerts()
        }
      })
      .catch(() => setStatus('error'))
  }

  function handleChangeEquipmentFilters(filters: EquipmentFilters) {
    const nextFilters = {
      ...defaultEquipmentFilters,
      ...filters,
    }

    setEquipmentFilters(nextFilters)
    getEquipment(nextFilters)
      .then((response) => {
        setEquipment(response.data)
        setEquipmentMeta(response.meta)
      })
      .catch(() => setStatus('error'))
  }

  async function handleExportEquipment() {
    const filters = {
      ...equipmentFilters,
      page: 1,
      perPage: 100,
    }
    const firstPage = await getEquipment(filters)
    const allEquipment = [...firstPage.data]

    for (let page = 2; page <= firstPage.meta.lastPage; page += 1) {
      const response = await getEquipment({ ...filters, page })
      allEquipment.push(...response.data)
    }

    downloadEquipmentCsv(allEquipment)
  }

  async function handleDownloadEquipmentImportTemplate() {
    downloadEquipmentImportTemplate(equipmentCatalogs)
  }

  async function handleImportEquipment(file: File): Promise<EquipmentImportResult> {
    const parsed = await readEquipmentImportFile(file, equipmentCatalogs)
    const errors = [...parsed.errors]
    let created = 0

    for (const row of parsed.rows) {
      try {
        await createEquipment(row.payload)
        created += 1
      } catch {
        errors.push(`Fila ${row.rowNumber}: no fue posible crear el equipo.`)
      }
    }

    await refreshCoreData()
    showSuccess(
      'Carga masiva procesada',
      `${created} equipo${created === 1 ? '' : 's'} creado${created === 1 ? '' : 's'}.`
    )

    return {
      created,
      errors,
      total: parsed.rows.length,
    }
  }

  return {
    handleChangeEquipmentFilters,
    handleDeleteEquipment,
    handleDownloadEquipmentImportTemplate,
    handleExportEquipment,
    handleImportEquipment,
    handleRestoreEquipment,
    handleSelectEquipment,
    handleSubmitEquipment,
    openCreateEquipment,
    openEditEquipment,
    openEquipmentDetails,
  }
}
