import { useState } from 'react'

export type ConfirmAction = {
  confirmLabel?: string
  message: string
  onConfirm: () => void
  title: string
}

export function useConfirmAction() {
  const [action, setAction] = useState<ConfirmAction | null>(null)

  function confirm() {
    const pendingAction = action
    setAction(null)
    pendingAction?.onConfirm()
  }

  return {
    action,
    cancel: () => setAction(null),
    confirm,
    request: setAction,
  }
}
