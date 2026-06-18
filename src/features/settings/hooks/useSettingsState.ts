import { useState } from 'react'
import type { EquipmentType } from '@/features/inventory/types/equipmentCatalogs'
import type { Headquarter, Location } from '../types'

export function useSettingsState() {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  return {
    equipmentTypes,
    headquarters,
    locations,
    setEquipmentTypes,
    setHeadquarters,
    setLocations,
  }
}
