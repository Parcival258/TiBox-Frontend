type DashboardHeaderProps = {
  status: 'loading' | 'ready' | 'error'
}

const statusLabel = {
  loading: 'Cargando datos',
  ready: 'Backend conectado',
  error: 'No se pudo conectar al backend',
}

export function DashboardHeader({ status }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
          Inventario TI
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
      </div>
      <div className="rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
        {statusLabel[status]}
      </div>
    </header>
  )
}
