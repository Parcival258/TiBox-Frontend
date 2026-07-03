import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import {
  ContextActionMenu,
  type ContextMenuState,
} from '@/shared/ui/contextActionMenu/ContextActionMenu'
import type { ConfirmAction } from '@/app/hooks/useConfirmAction'
import { AddItemButton } from '@/features/settings/components/settings/AddItemButton'
import {
  createUser,
  deleteUser,
  getUserRoles,
  getUsers,
  reactivateUser,
  updateUser,
} from '@/features/users/services/usersService'
import type { RoleOption, User, UserPayload } from '../types'
import { UserFilters } from '../components/UserFilters'
import { UserFormPanel } from '../components/UserFormPanel'
import { UserTable } from '../components/UserTable'
import {
  emptyUserForm,
  userFormToPayload,
  userToForm,
  type UserForm,
} from '../utils/userFormState'

type UserManagementPageProps = {
  currentUserId: string | null
  requestConfirmation: (action: ConfirmAction) => void
}

export function UserManagementPage({
  currentUserId,
  requestConfirmation,
}: UserManagementPageProps) {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState<UserForm>(emptyUserForm)

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
    setForm(emptyUserForm)
    setSubmitState('idle')
    setSubmitError(null)
    setIsFormOpen(true)
  }

  function openEditForm(user: User) {
    setEditingUser(user)
    setForm(userToForm(user))
    setSubmitState('idle')
    setSubmitError(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingUser(null)
    setForm(emptyUserForm)
    setSubmitState('idle')
    setSubmitError(null)
  }

  function setField<Key extends keyof UserForm>(key: Key, value: UserForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')
    setSubmitError(null)

    const payload = userFormToPayload(form)

    try {
      if (editingUser) {
        const savedUser = await updateUser(editingUser.id, payload)
        setUsers((current) =>
          current.map((user) => (user.id === savedUser.id ? savedUser : user))
        )
      } else {
        const savedUser = await createUser(payload as UserPayload & { password: string })
        setUsers((current) =>
          [...current.filter((user) => user.id !== savedUser.id), savedUser]
            .sort((left, right) => left.name.localeCompare(right.name))
        )
      }
      closeForm()
    } catch (error) {
      setSubmitState('error')
      setSubmitError(
        error instanceof Error && error.message === 'HTTP 409'
          ? 'Ya existe un usuario registrado con este correo.'
          : 'No fue posible guardar el usuario. Revisa el correo, rol o permisos.'
      )
    }
  }

  async function deactivateUser(user: User) {
    await deleteUser(user.id)
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, isActive: false } : item
      )
    )
  }

  async function restoreUser(user: User) {
    const savedUser = await reactivateUser(user.id)
    setUsers((current) =>
      current.map((item) => (item.id === savedUser.id ? savedUser : item))
    )
  }

  function requestDeactivateUser(user: User) {
    requestConfirmation({
      confirmLabel: 'Desactivar usuario',
      message: `El usuario ${user.name} quedara inactivo y no podra iniciar sesion hasta que sea reactivado.`,
      onConfirm: () => {
        void deactivateUser(user)
      },
      title: 'Confirmar desactivacion',
    })
  }

  function requestRestoreUser(user: User) {
    requestConfirmation({
      confirmLabel: 'Reactivar usuario',
      message: `El usuario ${user.name} volvera a estar activo y podra usar el sistema segun su rol.`,
      onConfirm: () => {
        void restoreUser(user)
      },
      title: 'Confirmar reactivacion',
    })
  }

  function openContextMenu(user: User, event: MouseEvent<HTMLElement>) {
    event.preventDefault()
    const isActive = user.isActive ?? true

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      actions: [
        {
          icon: 'edit',
          label: 'Editar',
          onSelect: () => openEditForm(user),
        },
        isActive
          ? {
              disabled: user.id === currentUserId,
              icon: 'trash',
              label: 'Desactivar',
              onSelect: () => requestDeactivateUser(user),
              separatorBefore: true,
              tone: 'danger',
            }
          : {
              icon: 'check',
              label: 'Reactivar',
              onSelect: () => requestRestoreUser(user),
              separatorBefore: true,
              tone: 'success',
            },
      ],
    })
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

      <UserFilters
        departmentFilter={departmentFilter}
        departmentOptions={departmentOptions}
        hasFilters={hasFilters}
        roleFilter={roleFilter}
        roles={roles}
        search={search}
        statusFilter={statusFilter}
        onClear={clearFilters}
        onDepartmentFilterChange={setDepartmentFilter}
        onRoleFilterChange={setRoleFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      <UserTable
        filteredUsers={filteredUsers}
        status={status}
        totalUsers={users.length}
        onOpenContextMenu={openContextMenu}
      />

      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />

      {isFormOpen && (
        <UserFormPanel
          editingUser={editingUser}
          form={form}
          roles={roles}
          submitError={submitError}
          submitState={submitState}
          onClose={closeForm}
          onFieldChange={setField}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}
