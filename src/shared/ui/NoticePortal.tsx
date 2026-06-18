import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

type NoticePortalProps = {
  children: ReactNode
}

export function NoticePortal({ children }: NoticePortalProps) {
  return createPortal(children, document.body)
}
