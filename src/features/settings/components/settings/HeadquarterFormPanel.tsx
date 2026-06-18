import type { FormEvent } from 'react'
import { FloatingFormPanel } from './FloatingFormPanel'
import {
  Checkbox,
  FormActions,
  Input,
  Textarea,
} from '../../pages/SettingsFormFields'
import type { HeadquarterForm } from '../../pages/settingsForms'

type HeadquarterFormPanelProps = {
  form: HeadquarterForm
  isEditing: boolean
  isSubmitting: boolean
  onCancel: () => void
  onFieldChange: <Key extends keyof HeadquarterForm>(key: Key, value: HeadquarterForm[Key]) => void
  onSubmit: (event: FormEvent) => void
}

export function HeadquarterFormPanel({
  form,
  isEditing,
  isSubmitting,
  onCancel,
  onFieldChange,
  onSubmit,
}: HeadquarterFormPanelProps) {
  return (
    <FloatingFormPanel title={isEditing ? 'Editar sede' : 'Nueva sede'} onClose={onCancel}>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input
          label="Nombre"
          required
          value={form.name}
          onChange={(value) => onFieldChange('name', value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Ciudad"
            value={form.city}
            onChange={(value) => onFieldChange('city', value)}
          />
          <Input
            label="Direccion"
            value={form.address}
            onChange={(value) => onFieldChange('address', value)}
          />
        </div>
        <Textarea
          label="Descripcion"
          value={form.description}
          onChange={(value) => onFieldChange('description', value)}
        />
        <Checkbox
          checked={form.isActive}
          label="Sede activa"
          onChange={(value) => onFieldChange('isActive', value)}
        />
        <FormActions canCancel isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </FloatingFormPanel>
  )
}
