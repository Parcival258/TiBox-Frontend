import type { MouseEvent } from 'react'
import { AppLoader } from '@/shared/ui/Loaders'
import type { User } from '../types'

type UserTableProps = {
  filteredUsers: User[]
  status: 'loading' | 'ready' | 'error'
  totalUsers: number
  onOpenContextMenu: (user: User, event: MouseEvent<HTMLElement>) => void
}

export function UserTable({
  filteredUsers,
  status,
  totalUsers,
  onOpenContextMenu,
}: UserTableProps) {
  if (status === 'loading') {
    return (
      <div className="px-4 py-16 text-center text-sm text-slate-400">
        <AppLoader label="Cargando usuarios..." />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="px-4 py-12 text-center text-sm text-red-200">
        No fue posible cargar la gestion de usuarios.
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-slate-800 px-4 py-3 text-sm text-slate-400">
        {filteredUsers.length} de {totalUsers} usuario{totalUsers === 1 ? '' : 's'}
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {filteredUsers.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-400">
            No hay usuarios que coincidan con la busqueda.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <article
              className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
              key={user.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-white">{user.name}</p>
                  <p className="mt-1 break-words text-sm text-slate-300">{user.email}</p>
                </div>
                <UserStatusPill isActive={user.isActive ?? true} />
              </div>
              <dl className="mt-3 grid gap-2 text-xs">
                <UserCardField label="Rol" value={user.role?.name ?? 'Sin rol'} />
                <UserCardField
                  label="Area"
                  value={[user.department, user.jobTitle].filter(Boolean).join(' / ') || 'Sin dato'}
                />
              </dl>
              <button
                className="mt-3 rounded-md border border-cyan-700 px-3 py-1.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-400"
                type="button"
                onClick={(event) => onOpenContextMenu(user, event)}
              >
                Acciones
              </button>
            </article>
          ))
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-950 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Correo</th>
            <th className="px-4 py-3 font-medium">Rol</th>
            <th className="px-4 py-3 font-medium">Area</th>
            <th className="px-4 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td className="px-4 py-12 text-center text-slate-400" colSpan={5}>
                No hay usuarios que coincidan con la busqueda.
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr
                className="app-context-row border-t border-slate-800"
                key={user.id}
                tabIndex={0}
                onContextMenu={(event) => onOpenContextMenu(user, event)}
              >
                <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                <td className="px-4 py-3 text-slate-300">{user.email}</td>
                <td className="px-4 py-3 text-slate-300">{user.role?.name ?? 'Sin rol'}</td>
                <td className="px-4 py-3 text-slate-400">
                  {[user.department, user.jobTitle].filter(Boolean).join(' / ') || 'Sin dato'}
                </td>
                <td className="px-4 py-3">
                  <UserStatusPill isActive={user.isActive ?? true} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}

function UserCardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-slate-300">{value}</dd>
    </div>
  )
}

function UserStatusPill({ isActive }: { isActive: boolean }) {
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
