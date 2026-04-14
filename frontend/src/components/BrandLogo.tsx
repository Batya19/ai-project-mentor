type BrandLogoProps = {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  theme?: "dark" | "light"
  className?: string
}

const SIZE_MAP = {
  sm: { icon: "h-8 w-8", title: "text-base", sub: "text-[10px]" },
  md: { icon: "h-10 w-10", title: "text-lg", sub: "text-[11px]" },
  lg: { icon: "h-12 w-12", title: "text-xl", sub: "text-xs" },
} as const

export default function BrandLogo({ size = "md", showText = true, theme = "dark", className = "" }: BrandLogoProps) {
  const palette = SIZE_MAP[size]
  const titleColor = theme === "dark" ? "text-white" : "text-slate-900"
  const subColor = theme === "dark" ? "text-white/35" : "text-slate-500"

  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <svg viewBox="0 0 64 64" aria-hidden="true" className={`${palette.icon} shrink-0`}>
        <defs>
          <linearGradient id="brand-bg" x1="10" y1="10" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="52%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="brand-link-a" x1="18" y1="20" x2="46" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="brand-link-b" x1="19" y1="21" x2="30" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="brand-link-c" x1="44" y1="21" x2="32" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="brand-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="32" cy="32" r="25" fill="url(#brand-bg)" opacity="0.22" filter="url(#brand-glow)" />
        <circle cx="32" cy="32" r="22" fill="#08070f" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />

        <path d="M23 21 L41 21" stroke="url(#brand-link-a)" strokeWidth="2.8" strokeLinecap="round" filter="url(#brand-glow)" />
        <path d="M23 21 L31 43" stroke="url(#brand-link-b)" strokeWidth="2.8" strokeLinecap="round" filter="url(#brand-glow)" />
        <path d="M41 21 L31 43" stroke="url(#brand-link-c)" strokeWidth="2.8" strokeLinecap="round" filter="url(#brand-glow)" />

        <circle cx="23" cy="21" r="4.5" fill="#a78bfa" filter="url(#brand-glow)" />
        <circle cx="41" cy="21" r="4.5" fill="#38bdf8" filter="url(#brand-glow)" />
        <circle cx="31" cy="43" r="4.75" fill="#34d399" filter="url(#brand-glow)" />

        <path d="M45 14 l3 -5 l1 4 l4 1 l-5 3 l-1 5 l-2 -4 l-4 -1 z" fill="#f9fafb" opacity="0.9" filter="url(#brand-glow)" />
      </svg>

      {showText && (
        <div className="leading-none">
          <div className={`font-extrabold tracking-tight ${palette.title} ${titleColor}`}>AI Project Mentor</div>
          <div className={`mt-1 font-mono uppercase tracking-[0.24em] ${palette.sub} ${subColor}`}>build bright systems</div>
        </div>
      )}
    </div>
  )
}