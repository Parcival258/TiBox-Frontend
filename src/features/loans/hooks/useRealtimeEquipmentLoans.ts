import { useEffect, useRef } from 'react'
import { createRealtimeSocket, getRealtimeToken } from '@/shared/services/realtime'
import type { EquipmentLoan } from '../types'

type EquipmentLoanRealtimeEvent = 'approved' | 'created' | 'rejected' | 'requested' | 'returned'

type EquipmentLoanUpdatedPayload = {
  event: EquipmentLoanRealtimeEvent
  loan: EquipmentLoan
}

type UseRealtimeEquipmentLoansOptions = {
  enabled: boolean
  onRefresh: () => Promise<unknown>
  onUpsert: (loan: EquipmentLoan) => void
  showSuccess: (message: string, subText?: string) => void
  userId: string | null
}

function notificationFor(event: EquipmentLoanRealtimeEvent, loan: EquipmentLoan) {
  if (event === 'approved') {
    return {
      message: 'Solicitud aprobada',
      subText: loan.equipment
        ? `Se asigno ${loan.equipment.internalCode} para ${loan.requestedItem}.`
        : `Se aprobo la solicitud de ${loan.requestedItem}.`,
    }
  }

  if (event === 'rejected') {
    return {
      message: 'Solicitud rechazada',
      subText: loan.rejectionReason ?? `No se aprobo la solicitud de ${loan.requestedItem}.`,
    }
  }

  if (event === 'returned') {
    return {
      message: 'Prestamo cerrado',
      subText: `Se registro la devolucion de ${loan.requestedItem}.`,
    }
  }

  return null
}

export function useRealtimeEquipmentLoans({
  enabled,
  onRefresh,
  onUpsert,
  showSuccess,
  userId,
}: UseRealtimeEquipmentLoansOptions) {
  const callbacksRef = useRef({ onRefresh, onUpsert, showSuccess })

  useEffect(() => {
    callbacksRef.current = { onRefresh, onUpsert, showSuccess }
  }, [onRefresh, onUpsert, showSuccess])

  useEffect(() => {
    if (!enabled || !userId) {
      return undefined
    }

    let isActive = true
    let socket: ReturnType<typeof createRealtimeSocket> | null = null

    getRealtimeToken()
      .then(({ token }) => {
        if (!isActive) {
          return
        }

        socket = createRealtimeSocket(token)
        socket.on('equipment_loans:updated', (payload: EquipmentLoanUpdatedPayload) => {
          callbacksRef.current.onUpsert(payload.loan)
          callbacksRef.current.onRefresh().catch(() => undefined)

          if (payload.loan.user?.id === userId) {
            const notification = notificationFor(payload.event, payload.loan)
            if (notification) {
              callbacksRef.current.showSuccess(notification.message, notification.subText)
            }
          }
        })
      })
      .catch(() => undefined)

    return () => {
      isActive = false
      socket?.disconnect()
    }
  }, [enabled, userId])
}
