import { useMemo, useState, type FormEvent } from 'react'
import type { Headquarter, HeadquarterPayload, Location, LocationPayload } from '../types/inventory'

type SettingsPageProps = {
  canManageHeadquarters: boolean
  canManageLocations: boolean
  headquarters: Headquarter[]
  locations: Location[]
  onCreateHeadquarter: (payload: HeadquarterPayload) => Promise<void>
  onCreateLocation: (payload: LocationPayload) => Promise<void>
  onDeactivateHeadquarter: (headquarterId: string) => Promise<void>
  onDeactivateLocation: (locationId: string) => Promise<void>
  onUpdateHeadquarter: (headquarterId: string, payload: HeadquarterPayload) => Promise<void>
  onUpdateLocation: (locationId: string, payload: LocationPayload) => Promise<void>
}

type HeadquarterForm = {
  address: string
  city: string
  description: string
  isActive: boolean
  name: string
}

type LocationForm = {
  area: string
  description: string
  floor: string
  headquarterId: string
  isActive: boolean
  office: string
}

const emptyHeadquarterForm: HeadquarterForm = {
  address: '',
  city: '',
  description: '',
  isActive: true,
  name: '',
}

const emptyLocationForm: LocationForm = {
  area: '',
  description: '',
  floor: '',
  headquarterId: '',
  isActive: true,
  office: '',
}

