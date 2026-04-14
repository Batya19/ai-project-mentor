import type { Project } from "../lib/api"

const VW = 760, VH = 310

const NODES = [
  { id: "client",   cx: 68,  cy: 155, hw: 54, hh: 30, label: "Browser",     sub: "Client",         color: "#94a3b8" },
  { id: "react",    cx: 242, cy: 155, hw: 65, hh: 30, label: "React / TS",  sub: "Frontend",        color: "#38bdf8" },
  { id: "fastapi",  cx: 442, cy: 155, hw: 68, hh: 30, label: "FastAPI",      sub: "Python · REST",  color: "#a78bfa" },
  { id: "groq",     cx: 652, cy: 75,  hw: 65, hh: 30, label: "Groq AI",     sub: "llama-3.3-70b",  color: "#f472b6" },
  { id: "postgres", cx: 652, cy: 235, hw: 68, hh: 30, label: "PostgreSQL",   sub: "Database",       color: "#34d399" },
]

// paths connect box edges, not centres
const EDGES = [
  { d: "M 122,155 L 175,155",                       color: "#38bdf8", label: "HTTP · fetch",   lx: 148, ly: 144, dur: "1.6s" },
  { d: "M 307,155 L 372,155",                       color: "#a78bfa", label: "axios · JWT",    lx: 339, ly: 144, dur: "1.9s" },
  { d: "M 442,125 C 442,90 548,75  586,75",         color: "#f472b6", label: "Groq SDK",       lx: 497, ly: 86,  dur: "2.2s" },
  { d: "M 442,185 C 442,220 548,235 582,235",       color: "#34d399", label: "asyncpg · SQL",  lx: 497, ly: 253, dur: "2.0s" },
]

function glowId(c: string) { return `gw${c.replace("#", "")}` }
function arrId(c: string)  { return `ar${c.replace("#", "")}` }

export default function ArchitectView({ project }: { project: Project }) {
  const totalHours = project.tasks.reduce((s, t) => s + (t.estimated_hours ?? 0), 0)

  const steps = [
    { icon: "01", title: "Parsed request",      sub: `${project.level} · ${project.technologies.slice(0, 2).join(", ")}` },
    { icon: "02", title: "Chose architecture",  sub: `REST API + ${project.technologies.find(t => /postgres|sql|db/i.test(t)) ?? "PostgreSQL"}` },
    { icon: "03", title: "Generated roadmap",   sub: `${project.roadmap.length} phases` },
    { icon: "04", title: "Estimated timeline",  sub: `${project.tasks.length} tasks · ~${totalHours}h` },
  ]

  const uniqueColors = [...new Set([...EDGES.map(e => e.color), ...NODES.map(n => n.color)])]

  return (
    <div className="space-y-4">

      {/* ── Diagram ── */}
      <div className="relative">
        {/* outer glow aura */}
        <div className="absolute -inset-3 bg-gradient-to-br from-violet-300/45 via-sky-300/28 to-emerald-300/38 blur-2xl rounded-3xl pointer-events-none" />

        <div className="relative bg-white/72 border border-white/80 rounded-2xl overflow-hidden shadow-xl shadow-violet-100/70">
          {/* title bar */}
          <div className="flex items-center gap-2 px-5 pt-3 pb-2.5 border-b border-white/70 font-mono text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            architecture · data-flow · {project.title}
          </div>

          <div className="px-3 py-3">
            <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ maxHeight: 320 }}>
              <defs>
                {/* per-colour SVG glow */}
                {uniqueColors.map(c => (
                  <filter key={c} id={glowId(c)} x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                ))}

                {/* per-colour arrowheads */}
                {EDGES.map(e => (
                  <marker key={e.color} id={arrId(e.color)}
                    markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill={e.color} />
                  </marker>
                ))}

                {/* subtle dot grid */}
                <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
                  <circle cx="18" cy="18" r="1" fill="rgba(255,255,255,0.055)" />
                </pattern>
              </defs>

              {/* grid bg */}
              <rect width={VW} height={VH} fill="url(#dots)" />

              {/* ── EDGES ── */}
              {EDGES.map((e, i) => (
                <g key={i}>
                  {/* faint track */}
                  <path d={e.d} stroke={e.color} strokeWidth="1.5" fill="none" opacity="0.18" />
                  {/* animated glow dots */}
                  <path d={e.d} stroke={e.color} strokeWidth="2.5" fill="none"
                    strokeDasharray="7 18"
                    filter={`url(#${glowId(e.color)})`}
                    markerEnd={`url(#${arrId(e.color)})`}>
                    <animate attributeName="stroke-dashoffset"
                      from="25" to="0" dur={e.dur} repeatCount="indefinite" />
                  </path>
                  {/* label — painted outline so it's always readable */}
                  <text x={e.lx} y={e.ly} textAnchor="middle" fontSize="10"
                    fontFamily="ui-monospace, monospace" fontWeight="600"
                    stroke="#ffffff" strokeWidth="3.5" paintOrder="stroke"
                    fill={e.color} opacity="0.9">
                    {e.label}
                  </text>
                </g>
              ))}

              {/* ── NODES ── */}
              {NODES.map(n => (
                <g key={n.id}>
                  {/* pulsing halo */}
                  <rect
                    x={n.cx - n.hw - 10} y={n.cy - n.hh - 10}
                    width={(n.hw + 10) * 2} height={(n.hh + 10) * 2}
                    rx="18" fill={n.color} opacity="0.1"
                    filter={`url(#${glowId(n.color)})`}>
                    <animate attributeName="opacity"
                      values="0.07;0.22;0.07" dur="2.8s" repeatCount="indefinite" />
                  </rect>
                  {/* box */}
                  <rect
                    x={n.cx - n.hw} y={n.cy - n.hh}
                    width={n.hw * 2} height={n.hh * 2}
                    rx="10" fill="rgba(255,255,255,0.88)"
                    stroke={n.color} strokeWidth="1.6"
                  />
                  {/* label */}
                  <text x={n.cx} y={n.cy - 3} textAnchor="middle"
                    fontSize="12.5" fontFamily="system-ui,sans-serif" fontWeight="700"
                    fill={n.color} filter={`url(#${glowId(n.color)})`}>
                    {n.label}
                  </text>
                  {/* sub */}
                  <text x={n.cx} y={n.cy + 13} textAnchor="middle"
                    fontSize="9.5" fontFamily="ui-monospace,monospace"
                    fill="rgba(71,85,105,0.72)">
                    {n.sub}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* ── AI Thought Steps ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((s, i) => (
          <div key={i}
            className="bg-white/72 border border-white/80 rounded-2xl p-4 backdrop-blur shadow-lg shadow-violet-100/60">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500/25 to-sky-500/25
                border border-white/80 text-slate-500 text-[10px] flex items-center justify-center font-bold font-mono">
                {s.icon}
              </span>
              <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">AI step</span>
            </div>
            <div className="text-slate-900 text-sm font-bold leading-snug">{s.title}</div>
            <div className="text-slate-500 text-xs mt-1 font-mono leading-relaxed">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
