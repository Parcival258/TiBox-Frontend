import type { ConfirmAction } from '@/app/hooks/useConfirmAction'
import {
  clearSystemErrorLogs,
  getSystemErrorLogs,
  updateSystemErrorLogSettings,
  type SystemErrorLogEntry,
  type SystemErrorLogsResponse,
} from '../services/systemLogsService'
import { Switch } from '@/shared/ui/Switch'
import { useEffect, useMemo, useState } from 'react'

type SystemLogsPageProps = {
  requestConfirmation: (action: ConfirmAction) => void
}

export function SystemLogsPage({ requestConfirmation }: SystemLogsPageProps) {
  const [systemLogs, setSystemLogs] = useState<SystemErrorLogsResponse | null>(null)
  const [systemLogsStatus, setSystemLogsStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [limit, setLimit] = useState(50)
  const [search, setSearch] = useState('')
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)

  useEffect(() => {
    refreshSystemLogs()
  }, [limit])

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const entries = systemLogs?.entries ?? []

    if (!normalizedSearch) {
      return entries
    }

    return entries.filter((entry) =>
      [
        entry.message,
        entry.name,
        entry.path,
        entry.method,
        entry.status?.toString(),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [search, systemLogs])

  function refreshSystemLogs() {
    setSystemLogsStatus('loading')
    getSystemErrorLogs(limit)
      .then((logs) => {
        setSystemLogs(logs)
        setSystemLogsStatus('ready')
      })
      .catch(() => setSystemLogsStatus('error'))
  }

  function requestClearSystemLogs() {
    requestConfirmation({
      confirmLabel: 'Limpiar logs',
      message: 'Se vaciara el archivo de errores del sistema para liberar espacio. Esta accion no se puede deshacer.',
      onConfirm: () => {
        clearSystemErrorLogs()
          .then(refreshSystemLogs)
          .catch(() => setSystemLogsStatus('error'))
      },
      title: 'Confirmar limpieza de logs',
    })
  }

  function changeLogRegistration(enabled: boolean) {
    setIsUpdatingSettings(true)
    updateSystemErrorLogSettings(enabled)
      .then((settings) => {
        setSystemLogs((current) =>
          current
            ? {
                ...current,
                settings,
              }
            : current
        )
      })
      .catch(() => setSystemLogsStatus('error'))
      .finally(() => setIsUpdatingSettings(false))
  }

  return (
    <section className="flex-1 space-y-5">
      <header>
        <p className="text-xs uppercase tracking-wide text-cyan-300">Administracion</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Errores del sistema</h2>
        <p className="mt-1 text-sm text-slate-400">
          Consulta errores tecnicos recientes y limpia el archivo de logs cuando sea necesario.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Registro" value={systemLogs?.settings.enabled ? 'Activo' : 'Pausado'} tone={systemLogs?.settings.enabled ? 'success' : 'warning'} />
        <SummaryCard label="Tamaño" value={systemLogs ? formatBytes(systemLogs.file.size) : '...'} />
        <SummaryCard label="Mostrando" value={`${filteredEntries.length} / ${systemLogs?.entries.length ?? 0}`} />
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="grid gap-4 border-b border-slate-800 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h3 className="font-semibold text-white">Archivo de errores</h3>
            <p className="mt-1 text-sm text-slate-400">
              {systemLogs
                ? `${formatBytes(systemLogs.file.size)} / ${systemLogs.entries.length} registro${systemLogs.entries.length === 1 ? '' : 's'} reciente${systemLogs.entries.length === 1 ? '' : 's'}.`
                : systemLogsStatus === 'error'
                  ? 'No fue posible cargar los logs del sistema.'
                  : 'Cargando informacion del archivo de errores.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Switch
              checked={systemLogs?.settings.enabled ?? true}
              disabled={isUpdatingSettings || !systemLogs}
              label={systemLogs?.settings.enabled ? 'Registrando errores' : 'Registro pausado'}
              onChange={changeLogRegistration}
            />
            <button className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white" type="button" onClick={refreshSystemLogs}>
              Actualizar
            </button>
            <button
              className="rounded-md border border-rose-900 px-3 py-2 text-sm font-medium text-rose-300 transition hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!systemLogs || systemLogs.file.size === 0}
              type="button"
              onClick={requestClearSystemLogs}
            >
              Limpiar logs
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-800 px-5 py-4 md:grid-cols-[1fr_160px]">
          <label className="block text-sm">
            <span className="text-slate-500">Buscar en errores cargados</span>
            <input
              className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              placeholder="Mensaje, ruta, status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-500">Cantidad</span>
            <select
              className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
            >
              <option value={25}>Ultimos 25</option>
              <option value={50}>Ultimos 50</option>
              <option value={100}>Ultimos 100</option>
              <option value={200}>Ultimos 200</option>
              <option value={500}>Ultimos 500</option>
            </select>
          </label>
        </div>

        <div className="p-5">
          {systemLogsStatus === 'loading' && (
            <p className="text-sm text-slate-400">Cargando errores registrados...</p>
          )}
          {systemLogsStatus === 'error' && (
            <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              No fue posible consultar el archivo de errores.
            </p>
          )}
          {systemLogsStatus === 'ready' && systemLogs?.entries.length === 0 && (
            <p className="text-sm text-slate-400">No hay errores registrados.</p>
          )}
          {systemLogsStatus === 'ready' && Boolean(systemLogs?.entries.length) && filteredEntries.length === 0 && (
            <p className="text-sm text-slate-400">No hay errores que coincidan con la busqueda.</p>
          )}
          {systemLogsStatus === 'ready' && filteredEntries.length > 0 && (
            <div className="overflow-hidden rounded-md border border-slate-800">
              {filteredEntries.map((entry) => (
                <LogEntryRow entry={entry} key={entry.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function SummaryCard({
  label,
  tone = 'default',
  value,
}: {
  label: string
  tone?: 'default' | 'success' | 'warning'
  value: string
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-900 bg-emerald-950/20 text-emerald-200'
      : tone === 'warning'
        ? 'border-amber-900 bg-amber-950/20 text-amber-200'
        : 'border-slate-800 bg-slate-900 text-white'

  return (
    <article className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </article>
  )
}

function LogEntryRow({ entry }: { entry: SystemErrorLogEntry }) {
  return (
    <details className="group border-b border-slate-800 bg-slate-950 last:border-b-0 open:bg-slate-950/80">
      <summary className="grid cursor-pointer gap-3 px-4 py-3 hover:bg-slate-900 md:grid-cols-[180px_120px_1fr]">
        <span className="text-xs text-slate-500">{formatLogDate(entry.timestamp)}</span>
        <span className="text-xs text-slate-400">
          {[entry.method, entry.status ? `HTTP ${entry.status}` : null].filter(Boolean).join(' / ') || 'Sistema'}
        </span>
        <span className="truncate text-sm font-medium text-red-200">{entry.message}</span>
      </summary>
      <div className="space-y-3 border-t border-slate-800 px-4 py-3">
        {entry.path && <p className="break-all text-xs text-slate-400">{entry.path}</p>}
        {entry.name && <p className="text-xs text-slate-500">Tipo: {entry.name}</p>}
        {entry.userId && <p className="text-xs text-slate-500">Usuario: {entry.userId}</p>}
        {entry.stack && (
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-slate-900 p-2 text-xs text-slate-400">{entry.stack}</pre>
        )}
      </div>
    </details>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatLogDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}
