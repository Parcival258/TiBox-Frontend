import type { InterfaceDensity, ThemeMode, UserPreferences } from '../types/ui'
import type { ReactNode } from 'react'

type ConfigurationPageProps = {
  notificationsCount: number
  preferences: UserPreferences
  onChange: (changes: Partial<UserPreferences>) => void
  onClearNotifications: () => void
}

export function ConfigurationPage({
  notificationsCount,
  preferences,
  onChange,
  onClearNotifications,
}: ConfigurationPageProps) {
  return (
    <section className="flex-1 space-y-5">
      <header>
        <p className="text-xs uppercase tracking-wide text-cyan-300">Configuracion</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Preferencias personales</h2>
        <p className="mt-1 text-sm text-slate-400">Estos ajustes se guardan solo para tu usuario.</p>
      </header>

      <SettingsCard title="Apariencia" description="Personaliza colores, espacios y movimiento.">
        <div className="grid gap-4 sm:grid-cols-2">
          <ThemeOption checked={preferences.theme === 'dark'} label="Modo oscuro" preview="dark" onClick={() => onChange({ theme: 'dark' })} />
          <ThemeOption checked={preferences.theme === 'light'} label="Modo claro" preview="light" onClick={() => onChange({ theme: 'light' })} />
        </div>

        <SettingRow label="Densidad" description="Controla el espacio entre los elementos de la interfaz.">
          <select className="settings-select" value={preferences.density} onChange={(event) => onChange({ density: event.target.value as InterfaceDensity })}>
            <option value="compact">Compacta</option>
            <option value="comfortable">Comoda</option>
            <option value="spacious">Amplia</option>
          </select>
        </SettingRow>

        <SettingRow label="Reducir animaciones" description="Desactiva movimientos y transiciones decorativas.">
          <Toggle checked={preferences.reduceMotion} label="Reducir animaciones" onChange={(checked) => onChange({ reduceMotion: checked })} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Inventario" description="Define como se muestran inicialmente los equipos.">
        <SettingRow label="Registros por pagina" description="Cantidad predeterminada de equipos en cada pagina.">
          <select className="settings-select" value={preferences.equipmentPerPage} onChange={(event) => onChange({ equipmentPerPage: Number(event.target.value) as UserPreferences['equipmentPerPage'] })}>
            {[10, 25, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Notificaciones" description="Configura los avisos recibidos dentro de TIBOX.">
        <SettingRow label="Notificaciones internas" description="Muestra nuevos avisos en la campana del encabezado.">
          <Toggle checked={preferences.notificationsEnabled} label="Notificaciones internas" onChange={(checked) => onChange({ notificationsEnabled: checked })} />
        </SettingRow>
        <SettingRow label="Sonido de aviso" description="Reproduce un tono breve cuando llega una notificacion.">
          <Toggle checked={preferences.notificationSoundEnabled} disabled={!preferences.notificationsEnabled} label="Sonido de aviso" onChange={(checked) => onChange({ notificationSoundEnabled: checked })} />
        </SettingRow>
        <SettingRow label="Historial local" description={`${notificationsCount} notificacion${notificationsCount === 1 ? '' : 'es'} guardada${notificationsCount === 1 ? '' : 's'}.`}>
          <button className="rounded-md border border-rose-900 px-3 py-2 text-sm font-medium text-rose-300 transition hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-50" disabled={notificationsCount === 0} type="button" onClick={onClearNotifications}>Limpiar historial</button>
        </SettingRow>
      </SettingsCard>
    </section>
  )
}

function SettingsCard({ children, description, title }: { children: ReactNode; description: string; title: string }) {
  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <div className="divide-y divide-slate-800 px-5">{children}</div>
    </div>
  )
}

function SettingRow({ children, description, label }: { children: ReactNode; description: string; label: string }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="font-medium text-white">{label}</p><p className="mt-1 text-sm text-slate-400">{description}</p></div>
      <div className="flex-none">{children}</div>
    </div>
  )
}

function Toggle({ checked, disabled, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="theme-toggle-switch" title={label}>
      <span className="sr-only">{label}</span>
      <input aria-label={label} checked={checked} className="theme-toggle-checkbox" disabled={disabled} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span className="theme-toggle-slider" aria-hidden="true" />
    </label>
  )
}

function ThemeOption({ checked, label, onClick, preview }: { checked: boolean; label: string; onClick: () => void; preview: ThemeMode }) {
  const isDark = preview === 'dark'
  return (
    <button aria-pressed={checked} className={`my-4 rounded-lg border p-4 text-left transition ${checked ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-700 hover:border-slate-500'}`} type="button" onClick={onClick}>
      <span className={`mb-3 block rounded-md border p-3 ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-slate-100'}`} aria-hidden="true">
        <span className={`mb-2 block h-2 w-2/3 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
        <span className={`block h-8 rounded ${isDark ? 'bg-slate-800' : 'bg-white'}`} />
      </span>
      <span className="flex items-center justify-between gap-3 font-semibold text-white"><span>{label}</span><span className={`h-5 w-5 rounded-full border-4 ${checked ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`} /></span>
    </button>
  )
}
