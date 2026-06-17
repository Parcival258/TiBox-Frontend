import { deleteJson, getJson, patchJson, postJson } from '@/shared/services/api'
import type { Headquarter, HeadquarterPayload, Location, LocationPayload } from '../types'

export function getHeadquarters() {
  return getJson<Headquarter[]>('/api/v1/headquarters')
}

export function createHeadquarter(payload: HeadquarterPayload) {
  return postJson<Headquarter>('/api/v1/headquarters', payload)
}

export function updateHeadquarter(headquarterId: string, payload: HeadquarterPayload) {
  return patchJson<Headquarter>(`/api/v1/headquarters/${headquarterId}`, payload)
}

export function deactivateHeadquarter(headquarterId: string) {
  return deleteJson(`/api/v1/headquarters/${headquarterId}`)
}

export function getLocations() {
  return getJson<Location[]>('/api/v1/locations')
}

export function createLocation(payload: LocationPayload) {
  return postJson<Location>('/api/v1/locations', payload)
}

export function updateLocation(locationId: string, payload: LocationPayload) {
  return patchJson<Location>(`/api/v1/locations/${locationId}`, payload)
}

export function deactivateLocation(locationId: string) {
  return deleteJson(`/api/v1/locations/${locationId}`)
}
