import { type FormEvent, useState } from 'react'
import { LoginLoader } from './Loaders'
import { StarryBackdrop } from './StarryBackdrop'

type LoginPanelProps = {
  isSubmitting: boolean
  error: string | null
  onSubmit: (email: string, password: string) => void
}

export function LoginPanel({ isSubmitting, error, onSubmit }: LoginPanelProps) {
  const [email, setEmail] = useState('admin@inventario.local')
  const [password, setPassword] = useState('Admin12345')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(email, password)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 text-slate-100">
      <StarryBackdrop />
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-5">
          <LoginLoader label="Ingresando..." />
        </div>
      )}
      <form
        className="relative z-10 w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur"
        onSubmit={handleSubmit}
      >
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
          TIBOX
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Iniciar sesión</h1>

        <label className="mt-6 block text-sm text-slate-300" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label className="mt-4 block text-sm text-slate-300" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          className="mt-6 w-full rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}
