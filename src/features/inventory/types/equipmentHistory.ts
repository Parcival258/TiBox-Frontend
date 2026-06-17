export type TechnicalHistoryItem = {
  id: string
  sourceId: string
  type:
    | 'maintenance_record'
    | 'maintenance_schedule'
    | 'failure_report'
    | 'equipment_assignment'
    | 'equipment_loan'
  date: string
  title: string
  detail: string | null
  status: string
  priority: string | null
}
