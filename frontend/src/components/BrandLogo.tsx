type BrandLogoProps = {
  size?: "sm" | "md" | "lg"
  theme?: "dark" | "light"
  className?: string
}

const SIZE_MAP = {
  sm: { title: "text-base", glow: "blur-lg", shadow: "0 10px 30px rgba(167,139,250,0.25)" },
  md: { title: "text-lg", glow: "blur-xl", shadow: "0 12px 34px rgba(167,139,250,0.26)" },
  lg: { title: "text-2xl", glow: "blur-2xl", shadow: "0 14px 38px rgba(167,139,250,0.28)" },
} as const

export default function BrandLogo({ size = "md", theme = "light", className = "" }: BrandLogoProps) {
  const palette = SIZE_MAP[size]
  const titleColor = theme === "dark" ? "text-white" : "text-slate-900"
  const glowGradient = theme === "dark"
    ? "from-violet-400/40 via-sky-400/35 to-emerald-300/35"
    : "from-violet-300/60 via-sky-300/55 to-emerald-200/55"

  return (
    <div className={`relative inline-flex items-center ${className}`.trim()}>
      <div className={`absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 rounded-full bg-gradient-to-r ${glowGradient} ${palette.glow} opacity-90`} />
      <div className={`relative font-extrabold tracking-tight ${palette.title} ${titleColor}`} style={{ textShadow: palette.shadow }}>
        AI Project Mentor
      </div>
    </div>
  )
}