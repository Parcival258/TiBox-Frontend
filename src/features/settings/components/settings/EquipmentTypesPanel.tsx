import { useState, type FormEvent } from 'react'
import {
  ContextActionMenu,
  type ContextMenuState,
} from '@/shared/ui/contextActionMenu/ContextActionMenu'
import type { EquipmentType, EquipmentTypePayload } from '@/shared/types/inventory'
import { AddItemButton } from './AddItemButton'
import { FloatingFormPanel } from './FloatingFormPanel'

type Props = {
  canManage: boolean
  equipmentTypes: EquipmentType[]
  onCreate: (payload: EquipmentTypePayload) => Promise<void>
  onDeactivate: (equipmentTypeId: string) => Promise<void>
  onUpdate: (equipmentTypeId: string, payload: EquipmentTypePayload) => Promise<void>
}

const emptyForm = { description: '', isActive: true, name: '' }

export function EquipmentTypesPanel({ canManage, equipmentTypes, onCreate, onDeactivate, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)

  function closeForm() {
    setEditingId(null)
    setForm(emptyForm)
    setIsOpen(false)
    setError(null)
  }

  function edit(item: EquipmentType) {
    setEditingId(item.id)
    setForm({
      description: item.description ?? '',
      isActive: item.isActive,
      name: item.name,
    })
    setIsOpen(true)
    setError(null)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const payload = {
      description: form.description.trim() || undefined,
      isActive: form.isActive,
      name: form.name.trim(),
    }

    try {
      if (editingId) {
        await onUpdate(editingId, payload)
      } else {
        await onCreate(payload)
      }
      closeForm()
    } catch {
      setError('No fue posible guardar el tipo. Verifica que el nombre no este repetido.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 xl:col-span-2">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Inventario</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Tipos de equipo</h2>
          <p className="mt-1 text-sm text-slate-400">Opciones disponibles al registrar y filtrar equipos.</p>
        </div>
        {canManage && (
          <AddItemButton
            label="Tipo"
            onClick={() => {
              setEditingId(null)
              setForm(emptyForm)
              setIsOpen(true)
            }}
          />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Descripcion</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {equipmentTypes.map((item) => (
              <tr
                key={item.id}
                className={canManage ? 'app-click-row border-t border-slate-800' : 'border-t border-slate-800'}
                onContextMenu={(event) => {
                  event.preventDefault()
                  if (!canManage) return

                  setContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    actions: [
                      {
                        icon: 'edit',
                        label: 'Editar tipo',
                        onSelect: () => edit(item),
                      },
                      item.isActive
                        ? {
                            icon: 'trash',
                            label: 'Desactivar tipo',
                            onSelect: () => onDeactivate(item.id),
                            separatorBefore: true,
                            tone: 'danger',
                          }
                        : {
                            icon: 'check',
                            label: 'Activar tipo',
                            onSelect: () =>
                              onUpdate(item.id, {
                                description: item.description ?? undefined,
                                isActive: true,
                                name: item.name,
                              }),
                            separatorBefore: true,
                            tone: 'success',
                          },
                    ],
                  })
                }}
              >
                <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                <td className="px-4 py-3 text-slate-400">{item.description || 'Sin descripcion'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${item.isActive ? 'border-emerald-800 bg-emerald-950/30 text-emerald-200' : 'border-slate-700 bg-slate-950 text-slate-400'}`}>
                    {item.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
            {equipmentTypes.length === 0 && (
              <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={3}>No hay tipos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {canManage && isOpen && (
        <FloatingFormPanel title={editingId ? 'Editar tipo' : 'Nuevo tipo'} onClose={closeForm}>
          <form className="space-y-3" onSubmit={submit}>
            <label className="block text-sm">
              <span className="text-slate-500">Nombre</span>
              <input className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500" required minLength={2} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-500">Descripcion</span>
              <textarea className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input checked={form.isActive} className="h-4 w-4 accent-cyan-500" type="checkbox" onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
              Tipo activo
            </label>
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <div className="flex justify-end gap-2">
              <button className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300" type="button" onClick={closeForm}>Cancelar</button>
              <button className="rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 disabled:opacity-50" disabled={isSubmitting} type="submit">{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </FloatingFormPanel>
      )}
      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    </div>
  )
}
