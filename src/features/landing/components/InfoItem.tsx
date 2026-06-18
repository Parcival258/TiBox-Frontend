type InfoItemProps = {
  label: string
  value: string
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-300">{value}</dd>
    </div>
  )
}
