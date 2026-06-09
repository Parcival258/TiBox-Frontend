import { useEffect, useRef } from 'react'
import { createRealtimeSocket, getRealtimeToken } from '../services/realtime'
import type { Alert } from '../types/inventory'

type AlertRealtimeEvent =
  | 'alerts:assigned'
  | 'alerts:created'
  | 'alerts:dismissed'
  | 'alerts:note_added'
  | 'alerts:resolved'
  | 'alerts:updated'

type AlertRealtimePayload = {
  alert: Alert
  event: AlertRealtimeEvent
}

type UseRealtimeAlertsOptions = {
  canHandleFailureQueue: boolean
  canManageAlerts: boolean
  canTrackReportedTickets: boolean
  canViewAlerts: boolean
  enabled: boolean
  onDashboardRefresh: () => Promise<unknown>
  onNotify: (notification: {
    subText?: string
    title: string
    type: 'alert' | 'ticket' | 'system'
  }) => void
  onRefresh: () => Promise<unknown>
  onTicketRefresh: () => Promise<unknown>
  showSuccess: (message: string, subText?: string) => void
  userId: string | null
}

const alertEvents: AlertRealtimeEvent[] = [
  'alerts:assigned',
  'alerts:created',
  'alerts:dismissed',
  'alerts:note_added',
  'alerts:resolved',
  'alerts:updated',
]

export function useRealtimeAlerts({
  canHandleFailureQueue,
  canManageAlerts,
  canTrackReportedTickets,
  canViewAlerts,
  enabled,
  onDashboardRefresh,
  onNotify,
  onRefresh,
  onTicketRefresh,
  showSuccess,
  userId,
}: UseRealtimeAlertsOptions) {
  const callbacksRef = useRef({
    onDashboardRefresh,
    onNotify,
    onRefresh,
    onTicketRefresh,
    showSuccess,
  })

  useEffect(() => {
    callbacksRef.current = {
      onDashboardRefresh,
      onNotify,
      onRefresh,
      onTicketRefresh,
      showSuccess,
    }
  }, [onDashboardRefresh, onNotify, onRefresh, onTicketRefresh, showSuccess])

  useEffect(() => {
    if (!enabled || !userId) {
      return
    }

    let isActive = true
    let socket: ReturnType<typeof createRealtimeSocket> | null = null

    getRealtimeToken()
      .then(({ token }) => {
        if (!isActive) {
          return
        }

        socket = createRealtimeSocket(token)

        alertEvents.forEach((eventName) => {
          socket?.on(eventName, (payload: AlertRealtimePayload) => {
            const isAssignedToCurrentUser = payload.alert.assignedTo === userId
            const isUnassignedFailure =
              payload.alert.type === 'damaged_equipment_reported' && !payload.alert.assignedTo
            const isReportedByCurrentUser = payload.alert.metadata?.reportedBy === userId
            const isRelevant =
              canManageAlerts ||
              isAssignedToCurrentUser ||
              (canHandleFailureQueue && isUnassignedFailure) ||
              (canTrackReportedTickets && isReportedByCurrentUser)

            if (!isRelevant) {
              return
            }

            if (isReportedByCurrentUser) {
              notifyReporter(payload)
              callbacksRef.current.onTicketRefresh().catch(() => undefined)
              return
            }

            if (
              payload.event === 'alerts:created' &&
              (isAssignedToCurrentUser || isUnassignedFailure)
            ) {
              callbacksRef.current.onNotify({
                subText: payload.alert.message,
                title: payload.alert.title,
                type: 'alert',
              })
              callbacksRef.current.showSuccess(payload.alert.title, payload.alert.message)
            }

            if (payload.event === 'alerts:assigned' && isAssignedToCurrentUser) {
              callbacksRef.current.onNotify({
                subText: payload.alert.title,
                title: 'Alerta asignada',
                type: 'alert',
              })
              callbacksRef.current.showSuccess('Alerta asignada', payload.alert.title)
            }

            if (canViewAlerts) {
              callbacksRef.current.onRefresh().catch(() => undefined)
            }
            callbacksRef.current.onDashboardRefresh().catch(() => undefined)
          })
        })
      })
      .catch(() => undefined)

    return () => {
      isActive = false
      socket?.disconnect()
    }
  }, [
    canHandleFailureQueue,
    canManageAlerts,
    canTrackReportedTickets,
    canViewAlerts,
    enabled,
    userId,
  ])

  function notifyReporter(payload: AlertRealtimePayload) {
    if (payload.event === 'alerts:assigned') {
      callbacksRef.current.onNotify({
        subText: 'El equipo tecnico ya esta atendiendo la falla.',
        title: 'Tu reporte fue tomado',
        type: 'ticket',
      })
      callbacksRef.current.showSuccess(
        'Tu reporte fue tomado',
        'El equipo tecnico ya esta atendiendo la falla.'
      )
      return
    }

    if (payload.event === 'alerts:resolved') {
      callbacksRef.current.onNotify({
        subText: payload.alert.title,
        title: 'Tu reporte fue resuelto',
        type: 'ticket',
      })
      callbacksRef.current.showSuccess('Tu reporte fue resuelto', payload.alert.title)
      return
    }

    if (payload.event === 'alerts:note_added') {
      callbacksRef.current.onNotify({
        subText: payload.alert.title,
        title: 'Tu reporte tiene una nota nueva',
        type: 'ticket',
      })
      callbacksRef.current.showSuccess('Tu reporte tiene una nota nueva', payload.alert.title)
      return
    }

    if (payload.event === 'alerts:dismissed') {
      callbacksRef.current.onNotify({
        subText: payload.alert.title,
        title: 'Tu reporte fue cerrado en notificaciones',
        type: 'ticket',
      })
      callbacksRef.current.showSuccess('Tu reporte fue cerrado en notificaciones', payload.alert.title)
    }
  }
}
