import {
  createEquipmentType,
  deactivateEquipmentType,
  updateEquipmentType,
} from '@/features/inventory/services/equipmentTypesService'
import {
  createHeadquarter,
  createLocation,
  deactivateHeadquarter,
  deactivateLocation,
  updateHeadquarter,
  updateLocation,
} from '../services/settingsService'
import type { EquipmentTypePayload } from '@/features/inventory/types/equipmentCatalogs'
import type { HeadquarterPayload, LocationPayload } from '../types'

type SettingsActionDependencies = {
  refreshCoreData: () => Promise<unknown>
  refreshSettingsData: () => Promise<unknown>
  showSuccess: (message: string, subText?: string) => void
}

export function createSettingsActions({
  refreshCoreData,
  refreshSettingsData,
  showSuccess,
}: SettingsActionDependencies) {
  async function refreshAll() {
    await refreshSettingsData()
    await refreshCoreData()
  }

  return {
    createHeadquarter: async (payload: HeadquarterPayload) => {
      await createHeadquarter(payload)
      await refreshAll()
      showSuccess('Sede creada', 'La sede quedo disponible para asignar ubicaciones.')
    },
    createEquipmentType: async (payload: EquipmentTypePayload) => {
      await createEquipmentType(payload)
      await refreshAll()
      showSuccess('Tipo creado', 'El tipo ya esta disponible para registrar equipos.')
    },
    createLocation: async (payload: LocationPayload) => {
      await createLocation(payload)
      await refreshAll()
      showSuccess('Ubicacion creada', 'La ubicacion quedo disponible para los equipos.')
    },
    deactivateHeadquarter: async (headquarterId: string) => {
      await deactivateHeadquarter(headquarterId)
      await refreshAll()
      showSuccess('Sede desactivada', 'La sede ya no queda activa para nuevas asignaciones.')
    },
    deactivateLocation: async (locationId: string) => {
      await deactivateLocation(locationId)
      await refreshAll()
      showSuccess('Ubicacion desactivada', 'La ubicacion ya no queda activa para nuevas asignaciones.')
    },
    deactivateEquipmentType: async (equipmentTypeId: string) => {
      await deactivateEquipmentType(equipmentTypeId)
      await refreshAll()
      showSuccess('Tipo desactivado', 'Ya no aparecera en nuevos registros de equipos.')
    },
    updateHeadquarter: async (headquarterId: string, payload: HeadquarterPayload) => {
      await updateHeadquarter(headquarterId, payload)
      await refreshAll()
      showSuccess('Sede actualizada', 'Los cambios quedaron guardados.')
    },
    updateLocation: async (locationId: string, payload: LocationPayload) => {
      await updateLocation(locationId, payload)
      await refreshAll()
      showSuccess('Ubicacion actualizada', 'Los cambios quedaron guardados.')
    },
    updateEquipmentType: async (equipmentTypeId: string, payload: EquipmentTypePayload) => {
      await updateEquipmentType(equipmentTypeId, payload)
      await refreshAll()
      showSuccess('Tipo actualizado', 'Los cambios quedaron guardados.')
    },
  }
}
