import { InfoItem } from './InfoItem'
import { SocialLinks } from './SocialLinks'

export function LandingDetails() {
  return (
    <section className="relative z-10 border-y border-slate-800/80 bg-slate-950/85 px-5 py-12 backdrop-blur sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)_minmax(140px,180px)]">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
            Contacto
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Canales de soporte</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Correo" value="andreslasso250@gmail.com" />
            <InfoItem label="Telefono" value="****" />
            <InfoItem label="Horario" value="24/7" />
            <InfoItem label="Ubicacion" value="Pasto/Nariño" />
          </div>
        </div>

        <div className="border-l border-slate-800 pl-0 lg:pl-8">
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
            Informacion basica
          </p>
          <dl className="mt-5 space-y-4">
            <InfoItem label="Responsable" value="Andres L." />
            <InfoItem label="Area" value="TI" />
            <InfoItem label="Version" value="Beta 1.0.1" />
          </dl>
        </div>

        <SocialLinks />
      </div>
    </section>
  )
}
