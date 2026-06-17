import { useState } from 'react'
import { emptyDashboard } from '@/app/constants/dashboard'
import { defaultEquipmentFilters } from '../constants/equipmentFilters'
import type { DashboardSummary } from '@/app/types/dashboard'
import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { Equipment, EquipmentFilters } from '../types/equipmentCore'
import type { EquipmentLifeSheet } from '../types/equipmentLifeSheet'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { LifeSheetState, LoadState } from '@/shared/types/ui'

export function useInventoryState(equipmentPageSize: number) {
  const [status, setStatus] = useState<LoadState>('loading')
  const [dashboard, setDashboard] = useState<DashboardSummary>(emptyDashboard)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [equipmentCatalogs, setEquipmentCatalogs] = useState<EquipmentCatalogs | null>(null)
  const [equipmentFilters, setEquipmentFilters] = useState<EquipmentFilters>({
    ...defaultEquipmentFilters,
    perPage: equipmentPageSize,
  })
  const [equipmentMeta, setEquipmentMeta] = useState<PaginationMeta | null>(null)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)
  const [lifeSheet, setLifeSheet] = useState<EquipmentLifeSheet | null>(null)
  const [lifeSheetStatus, setLifeSheetStatus] = useState<LifeSheetState>('idle')
  const [equipmentFormMode, setEquipmentFormMode] = useState<'create' | 'edit'>('create')
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false)

  return {
    dashboard,
    editingEquipment,
    equipment,
    equipmentCatalogs,
    equipmentFilters,
    equipmentFormMode,
    equipmentMeta,
    isEquipmentFormOpen,
    lifeSheet,
    lifeSheetStatus,
    selectedEquipmentId,
    setDashboard,
    setEditingEquipment,
    setEquipment,
    setEquipmentCatalogs,
    setEquipmentFilters,
    setEquipmentFormMode,
    setEquipmentMeta,
    setIsEquipmentFormOpen,
    setLifeSheet,
    setLifeSheetStatus,
    setSelectedEquipmentId,
    setStatus,
    status,
  }
}
