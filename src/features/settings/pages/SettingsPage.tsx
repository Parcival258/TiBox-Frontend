import { useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import {
  ContextActionMenu,
  type ContextMenuState,
} from '@/shared/ui/contextActionMenu/ContextActionMenu'
import { EquipmentTypesPanel } from '../components/settings/EquipmentTypesPanel'
import { HeadquarterFormPanel } from '../components/settings/HeadquarterFormPanel'
import { LocationFormPanel } from '../components/settings/LocationFormPanel'
import { SettingsHeadquartersList } from '../components/settings/SettingsHeadquartersList'
import { SettingsLocationsPanel } from '../components/settings/SettingsLocationsPanel'
import type { EquipmentType, EquipmentTypePayload } from '@/features/inventory/types/equipmentCatalogs'
import type { Headquarter, HeadquarterPayload, Location, LocationPayload } from '../types'
import {
  activeHeadquarterPayload,
  activeLocationPayload,
  emptyHeadquarterForm,
  emptyLocationForm,
  headquarterPayload,
  headquarterToForm,
  locationPayload,
  locationToForm,
  type HeadquarterForm,
  type LocationForm,
} from './settingsForms'
import {
  createHeadquarterContextActions,
  createLocationContextActions,
} from './settingsContextActions'

type SettingsPageProps = {
  canManageHeadquarters: boolean
  canManageLocations: boolean
  canManageEquipmentTypes: boolean
  equipmentTypes: EquipmentType[]
  headquarters: Headquarter[]
  locations: Location[]
  onCreateHeadquarter: (payload: HeadquarterPayload) => Promise<void>
  onCreateLocation: (payload: LocationPayload) => Promise<void>
  onCreateEquipmentType: (payload: EquipmentTypePayload) => Promise<void>
  onDeactivateHeadquarter: (headquarterId: string) => void
  onDeactivateLocation: (locationId: string) => void
  onDeactivateEquipmentType: (equipmentTypeId: string) => Promise<void>
  onUpdateHeadquarter: (headquarterId: string, payload: HeadquarterPayload) => Promise<void>
  onUpdateLocation: (locationId: string, payload: LocationPayload) => Promise<void>
  onUpdateEquipmentType: (equipmentTypeId: string, payload: EquipmentTypePayload) => Promise<void>
}

export function HeadquartersPage({
  canManageHeadquarters,
  canManageLocations,
  canManageEquipmentTypes,
  equipmentTypes,
  headquarters,
  locations,
  onCreateHeadquarter,
  onCreateLocation,
  onCreateEquipmentType,
  onDeactivateHeadquarter,
  onDeactivateLocation,
  onDeactivateEquipmentType,
  onUpdateHeadquarter,
  onUpdateLocation,
  onUpdateEquipmentType,
}: SettingsPageProps) {
  const [selectedHeadquarterId, setSelectedHeadquarterId] = useState(headquarters[0]?.id ?? '')
  const [editingHeadquarterId, setEditingHeadquarterId] = useState<string | null>(null)
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [headquarterForm, setHeadquarterForm] = useState<HeadquarterForm>(emptyHeadquarterForm)
  const [locationForm, setLocationForm] = useState<LocationForm>(emptyLocationForm)
  const [showHeadquarterForm, setShowHeadquarterForm] = useState(false)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorNotice, setErrorNotice] = useState<{ message: string; subText: string } | null>(null)
  const [showHierarchyInfo, setShowHierarchyInfo] = useState(true)

  const activeHeadquarterId = selectedHeadquarterId || headquarters[0]?.id || ''
  const selectedHeadquarter = headquarters.find((headquarter) => headquarter.id === activeHeadquarterId)
  const visibleLocations = useMemo(
    () => locations.filter((location) => location.headquarterId === activeHeadquarterId),
    [activeHeadquarterId, locations]
  )

  function setHeadquarterField<Key extends keyof HeadquarterForm>(key: Key, value: HeadquarterForm[Key]) {
    setHeadquarterForm((current) => ({ ...current, [key]: value }))
  }

  function setLocationField<Key extends keyof LocationForm>(key: Key, value: LocationForm[Key]) {
    setLocationForm((current) => ({ ...current, [key]: value }))
  }

  function openCreateHeadquarter() {
    setEditingHeadquarterId(null)
    setHeadquarterForm(emptyHeadquarterForm)
    setShowHeadquarterForm(true)
  }

  function openCreateLocation() {
    setEditingLocationId(null)
    setLocationForm({ ...emptyLocationForm, headquarterId: activeHeadquarterId })
    setShowLocationForm(true)
  }

  function editHeadquarter(headquarter: Headquarter) {
    setEditingHeadquarterId(headquarter.id)
    setShowHeadquarterForm(true)
    setHeadquarterForm(headquarterToForm(headquarter))
  }

  function editLocation(location: Location) {
    setEditingLocationId(location.id)
    setShowLocationForm(true)
    setLocationForm(locationToForm(location))
  }

  function closeHeadquarterForm() {
    setEditingHeadquarterId(null)
    setHeadquarterForm(emptyHeadquarterForm)
    setShowHeadquarterForm(false)
  }

  function closeLocationForm() {
    setEditingLocationId(null)
    setLocationForm({ ...emptyLocationForm, headquarterId: activeHeadquarterId })
    setShowLocationForm(false)
  }

  function clearError() {
    setErrorNotice(null)
    setSubmitState('idle')
  }

  async function submitHeadquarter(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    try {
      if (editingHeadquarterId) {
        await onUpdateHeadquarter(editingHeadquarterId, headquarterPayload(headquarterForm))
      } else {
        await onCreateHeadquarter(headquarterPayload(headquarterForm))
      }

      closeHeadquarterForm()
      setErrorNotice(null)
      setSubmitState('idle')
    } catch {
      setErrorNotice({
        message: 'Error al guardar sede',
        subText: 'Revisa el nombre, permisos o conexion con el backend.',
      })
      setSubmitState('error')
    }
  }

  async function submitLocation(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    const payload = locationPayload({
      ...locationForm,
      headquarterId: locationForm.headquarterId || activeHeadquarterId,
    })

    try {
      if (editingLocationId) {
        await onUpdateLocation(editingLocationId, payload)
      } else {
        await onCreateLocation(payload)
      }

      closeLocationForm()
      setErrorNotice(null)
      setSubmitState('idle')
    } catch {
      setErrorNotice({
        message: 'Error al guardar ubicacion',
        subText: 'Revisa la sede seleccionada, permisos o conexion con el backend.',
      })
      setSubmitState('error')
    }
  }

  function openHeadquarterContextMenu(
    headquarter: Headquarter,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault()
    setSelectedHeadquarterId(headquarter.id)
    if (!canManageHeadquarters) {
      return
    }

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      actions: createHeadquarterContextActions({
        headquarter,
        onActivate: (item) =>
          onUpdateHeadquarter(item.id, activeHeadquarterPayload(item)),
        onDeactivate: onDeactivateHeadquarter,
        onEdit: editHeadquarter,
      }),
    })
  }

  function openLocationContextMenu(
    location: Location,
    event: MouseEvent<HTMLTableRowElement>,
  ) {
    event.preventDefault()
    if (!canManageLocations) {
      return
    }

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      actions: createLocationContextActions({
        location,
        onActivate: (item) =>
          onUpdateLocation(item.id, activeLocationPayload(item)),
        onDeactivate: onDeactivateLocation,
        onEdit: editLocation,
      }),
    })
  }

  return (
    <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
      <SettingsHeadquartersList
        activeHeadquarterId={activeHeadquarterId}
        canManage={canManageHeadquarters}
        headquarters={headquarters}
        onAdd={openCreateHeadquarter}
        onContextMenu={openHeadquarterContextMenu}
        onSelect={setSelectedHeadquarterId}
      />

      <SettingsLocationsPanel
        canManage={canManageLocations}
        errorNotice={errorNotice}
        locations={visibleLocations}
        selectedHeadquarter={selectedHeadquarter}
        showHierarchyInfo={showHierarchyInfo}
        onAdd={openCreateLocation}
        onClearError={clearError}
        onCloseHierarchyInfo={() => setShowHierarchyInfo(false)}
        onEdit={editLocation}
        onOpenContextMenu={openLocationContextMenu}
      />

      {canManageHeadquarters && showHeadquarterForm && (
        <HeadquarterFormPanel
          form={headquarterForm}
          isEditing={Boolean(editingHeadquarterId)}
          isSubmitting={submitState === 'submitting'}
          onCancel={closeHeadquarterForm}
          onFieldChange={setHeadquarterField}
          onSubmit={submitHeadquarter}
        />
      )}

      {canManageLocations && showLocationForm && (
        <LocationFormPanel
          activeHeadquarterId={activeHeadquarterId}
          form={locationForm}
          headquarters={headquarters}
          isEditing={Boolean(editingLocationId)}
          isSubmitting={submitState === 'submitting'}
          onCancel={closeLocationForm}
          onFieldChange={setLocationField}
          onSubmit={submitLocation}
        />
      )}

      <EquipmentTypesPanel
        canManage={canManageEquipmentTypes}
        equipmentTypes={equipmentTypes}
        onCreate={onCreateEquipmentType}
        onDeactivate={onDeactivateEquipmentType}
        onUpdate={onUpdateEquipmentType}
      />
      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    </section>
  )
}
