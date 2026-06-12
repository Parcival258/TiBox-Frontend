type LandingHeroProps = {
  onEnter: () => void
}

export function LandingHero({ onEnter }: LandingHeroProps) {
  return (
    <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
        TIBOX
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
        Control simple para equipos, sedes y responsables.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
        Consulta el estado del inventario, revisa ubicaciones y manten visible la operación
        diaria.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          className="rounded-md bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          type="button"
          onClick={onEnter}
        >
          Entrar al sistema
        </button>
      </div>

      <div className="mt-16 grid max-w-3xl gap-3 sm:grid-cols-3">
        {['Equipos', 'Mantenimientos', 'Sedes'].map((item) => (
          <div key={item} className="border-t border-slate-700 pt-3 text-sm text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}
