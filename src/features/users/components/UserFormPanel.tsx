import type { FormEvent } from 'react'
import { FloatingFormPanel } from '@/features/settings/components/settings/FloatingFormPanel'
import type { RoleOption, User } from '../types'
import type { UserForm } from '../utils/userFormState'
import { UserCheckbox, UserInput, UserSelect } from './UserFieldControls'

type UserFormPanelProps = {
  editingUser: User | null
  form: UserForm
  roles: RoleOption[]
  submitError: string | null
  submitState: 'idle' | 'submitting' | 'error'
  onClose: () => void
  onFieldChange: <Key extends keyof UserForm>(key: Key, value: UserForm[Key]) => void
  onSubmit: (event: FormEvent) => void
}

export function UserFormPanel({
  editingUser,
  form,
  roles,
  submitError,
  submitState,
  onClose,
  onFieldChange,
  onSubmit,
}: UserFormPanelProps) {
  return (
    <FloatingFormPanel
      title={editingUser ? 'Editar usuario' : 'Crear usuario'}
      onClose={onClose}
    >
      <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <UserInput
          label="Nombre"
          required
          value={form.name}
          onChange={(value) => onFieldChange('name', value)}
        />
        <UserInput
          label="Correo"
          required
          type="email"
          value={form.email}
          onChange={(value) => onFieldChange('email', value)}
        />
        <UserInput
          label={editingUser ? 'Nueva contrasena' : 'Contrasena'}
          required={!editingUser}
          type="password"
          value={form.password}
          onChange={(value) => onFieldChange('password', value)}
        />
        <UserSelect
          label="Rol"
          value={form.roleId}
          onChange={(value) => onFieldChange('roleId', value)}
          options={roles.map((role) => ({ label: role.name, value: role.id }))}
        />
        <UserInput
          label="Telefono"
          value={form.phone}
          onChange={(value) => onFieldChange('phone', value)}
        />
        <UserInput
          label="Cargo"
          value={form.jobTitle}
          onChange={(value) => onFieldChange('jobTitle', value)}
        />
        <UserInput
          label="Departamento"
          value={form.department}
          onChange={(value) => onFieldChange('department', value)}
        />
        <UserCheckbox
          checked={form.isActive}
          label="Usuario activo"
          onChange={(value) => onFieldChange('isActive', value)}
        />
        {submitState === 'error' && (
          <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200 md:col-span-2">
            {submitError ?? 'No fue posible guardar el usuario. Revisa el correo, rol o permisos.'}
          </p>
        )}
        <div className="flex justify-end gap-2 md:col-span-2">
          <button
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitState === 'submitting'}
            type="submit"
          >
            {submitState === 'submitting' ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </FloatingFormPanel>
  )
}
