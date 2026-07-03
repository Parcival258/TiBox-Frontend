import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import { normalizeImportValue } from './equipmentImportFormat'

export function findImportHeadquarterId(value: string, catalogs: EquipmentCatalogs | null) {
  if (!value) {
    return undefined
  }

  const normalizedValue = normalizeImportValue(value)
  const headquarter = catalogs?.headquarters.find(
    (item) => normalizeImportValue(item.id) === normalizedValue || normalizeImportValue(item.name) === normalizedValue
  )

  return headquarter?.id
}

export function findImportLocationId(
  value: string,
  headquarterId: string | undefined,
  catalogs: EquipmentCatalogs | null
) {
  if (!value) {
    return undefined
  }

  const normalizedValue = normalizeImportValue(value)
  const locations = catalogs?.locations.filter(
    (location) => !headquarterId || location.headquarterId === headquarterId
  )
  const location = locations?.find((item) => {
    const label = [item.area, item.office, item.floor].filter(Boolean).join(' / ')
    const orderedLabel = [item.area, item.floor, item.office].filter(Boolean).join(' / ')

    return (
      normalizeImportValue(item.id) === normalizedValue ||
      normalizeImportValue(label) === normalizedValue ||
      normalizeImportValue(orderedLabel) === normalizedValue
    )
  })

  return location?.id
}

export function findImportLocationIdByParts(
  filters: { area?: string; floor?: string; office?: string },
  headquarterId: string | undefined,
  catalogs: EquipmentCatalogs | null
) {
  const normalizedFloor = normalizeImportValue(filters.floor ?? '')
  const normalizedArea = normalizeImportValue(filters.area ?? '')
  const normalizedOffice = normalizeImportValue(filters.office ?? '')

  if (!normalizedFloor && !normalizedArea && !normalizedOffice) {
    return undefined
  }

  const locations = catalogs?.locations.filter(
    (location) => !headquarterId || location.headquarterId === headquarterId
  )
  const location = locations?.find(
    (item) =>
      (!normalizedFloor || normalizeImportValue(item.floor ?? '') === normalizedFloor) &&
      (!normalizedArea || normalizeImportValue(item.area ?? '') === normalizedArea) &&
      (!normalizedOffice || normalizeImportValue(item.office ?? '') === normalizedOffice)
  )

  return location?.id
}

export function findImportResponsibleId(value: string, catalogs: EquipmentCatalogs | null) {
  if (!value) {
    return undefined
  }

  const normalizedValue = normalizeImportValue(value)
  const responsible = catalogs?.responsibles.find(
    (item) =>
      normalizeImportValue(item.id) === normalizedValue ||
      normalizeImportValue(item.name) === normalizedValue ||
      normalizeImportValue(item.email ?? '') === normalizedValue
  )

  return responsible?.id
}