export function SettingsPage({
  canManageHeadquarters,
  canManageLocations,
  headquarters,
  locations,
  onCreateHeadquarter,
  onCreateLocation,
  onDeactivateHeadquarter,
  onDeactivateLocation,
  onUpdateHeadquarter,
  onUpdateLocation,
}: SettingsPageProps) {
  const [selectedHeadquarterId, setSelectedHeadquarterId] = useState(headquarters[0]?.id ?? '')
  const [editingHeadquarterId, setEditingHeadquarterId] = useState<string | null>(null)
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null)
  const [headquarterForm, setHeadquarterForm] = useState<HeadquarterForm>(emptyHeadquarterForm)
  const [locationForm, setLocationForm] = useState<LocationForm>(emptyLocationForm)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')

  const activeHeadquarterId = selectedHeadquarterId || headquarters[0]?.id || ''
  const selectedHeadquarter = headquarters.find((headquarter) => headquarter.id === activeHeadquarterId)
  const visibleLocations = useMemo(
    () => locations.filter((location) => location.headquarterId === activeHeadquarterId),
    [activeHeadquarterId, locations]
  )

  function setHeadquarterField<Key extends keyof HeadquarterForm>(key: Key, value: HeadquarterForm[Key]) {
    setHeadquarterForm((current) => ({ ...current, [key]: value }))
  }

  function setLocationField<Key extends keyof LocationForm>(key: Key, value: LocationForm[Key]) {
    setLocationForm((current) => ({ ...current, [key]: value }))
  }

  function editHeadquarter(headquarter: Headquarter) {
    setEditingHeadquarterId(headquarter.id)
    setHeadquarterForm({
      address: headquarter.address ?? '',
      city: headquarter.city ?? '',
      description: headquarter.description ?? '',
      isActive: headquarter.isActive,
      name: headquarter.name,
    })
  }

  function editLocation(location: Location) {
    setEditingLocationId(location.id)
    setLocationForm({
      area: location.area ?? '',
      description: location.description ?? '',
      floor: location.floor ?? '',
      headquarterId: location.headquarterId,
      isActive: location.isActive,
      office: location.office ?? '',
    })
  }

  async function submitHeadquarter(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    const payload = headquarterPayload(headquarterForm)

    try {
      if (editingHeadquarterId) {
        await onUpdateHeadquarter(editingHeadquarterId, payload)
      } else {
        await onCreateHeadquarter(payload)
      }

      setHeadquarterForm(emptyHeadquarterForm)
      setEditingHeadquarterId(null)
      setSubmitState('idle')
    } catch {
      setSubmitState('error')
    }
  }

  async function submitLocation(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    const payload = locationPayload({
      ...locationForm,
      headquarterId: locationForm.headquarterId || activeHeadquarterId,
    })

    try {
      if (editingLocationId) {
        await onUpdateLocation(editingLocationId, payload)
      } else {
        await onCreateLocation(payload)
      }

      setLocationForm({ ...emptyLocationForm, headquarterId: activeHeadquarterId })
      setEditingLocationId(null)
      setSubmitState('idle')
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-cyan-300">Configuracion</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Sedes</h2>
        </div>

        <div className="divide-y divide-slate-800">
          {headquarters.map((headquarter) => (
            <button
              key={headquarter.id}
              className={`block w-full px-4 py-3 text-left transition ${
                headquarter.id === activeHeadquarterId ? 'bg-cyan-950/40' : 'hover:bg-slate-950/70'
              }`}
              type="button"
              onClick={() => setSelectedHeadquarterId(headquarter.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{headquarter.name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {[headquarter.city, headquarter.address].filter(Boolean).join(' / ') || 'Sin ciudad'}
                  </p>
                </div>
                <StatusPill isActive={headquarter.isActive} />
              </div>
            </button>
          ))}
        </div>

        {canManageHeadquarters && (
          <form className="space-y-3 border-t border-slate-800 p-4" onSubmit={submitHeadquarter}>
            <h3 className="text-sm font-semibold text-white">
              {editingHeadquarterId ? 'Editar sede' : 'Nueva sede'}
            </h3>
            <Input label="Nombre" required value={headquarterForm.name} onChange={(value) => setHeadquarterField('name', value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Ciudad" value={headquarterForm.city} onChange={(value) => setHeadquarterField('city', value)} />
              <Input label="Direccion" value={headquarterForm.address} onChange={(value) => setHeadquarterField('address', value)} />
            </div>
            <Textarea
              label="Descripcion"
              value={headquarterForm.description}
              onChange={(value) => setHeadquarterField('description', value)}
            />
            <Checkbox
              checked={headquarterForm.isActive}
              label="Sede activa"
              onChange={(value) => setHeadquarterField('isActive', value)}
            />
            <FormActions
              canCancel={Boolean(editingHeadquarterId)}
              isSubmitting={submitState === 'submitting'}
              onCancel={() => {
                setEditingHeadquarterId(null)
                setHeadquarterForm(emptyHeadquarterForm)
              }}
            />
          </form>
        )}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Jerarquia</p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {selectedHeadquarter?.name ?? 'Ubicaciones'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Sede / piso / area / oficina
            </p>
          </div>
          {submitState === 'error' && (
            <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              No fue posible guardar los cambios.
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Piso</th>
                <th className="px-4 py-3 font-medium">Area</th>
                <th className="px-4 py-3 font-medium">Oficina</th>
                <th className="px-4 py-3 font-medium">Descripcion</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleLocations.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-400" colSpan={6}>
                    Esta sede no tiene ubicaciones registradas.
                  </td>
                </tr>
              ) : (
                visibleLocations.map((location) => (
                  <tr key={location.id} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-slate-300">{location.floor || 'Sin piso'}</td>
                    <td className="px-4 py-3 text-white">{location.area || 'Sin area'}</td>
                    <td className="px-4 py-3 text-slate-300">{location.office || 'Sin oficina'}</td>
                    <td className="px-4 py-3 text-slate-400">{location.description || 'Sin descripcion'}</td>
                    <td className="px-4 py-3"><StatusPill isActive={location.isActive} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {canManageLocations && (
                          <>
                            <ActionButton label="Editar" onClick={() => editLocation(location)} />
                            {location.isActive ? (
                              <ActionButton
                                label="Desactivar"
                                tone="danger"
                                onClick={() => onDeactivateLocation(location.id)}
                              />
                            ) : (
                              <ActionButton
                                label="Activar"
                                onClick={() => onUpdateLocation(location.id, locationPayload({
                                  area: location.area ?? '',
                                  description: location.description ?? '',
                                  floor: location.floor ?? '',
                                  headquarterId: location.headquarterId,
                                  isActive: true,
                                  office: location.office ?? '',
                                }))}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {canManageLocations && (
          <form className="grid gap-3 border-t border-slate-800 p-4 lg:grid-cols-2" onSubmit={submitLocation}>
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-white">
                {editingLocationId ? 'Editar ubicacion' : 'Nueva ubicacion'}
              </h3>
            </div>
            <Select
              label="Sede"
              value={locationForm.headquarterId || activeHeadquarterId}
              onChange={(value) => setLocationField('headquarterId', value)}
              options={headquarters.map((headquarter) => ({ label: headquarter.name, value: headquarter.id }))}
            />
            <Input label="Piso" value={locationForm.floor} onChange={(value) => setLocationField('floor', value)} />
            <Input label="Area" value={locationForm.area} onChange={(value) => setLocationField('area', value)} />
            <Input label="Oficina" value={locationForm.office} onChange={(value) => setLocationField('office', value)} />
            <div className="lg:col-span-2">
              <Textarea
                label="Descripcion"
                value={locationForm.description}
                onChange={(value) => setLocationField('description', value)}
              />
            </div>
            <Checkbox
              checked={locationForm.isActive}
              label="Ubicacion activa"
              onChange={(value) => setLocationField('isActive', value)}
            />
            <div className="flex items-end justify-end">
              <FormActions
                canCancel={Boolean(editingLocationId)}
                isSubmitting={submitState === 'submitting'}
                onCancel={() => {
                  setEditingLocationId(null)
                  setLocationForm({ ...emptyLocationForm, headquarterId: activeHeadquarterId })
                }}
              />
            </div>
          </form>
        )}

        {canManageHeadquarters && selectedHeadquarter && (
          <div className="flex flex-wrap gap-2 border-t border-slate-800 px-4 py-3">
            <ActionButton label="Editar sede seleccionada" onClick={() => editHeadquarter(selectedHeadquarter)} />
            {selectedHeadquarter.isActive ? (
              <ActionButton
                label="Desactivar sede"
                tone="danger"
                onClick={() => onDeactivateHeadquarter(selectedHeadquarter.id)}
              />
            ) : (
              <ActionButton
                label="Activar sede"
                onClick={() => onUpdateHeadquarter(selectedHeadquarter.id, headquarterPayload({
                  address: selectedHeadquarter.address ?? '',
                  city: selectedHeadquarter.city ?? '',
                  description: selectedHeadquarter.description ?? '',
                  isActive: true,
                  name: selectedHeadquarter.name,
                }))}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function headquarterPayload(form: HeadquarterForm): HeadquarterPayload {
  return {
    address: optional(form.address),
    city: optional(form.city),
    description: optional(form.description),
    isActive: form.isActive,
    name: form.name.trim(),
  }
}

function locationPayload(form: LocationForm): LocationPayload {
  return {
    area: optional(form.area),
    description: optional(form.description),
    floor: optional(form.floor),
    headquarterId: form.headquarterId,
    isActive: form.isActive,
    office: optional(form.office),
  }
}

function optional(value: string) {
  return value.trim() || undefined
}

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
      isActive
        ? 'border-emerald-800 bg-emerald-950/30 text-emerald-200'
        : 'border-slate-700 bg-slate-950 text-slate-400'
    }`}>
      {isActive ? 'Activa' : 'Inactiva'}
    </span>
  )
}

function ActionButton({
  label,
  onClick,
  tone = 'default',
}: {
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  const toneClass = tone === 'danger'
    ? 'border-red-800 text-red-200 hover:border-red-500'
    : 'border-slate-700 text-slate-300 hover:border-cyan-500'

  return (
    <button
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition hover:text-white ${toneClass}`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function FormActions({
  canCancel,
  isSubmitting,
  onCancel,
}: {
  canCancel: boolean
  isSubmitting: boolean
  onCancel: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {canCancel && (
        <button
          className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>
      )}
      <button
        className="rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}

function Input({
  label,
  onChange,
  required,
  value,
}: {
  label: string
  onChange: (value: string) => void
  required?: boolean
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        required={required}
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
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Textarea({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <textarea
        className="mt-1 min-h-20 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
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
    <label className="flex items-center gap-2 text-sm text-slate-300">
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
