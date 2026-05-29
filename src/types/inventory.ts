export type DashboardSummary = {
  equipment: {
    total: number
    active: number
    inMaintenance: number
    damaged: number
  }
  maintenance: {
    upcoming: number
    overdue: number
  }
  expirations: {
    leases: number
    warranties: number
  }
}

export type Equipment = {
  id: string
  internal_code: string
  asset_tag: string | null
  serial: string
  type: string
  brand: string | null
  model: string | null
  ownership_type: 'owned' | 'leased'
  status: string
  headquarter_name: string | null
  location_area: string | null
  location_office: string | null
  responsible_name: string | null
  secondary_responsible_name: string | null
}

export type Headquarter = {
  id: string
  name: string
  city: string | null
  address: string | null
  is_active: boolean
}
