import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { projectsApi } from "../lib/api"
import type { Project } from "../lib/api"
import BrandLogo from "../components/BrandLogo"
import { useAuthStore } from "../store/authStore"

const LEVEL_STYLE: Record<string, string> = {
  junior: "text-emerald-500",
  mid: "text-amber-500",
  advanced: "text-rose-500",
}

const ACCENT_GRADIENTS = [
  "from-violet-500 to-sky-500",
  "from-sky-500 to-emerald-500",
  "from-rose-500 to-amber-500",
  "from-amber-500 to-violet-500",
  "from-emerald-500 to-sky-500",
]

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const totalTasks = project.tasks?.length ?? 0
  const doneTasks = project.tasks?.filter((t) => t.completed).length ?? 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const accent = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length]
  const createdDate = new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const phaseCount = project.roadmap?.length ?? 0

  const rowRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rowRef} className="group relative py-5">
      {/* Accent line — grows in on scroll */}
      <div
        className={`absolute left-0 top-5 bottom-5 w-[3px] rounded-full bg-gradient-to-b ${accent} group-hover:opacity-100 transition-all duration-[1400ms] ease-out`}
        style={{
          opacity: visible ? 0.6 : 0,
          transform: visible ? 'scaleY(1)' : 'scaleY(0)',
          transformOrigin: 'top',
        }}
      />

      <div className="pl-6">
        {/* Top row: number + level + domain + phases + date + delete */}
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-[11px] font-bold tracking-[0.24em] text-slate-400">{String(index + 1).padStart(2, "0")}</span>
          <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${LEVEL_STYLE[project.level] ?? "text-slate-500"}`}>
            {project.level}
          </span>
          {project.domain && (
            <span className="text-[11px] text-slate-500 font-medium">· {project.domain}</span>
          )}
          {phaseCount > 0 && (
            <span className="text-[11px] text-slate-500">{phaseCount} phases</span>
          )}
          <span className="text-[11px] text-slate-400 ml-auto">{createdDate}</span>
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`} className="block mb-1.5 group/title">
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover/title:text-violet-600 transition leading-snug">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed max-w-xl mb-3 line-clamp-2">{project.description}</p>

        {/* Tech + progress row */}
        <div className="flex items-center gap-3 flex-wrap">
          {project.technologies?.length > 0 && (
            <div className="flex items-center gap-1.5">
              {project.technologies.slice(0, 3).map((tech) => (
                <span key={tech} className="text-[11px] font-semibold text-slate-500 tracking-wide">
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-[11px] text-slate-400">+{project.technologies.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            <span className="text-[11px] text-slate-500 font-medium">{doneTasks}/{totalTasks}</span>
            <div className="w-20 bg-slate-200 rounded-full h-1.5">
              <div
                className={`bg-gradient-to-r ${accent} h-1.5 rounded-full transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-600">{progress}%</span>
          </div>
        </div>

        {/* View link */}
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-violet-500 hover:text-violet-700 transition-all duration-200 group-hover:translate-x-1 group-hover:tracking-wide"
        >
          View roadmap
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const email = useAuthStore((s) => s.email)
  const fullName = useAuthStore((s) => s.fullName)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const { data: projects, isLoading, isError } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list })

  return (
    <div className="min-h-screen bg-[#faf9ff] relative overflow-hidden text-slate-900">
      <div className="pointer-events-none">
        <div className="glow-orb w-[34rem] h-[34rem] bg-violet-300/70 -top-36 -right-36" />
        <div className="glow-orb w-[28rem] h-[28rem] bg-sky-300/60 bottom-0 -left-24" />
        <div className="glow-orb w-[18rem] h-[18rem] bg-rose-300/35 top-1/2 right-1/3" />
      </div>

      <nav className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/80 px-6 py-4 flex items-center justify-between sticky top-0">
        <Link to="/" className="inline-flex items-center">
          <BrandLogo size="sm" theme="light" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-xs text-slate-500 hidden sm:block font-medium hover:text-violet-600 transition">Hi, {fullName || email}</Link>
          <button onClick={() => { logout(); navigate("/login") }} className="text-xs text-rose-400 hover:text-rose-600 font-semibold transition">Log out</button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Your Projects</h1>
            <p className="text-slate-500 text-sm mt-0.5">Track your AI-generated learning roadmaps</p>
          </div>
          <Link to="/generate" className="bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 hover:from-violet-500 hover:via-sky-400 hover:to-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-600/30 transition">
            + New project
          </Link>
        </div>

        {isLoading && <div className="text-center py-24 text-slate-400">Loading</div>}
        {isError && <div className="text-center py-24 text-rose-500">Failed to load projects.</div>}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 via-sky-500/20 to-emerald-500/20 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-sm shadow-violet-950/30">
              ✦
            </div>
            <p className="text-slate-900 font-bold text-lg mb-1">No projects yet!</p>
            <p className="text-slate-500 text-sm mb-6">Generate your first AI-powered project idea</p>
            <Link to="/generate" className="inline-block bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 hover:from-violet-500 hover:via-sky-400 hover:to-emerald-400 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-violet-600/30 transition">
              Generate a project →
            </Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="divide-y divide-slate-100">
            {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}
      </main>
    </div>
  )
}
