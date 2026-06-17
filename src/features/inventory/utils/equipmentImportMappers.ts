import { normalizeImportValue } from './equipmentImportFormat'

const statusAliases: Record<string, string> = {
  activo: 'active',
  active: 'active',
  danado: 'damaged',
  damaged: 'damaged',
  'en mantenimiento': 'in_maintenance',
  inactive: 'inactive',
  inactivo: 'inactive',
  in_maintenance: 'in_maintenance',
  lost: 'lost',
  perdido: 'lost',
  retired: 'retired',
  retirado: 'retired',
}

const ownershipAliases: Record<string, 'owned' | 'leased'> = {
  arrendado: 'leased',
  leased: 'leased',
  owned: 'owned',
  propio: 'owned',
}

export function mapImportStatus(value: string, rowNumber: number, errors: string[]) {
  if (!value) {
    return 'active'
  }

  const status = statusAliases[normalizeImportValue(value)]

  if (!status) {
    errors.push(`Fila ${rowNumber}: estado no valido (${value}).`)
    return 'active'
  }

  return status
}

export function mapImportOwnership(value: string, rowNumber: number, errors: string[]) {
  if (!value) {
    return 'owned'
  }

  const ownershipType = ownershipAliases[normalizeImportValue(value)]

  if (!ownershipType) {
    errors.push(`Fila ${rowNumber}: propiedad no valida (${value}).`)
    return 'owned'
  }

  return ownershipType
}

export function mapImportNumber(value: string, rowNumber: number, errors: string[]) {
  if (!value) {
    return undefined
  }

  const number = Number(value.replace(',', '.'))

  if (Number.isNaN(number)) {
    errors.push(`Fila ${rowNumber}: almacenamiento_gb debe ser numerico.`)
    return undefined
  }

  return number
}
