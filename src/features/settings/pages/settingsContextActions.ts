import type { Headquarter, Location } from '../types'

type ContextAction = {
  icon: 'edit' | 'trash' | 'check'
  label: string
  onSelect: () => void
  separatorBefore?: boolean
  tone?: 'danger' | 'success'
}

type HeadquarterActionsParams = {
  headquarter: Headquarter
  onActivate: (headquarter: Headquarter) => void
  onDeactivate: (headquarterId: string) => void
  onEdit: (headquarter: Headquarter) => void
}

type LocationActionsParams = {
  location: Location
  onActivate: (location: Location) => void
  onDeactivate: (locationId: string) => void
  onEdit: (location: Location) => void
}

export function createHeadquarterContextActions({
  headquarter,
  onActivate,
  onDeactivate,
  onEdit,
}: HeadquarterActionsParams): ContextAction[] {
  return [
    {
      icon: 'edit',
      label: 'Editar sede',
      onSelect: () => onEdit(headquarter),
    },
    headquarter.isActive
      ? {
          icon: 'trash',
          label: 'Desactivar sede',
          onSelect: () => onDeactivate(headquarter.id),
          separatorBefore: true,
          tone: 'danger',
        }
      : {
          icon: 'check',
          label: 'Activar sede',
          onSelect: () => onActivate(headquarter),
          separatorBefore: true,
          tone: 'success',
        },
  ]
}

export function createLocationContextActions({
  location,
  onActivate,
  onDeactivate,
  onEdit,
}: LocationActionsParams): ContextAction[] {
  return [
    {
      icon: 'edit',
      label: 'Editar ubicacion',
      onSelect: () => onEdit(location),
    },
    location.isActive
      ? {
          icon: 'trash',
          label: 'Desactivar',
          onSelect: () => onDeactivate(location.id),
          separatorBefore: true,
          tone: 'danger',
        }
      : {
          icon: 'check',
          label: 'Activar',
          onSelect: () => onActivate(location),
          separatorBefore: true,
          tone: 'success',
        },
  ]
}
