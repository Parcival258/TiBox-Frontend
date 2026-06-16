type TimelineItem = {
  date: string
  detail: string
  id: string
  title: string
}

type LifeSheetTimelineProps = {
  emptyText: string
  items: TimelineItem[]
  title: string
}

export function LifeSheetTimeline({ emptyText, items, title }: LifeSheetTimelineProps) {
  return (
    <section className="border-t border-slate-800 pt-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-md border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-100">{item.title}</p>
                <span className="shrink-0 text-xs text-slate-500">{item.date}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
