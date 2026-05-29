import { useEffect, useState } from 'react'
import { DashboardHeader } from './components/DashboardHeader'
import { EquipmentLifeSheet } from './components/EquipmentLifeSheet'
import { EquipmentTable } from './components/EquipmentTable'
import { HeadquartersPanel } from './components/HeadquartersPanel'
import { LandingPage } from './components/LandingPage'
import { LoginPanel } from './components/LoginPanel'
import { MetricGrid } from './components/MetricGrid'
import { emptyDashboard } from './constants/dashboard'
import { getCurrentUser, login, logout } from './services/auth'
import { getDashboard, getEquipment, getEquipmentLifeSheet, getHeadquarters } from './services/inventory'
import type {
  DashboardSummary,
  Equipment,
  EquipmentLifeSheet as EquipmentLifeSheetType,
  Headquarter,
  User,
} from './types/inventory'
import './App.css'

type LoadState = 'loading' | 'ready' | 'error'
type AuthState = 'checking' | 'authenticated' | 'guest' | 'submitting'
type LifeSheetState = 'idle' | 'loading' | 'ready' | 'error'

function App() {
  const [authStatus, setAuthStatus] = useState<AuthState>('checking')
  const [showLogin, setShowLogin] = useState(false)
  const [status, setStatus] = useState<LoadState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardSummary>(emptyDashboard)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)
  const [lifeSheet, setLifeSheet] = useState<EquipmentLifeSheetType | null>(null)
  const [lifeSheetStatus, setLifeSheetStatus] = useState<LifeSheetState>('idle')
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([])

  useEffect(() => {
    getCurrentUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        setAuthStatus('authenticated')
      })
      .catch(() => setAuthStatus('guest'))
  }, [])

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return
    }

    Promise.all([getDashboard(), getEquipment(), getHeadquarters()])
      .then(([dashboardResponse, equipmentResponse, headquartersResponse]) => {
        setDashboard(dashboardResponse)
        setEquipment(equipmentResponse)
        setHeadquarters(headquartersResponse)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [authStatus])

  useEffect(() => {
    if (!selectedEquipmentId || authStatus !== 'authenticated') {
      return
    }

    getEquipmentLifeSheet(selectedEquipmentId)
      .then((response) => {
        setLifeSheet(response)
        setLifeSheetStatus('ready')
      })
      .catch(() => {
        setLifeSheet(null)
        setLifeSheetStatus('error')
      })
  }, [authStatus, selectedEquipmentId])

  function handleSelectEquipment(equipmentId: string) {
    setSelectedEquipmentId(equipmentId)
    setLifeSheet(null)
    setLifeSheetStatus('loading')
  }

  function handleLogin(email: string, password: string) {
    setAuthStatus('submitting')
    setLoginError(null)

    login(email, password)
      .then(({ user: authenticatedUser }) => {
        setUser(authenticatedUser)
        setStatus('loading')
        setAuthStatus('authenticated')
      })
      .catch(() => {
        setLoginError('Credenciales inválidas o backend no disponible.')
        setAuthStatus('guest')
      })
  }

  function handleLogout() {
    logout().finally(() => {
      setUser(null)
      setDashboard(emptyDashboard)
      setEquipment([])
      setSelectedEquipmentId(null)
      setLifeSheet(null)
      setLifeSheetStatus('idle')
      setHeadquarters([])
      setStatus('loading')
      setShowLogin(false)
      setAuthStatus('guest')
    })
  }

  if (authStatus === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Validando sesión...
      </main>
    )
  }

  if (authStatus === 'guest' || authStatus === 'submitting') {
    if (!showLogin) {
      return <LandingPage onEnter={() => setShowLogin(true)} />
    }

    return (
      <LoginPanel
        error={loginError}
        isSubmitting={authStatus === 'submitting'}
        onSubmit={handleLogin}
      />
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
        <DashboardHeader
          status={status}
          userName={user?.name ?? 'Usuario'}
          onLogout={handleLogout}
        />
        <MetricGrid dashboard={dashboard} />

        <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <EquipmentTable
            equipment={equipment}
            selectedEquipmentId={selectedEquipmentId}
            onSelectEquipment={handleSelectEquipment}
          />
          <div className="space-y-6">
            <EquipmentLifeSheet lifeSheet={lifeSheet} status={lifeSheetStatus} />
            <HeadquartersPanel headquarters={headquarters} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
