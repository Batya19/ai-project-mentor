type BrandLogoProps = {
  size?: "sm" | "md" | "lg"
  theme?: "dark" | "light"
  className?: string
}

const SIZE_MAP = {
  sm: { icon: 18, title: "text-base", gap: "gap-2" },
  md: { icon: 22, title: "text-lg", gap: "gap-2.5" },
  lg: { icon: 28, title: "text-2xl", gap: "gap-3" },
} as const

export default function BrandLogo({ size = "md", theme = "light", className = "" }: BrandLogoProps) {
  const palette = SIZE_MAP[size]
  const titleColor = theme === "dark" ? "text-white" : "text-slate-900"

  return (
    <div className={`relative inline-flex items-center ${palette.gap} ${className}`.trim()}>
      {/* Icon mark */}
      <div className="relative flex-shrink-0" style={{ width: palette.icon, height: palette.icon }}>
        <svg width={palette.icon} height={palette.icon} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          {/* Rounded square bg */}
          <rect width="28" height="28" rx="8" fill="url(#bg-grad)" />
          {/* Flowing S-curves */}
          <path d="M7 9c3 0 4.5 2.5 7 2.5S18 9 21 9" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          <path d="M7 14c3 0 4.5 2.5 7 2.5S18 14 21 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
          <path d="M7 19c3 0 4.5 2.5 7 2.5S18 19 21 19" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        </svg>
      </div>
      {/* Wordmark */}
      <span
        className={`font-extrabold tracking-tight ${palette.title} ${titleColor}`}
        style={{
          background: theme === "dark"
            ? "linear-gradient(90deg, #fff 0%, #bae6fd 100%)"
            : "linear-gradient(90deg, #1e1b4b 0%, #4c1d95 50%, #0369a1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Build<span style={{ fontWeight: 800 }}>Flow</span>
      </span>
    </div>
  )
}