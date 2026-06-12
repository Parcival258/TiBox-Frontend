import { useState } from 'react'

type SuccessNoticeState = {
  message: string
  subText?: string
} | null

export function useSuccessNotice() {
  const [successNotice, setSuccessNotice] = useState<SuccessNoticeState>(null)

  function showSuccess(message: string, subText?: string) {
    setSuccessNotice({ message, subText })
    window.setTimeout(() => setSuccessNotice(null), 2400)
  }

  return {
    clearSuccess: () => setSuccessNotice(null),
    showSuccess,
    successNotice,
  }
}
