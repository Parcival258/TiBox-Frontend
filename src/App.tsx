import { useEffect, useState } from 'react'
import { DashboardHeader } from './components/DashboardHeader'
import { EquipmentTable } from './components/EquipmentTable'
import { HeadquartersPanel } from './components/HeadquartersPanel'
import { MetricGrid } from './components/MetricGrid'
import { emptyDashboard } from './constants/dashboard'
import { getDashboard, getEquipment, getHeadquarters } from './services/inventory'
import type { DashboardSummary, Equipment, Headquarter } from './types/inventory'
import './App.css'

type LoadState = 'loading' | 'ready' | 'error'

function App() {
  const [status, setStatus] = useState<LoadState>('loading')
  const [dashboard, setDashboard] = useState<DashboardSummary>(emptyDashboard)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([])

  useEffect(() => {
    Promise.all([getDashboard(), getEquipment(), getHeadquarters()])
      .then(([dashboardResponse, equipmentResponse, headquartersResponse]) => {
        setDashboard(dashboardResponse)
        setEquipment(equipmentResponse)
        setHeadquarters(headquartersResponse)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
        <DashboardHeader status={status} />
        <MetricGrid dashboard={dashboard} />

        <section className="grid flex-1 gap-6 lg:grid-cols-[1fr_320px]">
          <EquipmentTable equipment={equipment} />
          <HeadquartersPanel headquarters={headquarters} />
        </section>
      </div>
    </main>
  )
}

export default App
