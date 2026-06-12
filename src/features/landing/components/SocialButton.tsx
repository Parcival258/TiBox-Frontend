import type { ReactNode } from 'react'

type SocialButtonProps = {
  children: ReactNode
  href: string
  label: string
  variant: 'github' | 'linkedin'
}

export function SocialButton({ children, href, label, variant }: SocialButtonProps) {
  const variantClass =
    variant === 'github'
      ? 'bg-gradient-to-r from-gray-800 to-black hover:from-[#14253f] hover:to-[#14253f]'
      : 'bg-[#0077b5] hover:bg-[#14253f]'

  return (
    <a
      className={`group relative flex justify-center rounded-md p-2 font-semibold text-white drop-shadow-xl transition-all duration-500 hover:-translate-y-3 hover:rounded-[50%] ${variantClass}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
    >
      {children}
      <span className="absolute opacity-0 duration-700 group-hover:-translate-y-10 group-hover:text-sm group-hover:text-gray-300 group-hover:opacity-100">
        {label}
      </span>
    </a>
  )
}
