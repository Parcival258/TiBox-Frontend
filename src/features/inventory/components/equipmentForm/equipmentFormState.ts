import type { Equipment, EquipmentPayload } from '../../types/equipmentCore'

export type EquipmentFormState = {
  assetTag: string
  brand: string
  currentResponsibleId: string
  headquarterId: string
  internalCode: string
  ipAddresses: string
  leaseContractNumber: string
  leaseProvider: string
  leaseUntil: string
  locationId: string
  macAddress: string
  model: string
  notes: string
  ownershipType: 'owned' | 'leased'
  processor: string
  purchaseDate: string
  secondaryResponsibleId: string
  serial: string
  status: string
  storageCapacityGb: string
  storageType: string
  type: string
  warrantyUntil: string
}

export const emptyEquipmentForm: EquipmentFormState = {
  assetTag: '',
  brand: '',
  currentResponsibleId: '',
  headquarterId: '',
  internalCode: '',
  ipAddresses: '',
  leaseContractNumber: '',
  leaseProvider: '',
  leaseUntil: '',
  locationId: '',
  macAddress: '',
  model: '',
  notes: '',
  ownershipType: 'owned',
  processor: '',
  purchaseDate: '',
  secondaryResponsibleId: '',
  serial: '',
  status: 'active',
  storageCapacityGb: '',
  storageType: '',
  type: '',
  warrantyUntil: '',
}

export const statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'En mantenimiento', value: 'in_maintenance' },
  { label: 'Danado', value: 'damaged' },
  { label: 'Retirado', value: 'retired' },
  { label: 'Perdido', value: 'lost' },
]

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

function optional(value: string) {
  return value.trim() || undefined
}

export function equipmentToForm(equipment: Equipment | null): EquipmentFormState {
  if (!equipment) {
    return emptyEquipmentForm
  }

  return {
    assetTag: equipment.assetTag ?? '',
    brand: equipment.brand ?? '',
    currentResponsibleId: equipment.currentResponsibleId ?? '',
    headquarterId: equipment.headquarterId ?? '',
    internalCode: equipment.internalCode,
    ipAddresses: equipment.ipAddresses ?? '',
    leaseContractNumber: equipment.leaseContractNumber ?? '',
    leaseProvider: equipment.leaseProvider ?? '',
    leaseUntil: dateValue(equipment.leaseUntil),
    locationId: equipment.locationId ?? '',
    macAddress: equipment.macAddress ?? '',
    model: equipment.model ?? '',
    notes: equipment.notes ?? '',
    ownershipType: equipment.ownershipType,
    processor: equipment.processor ?? '',
    purchaseDate: dateValue(equipment.purchaseDate),
    secondaryResponsibleId: equipment.secondaryResponsibleId ?? '',
    serial: equipment.serial,
    status: equipment.status,
    storageCapacityGb:
      equipment.storageCapacityGb === null || equipment.storageCapacityGb === undefined
        ? ''
        : String(equipment.storageCapacityGb),
    storageType: equipment.storageType ?? '',
    type: equipment.type,
    warrantyUntil: dateValue(equipment.warrantyUntil),
  }
}

export function formToEquipmentPayload(form: EquipmentFormState): EquipmentPayload {
  return {
    internalCode: form.internalCode.trim(),
    serial: form.serial.trim(),
    type: form.type.trim(),
    assetTag: optional(form.assetTag),
    brand: optional(form.brand),
    currentResponsibleId: optional(form.currentResponsibleId),
    headquarterId: optional(form.headquarterId),
    ipAddresses: optional(form.ipAddresses),
    leaseContractNumber: optional(form.leaseContractNumber),
    leaseProvider: optional(form.leaseProvider),
    leaseUntil: optional(form.leaseUntil),
    locationId: optional(form.locationId),
    macAddress: optional(form.macAddress),
    model: optional(form.model),
    notes: optional(form.notes),
    ownershipType: form.ownershipType,
    processor: optional(form.processor),
    purchaseDate: optional(form.purchaseDate),
    secondaryResponsibleId: optional(form.secondaryResponsibleId),
    status: form.status,
    storageCapacityGb: form.storageCapacityGb ? Number(form.storageCapacityGb) : undefined,
    storageType: optional(form.storageType),
    warrantyUntil: optional(form.warrantyUntil),
  }
}
