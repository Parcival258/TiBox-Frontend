import type { Headquarter, HeadquarterPayload, Location, LocationPayload } from '../types'

export type HeadquarterForm = {
  address: string
  city: string
  description: string
  isActive: boolean
  name: string
}

export type LocationForm = {
  area: string
  description: string
  floor: string
  headquarterId: string
  isActive: boolean
  office: string
}

export const emptyHeadquarterForm: HeadquarterForm = {
  address: '',
  city: '',
  description: '',
  isActive: true,
  name: '',
}

export const emptyLocationForm: LocationForm = {
  area: '',
  description: '',
  floor: '',
  headquarterId: '',
  isActive: true,
  office: '',
}

export function headquarterPayload(form: HeadquarterForm): HeadquarterPayload {
  return {
    address: optional(form.address),
    city: optional(form.city),
    description: optional(form.description),
    isActive: form.isActive,
    name: form.name.trim(),
  }
}

export function headquarterToForm(headquarter: Headquarter): HeadquarterForm {
  return {
    address: headquarter.address ?? '',
    city: headquarter.city ?? '',
    description: headquarter.description ?? '',
    isActive: headquarter.isActive,
    name: headquarter.name,
  }
}

export function activeHeadquarterPayload(headquarter: Headquarter): HeadquarterPayload {
  return headquarterPayload({
    ...headquarterToForm(headquarter),
    isActive: true,
  })
}

export function locationPayload(form: LocationForm): LocationPayload {
  return {
    area: optional(form.area),
    description: optional(form.description),
    floor: optional(form.floor),
    headquarterId: form.headquarterId,
    isActive: form.isActive,
    office: optional(form.office),
  }
}

export function locationToForm(location: Location): LocationForm {
  return {
    area: location.area ?? '',
    description: location.description ?? '',
    floor: location.floor ?? '',
    headquarterId: location.headquarterId,
    isActive: location.isActive,
    office: location.office ?? '',
  }
}

export function activeLocationPayload(location: Location): LocationPayload {
  return locationPayload({
    ...locationToForm(location),
    isActive: true,
  })
}

function optional(value: string) {
  return value.trim() || undefined
}
