import type { CatalogItem } from '@/features/maintenance/types'

export type Alert = {
  id: string
  type: string
  severity: string
  severityLabel: string
  status: string
  statusLabel: string
  title: string
  message: string
  entityType: string
  entityId: string
  equipmentId: string | null
  assignedTo: string | null
  channels: string[]
  metadata?: {
    notes?: Array<{
      createdAt: string
      note: string
      userId: string | null
    }>
    [key: string]: unknown
  } | null
  triggeredAt: string
  dueAt: string | null
  acknowledgedAt: string | null
  resolvedAt: string | null
  equipment?: {
    internalCode: string
    type: string
    brand: string | null
    model: string | null
  } | null
  assignee?: {
    name: string
    email?: string
  } | null
}

export type AlertCatalogs = {
  channels: CatalogItem[]
  severities: CatalogItem[]
  statuses: CatalogItem[]
  types: CatalogItem[]
}

export type AlertRunResult = {
  generated: number
  alerts: Alert[]
  deliveries: Array<{
    alertId: string
    channels: string[]
    emailReady: boolean
    internalReady: boolean
  }>
}
