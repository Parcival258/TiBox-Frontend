export type Headquarter = {
  id: string
  name: string
  city: string | null
  address: string | null
  description?: string | null
  isActive: boolean
}

export type HeadquarterPayload = {
  address?: string
  city?: string
  description?: string
  isActive?: boolean
  name: string
}

export type Location = {
  id: string
  headquarterId: string
  floor: string | null
  area: string | null
  office: string | null
  description: string | null
  isActive: boolean
  headquarter?: Headquarter
}

export type LocationPayload = {
  area?: string
  description?: string
  floor?: string
  headquarterId: string
  isActive?: boolean
  office?: string
}
