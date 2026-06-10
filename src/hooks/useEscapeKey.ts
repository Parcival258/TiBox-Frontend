import { useEffect } from 'react'

export function useEscapeKey(isEnabled: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!isEnabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEnabled, onEscape])
}
