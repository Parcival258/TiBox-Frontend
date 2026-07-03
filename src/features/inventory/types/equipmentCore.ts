export type Equipment = {
  id: string
  internalCode: string
  assetTag: string | null
  serial: string
  type: string
  brand: string | null
  model: string | null
  ipAddresses: string | null
  macAddress: string | null
  processor: string | null
  storageType: string | null
  storageCapacityGb: number | null
  ownershipType: 'owned' | 'leased'
  status: string
  headquarterId?: string | null
  headquarter: { name: string } | null
  locationId?: string | null
  location: { area: string | null; floor: string | null; office: string | null } | null
  currentResponsibleId?: string | null
  currentResponsible: { name: string } | null
  secondaryResponsibleId?: string | null
  secondaryResponsible: { name: string } | null
  purchaseDate?: string | null
  warrantyUntil?: string | null
  leaseProvider?: string | null
  leaseContractNumber?: string | null
  leaseUntil?: string | null
  lastMaintenanceAt?: string | null
  nextMaintenanceAt?: string | null
  notes?: string | null
}

export type EquipmentPayload = {
  internalCode: string
  assetTag?: string
  serial: string
  type: string
  brand?: string
  model?: string
  ipAddresses?: string
  macAddress?: string
  processor?: string
  storageType?: string
  storageCapacityGb?: number
  ownershipType?: 'owned' | 'leased'
  status?: string
  headquarterId?: string
  locationId?: string
  currentResponsibleId?: string
  secondaryResponsibleId?: string
  purchaseDate?: string
  warrantyUntil?: string
  leaseProvider?: string
  leaseContractNumber?: string
  leaseUntil?: string
  notes?: string
}

export type EquipmentFilters = {
  brand?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  ownershipType?: 'owned' | 'leased'
  page?: number
  perPage?: number
  search?: string
  status?: string
  type?: string
}
