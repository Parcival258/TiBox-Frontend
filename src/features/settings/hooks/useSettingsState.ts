import { useState } from 'react'
import type { EquipmentType, Headquarter, Location } from '@/shared/types/inventory'

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
