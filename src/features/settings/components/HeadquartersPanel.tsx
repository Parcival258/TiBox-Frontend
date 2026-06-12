import type { Headquarter } from '@/shared/types/inventory'

type HeadquartersPanelProps = {
  headquarters: Headquarter[]
}

export function HeadquartersPanel({ headquarters }: HeadquartersPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-base font-medium text-white">Sedes</h2>
      </div>
      <div className="divide-y divide-slate-800">
        {headquarters.map((headquarter) => (
          <div key={headquarter.id} className="px-4 py-4">
            <p className="font-medium text-white">{headquarter.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              {[headquarter.city, headquarter.address].filter(Boolean).join(' - ') ||
                'Sin dirección'}
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}
