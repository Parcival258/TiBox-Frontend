import { useEffect, useState } from 'react'
import { getCurrentUser, login, logout } from '@/features/auth/services/authService'
import type { User } from '@/features/users/types'
import type { AuthState } from '@/shared/types/ui'

export function useSession() {
  const [status, setStatus] = useState<AuthState>('checking')
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => setStatus('guest'))
  }, [])

  function signIn(email: string, password: string) {
    setStatus('submitting')
    setLoginError(null)

    return login(email, password)
      .then(({ user: authenticatedUser }) => {
        setUser(authenticatedUser)
        setStatus('authenticated')
      })
      .catch(() => {
        setLoginError('Credenciales invalidas o backend no disponible.')
        setStatus('guest')
      })
  }

  function signOut() {
    return logout().finally(() => {
      setUser(null)
      setStatus('guest')
    })
  }

  return {
    loginError,
    signIn,
    signOut,
    status,
    user,
  }
}
