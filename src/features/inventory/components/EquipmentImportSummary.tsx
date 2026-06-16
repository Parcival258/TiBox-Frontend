import type { EquipmentImportResult } from '@/features/inventory/utils/equipmentBulkImport'

type EquipmentImportSummaryProps = {
  result: EquipmentImportResult | null
}

export function EquipmentImportSummary({ result }: EquipmentImportSummaryProps) {
  if (!result) {
    return null
  }

  return (
    <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-3 text-sm">
      <p className="text-slate-300">
        Carga masiva: {result.created} creados de {result.total} filas validas.
      </p>
      {result.errors.length > 0 && (
        <details className="mt-2 text-amber-200">
          <summary className="cursor-pointer">Ver observaciones ({result.errors.length})</summary>
          <ul className="mt-2 space-y-1 text-xs text-amber-100">
            {result.errors.slice(0, 12).map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
