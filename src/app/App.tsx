import { AuthenticatedApp } from './AuthenticatedApp'
import { LoginPanel, useSession } from '@/features/auth'
import { LandingPage } from '@/features/landing'
import { LoginLoader } from '@/shared/ui'

export default function App() {
  const session = useSession()

  if (session.status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-sm text-slate-300">
        <LoginLoader label="Validando sesion..." />
      </main>
    )
  }

  if (session.status === 'guest' || session.status === 'submitting') {
    if (!session.showLogin) {
      return <LandingPage onEnter={session.openLogin} />
    }

    return (
      <LoginPanel
        error={session.loginError}
        isSubmitting={session.status === 'submitting'}
        onSubmit={session.signIn}
      />
    )
  }

  return <AuthenticatedApp authStatus={session.status} onLogout={session.signOut} user={session.user} />
}
