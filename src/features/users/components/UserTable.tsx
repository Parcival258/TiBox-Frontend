import type { MouseEvent } from 'react'
import { AppLoader } from '@/shared/ui/Loaders'
import type { User } from '../types'

type UserTableProps = {
  filteredUsers: User[]
  status: 'loading' | 'ready' | 'error'
  totalUsers: number
  onOpenContextMenu: (user: User, event: MouseEvent<HTMLTableRowElement>) => void
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
    <div className="overflow-x-auto">
      <div className="border-b border-slate-800 px-4 py-3 text-sm text-slate-400">
        {filteredUsers.length} de {totalUsers} usuario{totalUsers === 1 ? '' : 's'}
      </div>
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
