import {
  assignEquipment,
  createFailureReport,
  createMaintenanceRecord,
  deleteEquipmentAttachment,
  resolveFailureReport,
  returnEquipment,
  uploadEquipmentAttachment,
} from '../services/equipmentService'
import type { EquipmentLifeSheet } from '@/shared/types/inventory'

type EquipmentOperationDependencies = {
  lifeSheet: EquipmentLifeSheet | null
  refreshCoreData: () => Promise<unknown>
  refreshOperationalData: () => Promise<unknown>
  refreshSelectedLifeSheet: (equipmentId?: string | null) => Promise<unknown>
  selectedEquipmentId: string | null
  showSuccess: (message: string, subText?: string) => void
}

export function createEquipmentOperationsActions({
  lifeSheet,
  refreshCoreData,
  refreshOperationalData,
  refreshSelectedLifeSheet,
  selectedEquipmentId,
  showSuccess,
}: EquipmentOperationDependencies) {
  return {
    assignEquipment: async (userId: string, notes?: string) => {
      if (!selectedEquipmentId) return
      await assignEquipment(selectedEquipmentId, userId, notes)
      await refreshOperationalData()
    },
    createFailure: async (payload: { title: string; description: string; priority: string }) => {
      if (!selectedEquipmentId) return
      await createFailureReport({ equipmentId: selectedEquipmentId, ...payload })
      showSuccess('Falla reportada', 'Se creo una alerta para que el equipo tecnico la atienda.')
      await refreshOperationalData()
    },
    createMaintenanceRecord: async (payload: {
      actionsTaken?: string
      cost?: number
      description?: string
      diagnosis?: string
      maintenanceType: 'preventive' | 'corrective'
      nextMaintenanceAt?: string
      performedBy?: string
      priority: string
    }) => {
      if (!selectedEquipmentId) return
      await createMaintenanceRecord({
        equipmentId: selectedEquipmentId,
        status: 'completed',
        ...payload,
      })
      await refreshOperationalData()
    },
    deleteAttachment: async (attachmentId: string) => {
      if (!lifeSheet) return
      await deleteEquipmentAttachment(lifeSheet.equipment.id, attachmentId)
      await refreshSelectedLifeSheet(lifeSheet.equipment.id)
      await refreshCoreData()
    },
    resolveFailure: async (failureReportId: string) => {
      await resolveFailureReport(failureReportId)
      showSuccess('Falla resuelta', 'La falla y su alerta asociada quedaron cerradas.')
      await refreshOperationalData()
    },
    resolveFailureReport,
    returnEquipment: async (notes?: string) => {
      if (!selectedEquipmentId) return
      await returnEquipment(selectedEquipmentId, notes)
      await refreshOperationalData()
    },
    uploadAttachment: async (file: File) => {
      if (!selectedEquipmentId) return
      await uploadEquipmentAttachment(selectedEquipmentId, file)
      await refreshOperationalData()
    },
  }
}
