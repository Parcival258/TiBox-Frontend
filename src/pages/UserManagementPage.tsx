import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ContextActionMenu,
  type ContextMenuState,
} from '../components/contextActionMenu/ContextActionMenu'
import { AddItemButton } from '../components/settings/AddItemButton'
import { FloatingFormPanel } from '../components/settings/FloatingFormPanel'
import { AppLoader } from '../components/Loaders'
import { createUser, deleteUser, getUserRoles, getUsers, updateUser } from '../services/users'
import type { RoleOption, User, UserPayload } from '../types/inventory'

type UserForm = {
  department: string
  email: string
  isActive: boolean
  jobTitle: string
  name: string
  password: string
  phone: string
  roleId: string
}

const emptyForm: UserForm = {
  department: '',
  email: '',
  isActive: true,
  jobTitle: '',
  name: '',
  password: '',
  phone: '',
  roleId: '',
}

function optional(value: string) {
  return value.trim() || undefined
}

type UserManagementPageProps = {
  currentUserId: string | null
}

export function UserManagementPage({ currentUserId }: UserManagementPageProps) {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState<UserForm>(emptyForm)

  useEffect(() => {
    Promise.all([getUsers(), getUserRoles()])
      .then(([usersResponse, rolesResponse]) => {
        setUsers(usersResponse)
        setRoles(rolesResponse)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return users.filter((user) =>
      (!normalizedSearch ||
        [user.name, user.email, user.role?.name, user.department, user.jobTitle]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)) &&
      (!roleFilter || (user.role?.id ?? user.roleId ?? '') === roleFilter) &&
      (!statusFilter ||
        (statusFilter === 'active' ? user.isActive ?? true : !(user.isActive ?? true))) &&
      (!departmentFilter || (user.department ?? '') === departmentFilter)
    )
  }, [departmentFilter, roleFilter, search, statusFilter, users])

  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          users
            .map((user) => user.department?.trim())
            .filter((department): department is string => Boolean(department))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [users]
  )

  const hasFilters = Boolean(search.trim() || roleFilter || statusFilter || departmentFilter)

  function clearFilters() {
    setDepartmentFilter('')
    setRoleFilter('')
    setSearch('')
    setStatusFilter('')
  }

  function openCreateForm() {
    setEditingUser(null)
    setForm(emptyForm)
    setSubmitState('idle')
    setIsFormOpen(true)
  }

  function openEditForm(user: User) {
    setEditingUser(user)
    setForm({
      department: user.department ?? '',
      email: user.email,
      isActive: user.isActive ?? true,
      jobTitle: user.jobTitle ?? '',
      name: user.name,
      password: '',
      phone: user.phone ?? '',
      roleId: user.role?.id ?? user.roleId ?? '',
    })
    setSubmitState('idle')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingUser(null)
    setForm(emptyForm)
    setSubmitState('idle')
  }

  function setField<Key extends keyof UserForm>(key: Key, value: UserForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    const payload: UserPayload = {
      department: optional(form.department),
      email: form.email.trim(),
      isActive: form.isActive,
      jobTitle: optional(form.jobTitle),
      name: form.name.trim(),
      phone: optional(form.phone),
      roleId: optional(form.roleId),
      ...(form.password ? { password: form.password } : {}),
    }

    try {
      const savedUser = editingUser
        ? await updateUser(editingUser.id, payload)
        : await createUser(payload as UserPayload & { password: string })

      setUsers((current) =>
        editingUser
          ? current.map((user) => (user.id === savedUser.id ? savedUser : user))
          : [...current, savedUser].sort((a, b) => a.name.localeCompare(b.name))
      )
      closeForm()
    } catch {
      setSubmitState('error')
    }
  }

  async function handleDelete(user: User) {
    const shouldDelete = window.confirm(`Desactivar el usuario ${user.name}?`)

    if (!shouldDelete) {
      return
    }

    await deleteUser(user.id)
    setUsers((current) => current.filter((item) => item.id !== user.id))
  }

  return (
    <section className="flex flex-1 flex-col rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Administracion</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Usuarios</h2>
          <p className="mt-1 text-sm text-slate-400">Gestion temporal disponible solo para administradores.</p>
        </div>
        <AddItemButton label="Usuario" onClick={openCreateForm} />
      </div>

      <div className="grid gap-3 border-b border-slate-800 px-4 py-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(160px,1fr)_auto]">
        <label className="block text-sm">
          <span className="text-slate-500">Buscar</span>
          <input
            className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
            placeholder="Nombre, correo, cargo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <FilterSelect
          label="Rol"
          value={roleFilter}
          onChange={setRoleFilter}
          options={roles.map((role) => ({ label: role.name, value: role.id }))}
        />
        <FilterSelect
          label="Estado"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'Activos', value: 'active' },
            { label: 'Inactivos', value: 'inactive' },
          ]}
        />
        <FilterSelect
          label="Departamento"
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={departmentOptions.map((department) => ({ label: department, value: department }))}
        />
        <div className="flex items-end">
          <button
            className="h-10 rounded-md border border-slate-700 px-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasFilters}
            type="button"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="px-4 py-16 text-center text-sm text-slate-400">
          <AppLoader label="Cargando usuarios..." />
        </div>
      ) : status === 'error' ? (
        <div className="px-4 py-12 text-center text-sm text-red-200">
          No fue posible cargar la gestion de usuarios.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="border-b border-slate-800 px-4 py-3 text-sm text-slate-400">
            {filteredUsers.length} de {users.length} usuario{users.length === 1 ? '' : 's'}
          </div>
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Area</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-400" colSpan={6}>
                    No hay usuarios que coincidan con la busqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    className="app-context-row border-t border-slate-800"
                    key={user.id}
                    tabIndex={0}
                    onContextMenu={(event) => {
                      event.preventDefault()
                      setContextMenu({
                        x: event.clientX,
                        y: event.clientY,
                        actions: [
                          {
                            icon: 'edit',
                            label: 'Editar',
                            onSelect: () => openEditForm(user),
                          },
                          {
                            disabled: user.id === currentUserId,
                            icon: 'trash',
                            label: 'Desactivar',
                            onSelect: () => handleDelete(user),
                            separatorBefore: true,
                            tone: 'danger',
                          },
                        ],
                      })
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3 text-slate-300">{user.role?.name ?? 'Sin rol'}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {[user.department, user.jobTitle].filter(Boolean).join(' / ') || 'Sin dato'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill isActive={user.isActive ?? true} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <ActionButton label="Editar" onClick={() => openEditForm(user)} />
                        <ActionButton
                          disabled={user.id === currentUserId}
                          label="Desactivar"
                          tone="danger"
                          onClick={() => handleDelete(user)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />

      {isFormOpen && (
        <FloatingFormPanel
          title={editingUser ? 'Editar usuario' : 'Crear usuario'}
          onClose={closeForm}
        >
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            <Input label="Nombre" required value={form.name} onChange={(value) => setField('name', value)} />
            <Input label="Correo" required type="email" value={form.email} onChange={(value) => setField('email', value)} />
            <Input
              label={editingUser ? 'Nueva contrasena' : 'Contrasena'}
              required={!editingUser}
              type="password"
              value={form.password}
              onChange={(value) => setField('password', value)}
            />
            <Select
              label="Rol"
              value={form.roleId}
              onChange={(value) => setField('roleId', value)}
              options={roles.map((role) => ({ label: role.name, value: role.id }))}
            />
            <Input label="Telefono" value={form.phone} onChange={(value) => setField('phone', value)} />
            <Input label="Cargo" value={form.jobTitle} onChange={(value) => setField('jobTitle', value)} />
            <Input label="Departamento" value={form.department} onChange={(value) => setField('department', value)} />
            <Checkbox
              checked={form.isActive}
              label="Usuario activo"
              onChange={(value) => setField('isActive', value)}
            />
            {submitState === 'error' && (
              <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200 md:col-span-2">
                No fue posible guardar el usuario. Revisa el correo, rol o permisos.
              </p>
            )}
            <div className="flex justify-end gap-2 md:col-span-2">
              <button
                className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                type="button"
                onClick={closeForm}
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
      )}
    </section>
  )
}

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
      isActive
        ? 'border-emerald-800 bg-emerald-950/30 text-emerald-200'
        : 'border-slate-700 bg-slate-950 text-slate-400'
    }`}>
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function ActionButton({
  label,
  onClick,
  disabled,
  tone = 'default',
}: {
  disabled?: boolean
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  const toneClass = tone === 'danger'
    ? 'border-red-800 text-red-200 hover:border-red-500'
    : 'border-slate-700 text-slate-300 hover:border-cyan-500'

  return (
    <button
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function Input({
  label,
  onChange,
  required,
  type = 'text',
  value,
}: {
  label: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function Select({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sin rol</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Checkbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 self-end text-sm text-slate-300">
      <input
        checked={checked}
        className="h-4 w-4 accent-cyan-500"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}
