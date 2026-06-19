import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import {
  ContextActionMenu,
  type ContextMenuState,
} from '@/shared/ui/contextActionMenu/ContextActionMenu'
import { AddItemButton } from '@/features/settings/components/settings/AddItemButton'
import { createUser, deleteUser, getUserRoles, getUsers, updateUser } from '@/features/users/services/usersService'
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
    setIsFormOpen(true)
  }

  function openEditForm(user: User) {
    setEditingUser(user)
    setForm(userToForm(user))
    setSubmitState('idle')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingUser(null)
    setForm(emptyUserForm)
    setSubmitState('idle')
  }

  function setField<Key extends keyof UserForm>(key: Key, value: UserForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    const payload = userFormToPayload(form)

    try {
      if (editingUser) {
        const savedUser = await updateUser(editingUser.id, payload)
        setUsers((current) =>
          current.map((user) => (user.id === savedUser.id ? savedUser : user))
        )
      } else {
        await createUser(payload as UserPayload & { password: string })
        setUsers(await getUsers())
      }
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

  function openContextMenu(user: User, event: MouseEvent<HTMLTableRowElement>) {
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
        currentUserId={currentUserId}
        filteredUsers={filteredUsers}
        status={status}
        totalUsers={users.length}
        onDelete={handleDelete}
        onEdit={openEditForm}
        onOpenContextMenu={openContextMenu}
      />

      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />

      {isFormOpen && (
        <UserFormPanel
          editingUser={editingUser}
          form={form}
          roles={roles}
          submitState={submitState}
          onClose={closeForm}
          onFieldChange={setField}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}
