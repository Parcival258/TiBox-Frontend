type LoanMetricProps = {
  label: string
  value: number
}

export function LoanMetric({ label, value }: LoanMetricProps) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
