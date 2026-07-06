import { AuthenticatedApp } from './AuthenticatedApp'
import { LoginPanel, useSession } from '@/features/auth'
import { LandingPage } from '@/features/landing'
import { LoginLoader } from '@/shared/ui'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/') {
    return <LandingPage onEnter={() => navigate('/login')} />
  }

  return <SessionRoutes />
}

function SessionRoutes() {
  const session = useSession()

  if (session.status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-sm text-slate-300">
        <LoginLoader label="Validando sesion..." />
      </main>
    )
  }

  if (session.status === 'guest' || session.status === 'submitting') {
    return (
      <Routes>
        <Route
          path="/login"
          element={(
            <LoginPanel
              error={session.loginError}
              isSubmitting={session.status === 'submitting'}
              onSubmit={session.signIn}
            />
          )}
        />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    )
  }

  return <AuthenticatedApp authStatus={session.status} onLogout={session.signOut} user={session.user} />
}
