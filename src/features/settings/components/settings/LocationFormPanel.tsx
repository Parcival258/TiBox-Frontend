import type { FormEvent } from 'react'
import { FloatingFormPanel } from './FloatingFormPanel'
import {
  Checkbox,
  FormActions,
  Input,
  Select,
  Textarea,
} from '../../pages/SettingsFormFields'
import type { Headquarter } from '../../types'
import type { LocationForm } from '../../pages/settingsForms'

type LocationFormPanelProps = {
  activeHeadquarterId: string
  form: LocationForm
  headquarters: Headquarter[]
  isEditing: boolean
  isSubmitting: boolean
  onCancel: () => void
  onFieldChange: <Key extends keyof LocationForm>(key: Key, value: LocationForm[Key]) => void
  onSubmit: (event: FormEvent) => void
}

export function LocationFormPanel({
  activeHeadquarterId,
  form,
  headquarters,
  isEditing,
  isSubmitting,
  onCancel,
  onFieldChange,
  onSubmit,
}: LocationFormPanelProps) {
  return (
    <FloatingFormPanel title={isEditing ? 'Editar ubicacion' : 'Nueva ubicacion'} onClose={onCancel}>
      <form className="grid gap-3 lg:grid-cols-2" onSubmit={onSubmit}>
        <Select
          label="Sede"
          value={form.headquarterId || activeHeadquarterId}
          onChange={(value) => onFieldChange('headquarterId', value)}
          options={headquarters.map((headquarter) => ({
            label: headquarter.name,
            value: headquarter.id,
          }))}
        />
        <Input label="Piso" value={form.floor} onChange={(value) => onFieldChange('floor', value)} />
        <Input label="Area" value={form.area} onChange={(value) => onFieldChange('area', value)} />
        <Input label="Oficina" value={form.office} onChange={(value) => onFieldChange('office', value)} />
        <div className="lg:col-span-2">
          <Textarea
            label="Descripcion"
            value={form.description}
            onChange={(value) => onFieldChange('description', value)}
          />
        </div>
        <Checkbox
          checked={form.isActive}
          label="Ubicacion activa"
          onChange={(value) => onFieldChange('isActive', value)}
        />
        <div className="flex items-end justify-end">
          <FormActions canCancel isSubmitting={isSubmitting} onCancel={onCancel} />
        </div>
      </form>
    </FloatingFormPanel>
  )
}
