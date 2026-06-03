import heroImage from '../assets/hero.png'
import { LandingDetails } from './landing/LandingDetails'
import { LandingFooter } from './landing/LandingFooter'
import { LandingHero } from './landing/LandingHero'
import { StarryBackdrop } from './StarryBackdrop'

type LandingPageProps = {
  onEnter: () => void
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <StarryBackdrop />
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        src={heroImage}
        alt=""
      />
      <div className="absolute inset-0 bg-slate-950/70" />

      <LandingHero onEnter={onEnter} />
      <LandingDetails />
      <LandingFooter />
    </main>
  )
}
