import { useState, useEffect, useRef, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { projectsApi } from "../lib/api"
import type { Project, Task } from "../lib/api"
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

/* ── Helpers ─────────────────────────────────────────────────────────────── */

type ProjectStatus = "in-progress" | "not-started" | "completed"

function getProjectStatus(project: Project): ProjectStatus {
  const total = project.tasks?.length ?? 0
  const done = project.tasks?.filter((t) => t.completed).length ?? 0
  if (done === total && total > 0) return "completed"
  if (done > 0) return "in-progress"
  return "not-started"
}

function getActivePhaseInfo(project: Project) {
  const roadmap = project.roadmap ?? []
  for (let i = 0; i < roadmap.length; i++) {
    const phase = roadmap[i]
    const phaseTasks = project.tasks?.filter((t) => t.phase === phase.phase) ?? []
    const allDone = phaseTasks.length > 0 && phaseTasks.every((t) => t.completed)
    if (!allDone) return { index: i, phase, total: roadmap.length }
  }
  if (roadmap.length > 0) return { index: roadmap.length - 1, phase: roadmap[roadmap.length - 1], total: roadmap.length }
  return null
}

function getLastActive(project: Project): Date | null {
  const stamps = project.tasks?.filter((t) => t.completed_at).map((t) => new Date(t.completed_at!).getTime()) ?? []
  if (stamps.length === 0) return null
  return new Date(Math.max(...stamps))
}

function getNextTask(project: Project): Task | null {
  const info = getActivePhaseInfo(project)
  if (!info) return null
  return project.tasks?.find((t) => t.phase === info.phase.phase && !t.completed) ?? null
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return "Just now"
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
  const months = Math.floor(days / 30)
  return months <= 1 ? "1 month ago" : `${months} months ago`
}

function getHealth(project: Project): { label: string; color: string; dot: string } {
  const status = getProjectStatus(project)
  if (status === "completed") return { label: "Completed", color: "text-emerald-600", dot: "bg-emerald-500" }
  if (status === "not-started") return { label: "Not started", color: "text-slate-400", dot: "bg-slate-300" }
  const last = getLastActive(project)
  if (!last) return { label: "On track", color: "text-emerald-600", dot: "bg-emerald-500" }
  const daysSince = Math.floor((Date.now() - last.getTime()) / 86_400_000)
  if (daysSince > 7) return { label: "Stuck", color: "text-amber-600", dot: "bg-amber-500" }
  return { label: "On track", color: "text-emerald-600", dot: "bg-emerald-500" }
}

function sortByImportance(projects: Project[]): Project[] {
  const order: Record<ProjectStatus, number> = { "in-progress": 0, "not-started": 1, "completed": 2 }
  return [...projects].sort((a, b) => {
    const diff = order[getProjectStatus(a)] - order[getProjectStatus(b)]
    if (diff !== 0) return diff
    const ta = getLastActive(a)?.getTime() ?? new Date(a.updated_at).getTime()
    const tb = getLastActive(b)?.getTime() ?? new Date(b.updated_at).getTime()
    return tb - ta
  })
}

/* ── ProjectCard ─────────────────────────────────────────────────────────── */

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const totalTasks = project.tasks?.length ?? 0
  const doneTasks = project.tasks?.filter((t) => t.completed).length ?? 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const accent = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length]
  const phaseInfo = getActivePhaseInfo(project)
  const health = getHealth(project)
  const lastActive = getLastActive(project)
  const status = getProjectStatus(project)

  const rowRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rowRef} className="group relative py-5">
      <div
        className={`absolute left-0 top-5 bottom-5 w-[3px] rounded-full bg-gradient-to-b ${accent} group-hover:opacity-100 transition-all duration-[1400ms] ease-out`}
        style={{
          opacity: visible ? 0.6 : 0,
          transform: visible ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: "top",
        }}
      />

      <div className="pl-6">
        {/* Meta row */}
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span className="text-[11px] font-bold tracking-[0.24em] text-slate-400">{String(index + 1).padStart(2, "0")}</span>
          <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${LEVEL_STYLE[project.level] ?? "text-slate-500"}`}>
            {project.level}
          </span>
          {project.domain && <span className="text-[11px] text-slate-500 font-medium">· {project.domain}</span>}

          {/* Status pill */}
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
            <span className={`text-[11px] font-semibold ${health.color}`}>{health.label}</span>
          </span>

          {/* Phase indicator */}
          {phaseInfo && (
            <span className="text-[11px] text-slate-500 font-medium">
              Phase {phaseInfo.index + 1} of {phaseInfo.total}
            </span>
          )}

          {/* Last active */}
          <span className="text-[11px] text-slate-400 ml-auto">
            {lastActive ? `Active ${timeAgo(lastActive)}` : new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`} className="block mb-1.5 group/title">
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover/title:text-violet-600 transition leading-snug">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed max-w-xl mb-3 line-clamp-2">{project.description}</p>

        {/* Tech + progress */}
        <div className="flex items-center gap-3 flex-wrap">
          {project.technologies?.length > 0 && (
            <div className="flex items-center gap-1.5">
              {project.technologies.slice(0, 3).map((tech) => (
                <span key={tech} className="text-[11px] font-semibold text-slate-500 tracking-wide">{tech}</span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-[11px] text-slate-400">+{project.technologies.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            <span className="text-[11px] text-slate-500 font-medium">{doneTasks}/{totalTasks}</span>
            <div className="w-20 bg-slate-200 rounded-full h-1.5">
              <div className={`bg-gradient-to-r ${accent} h-1.5 rounded-full transition-all`} style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[11px] font-bold text-slate-600">{progress}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3">
          {status !== "completed" ? (
            <Link
              to={`/projects/${project.id}`}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all duration-200 ${
                status === "in-progress"
                  ? "bg-gradient-to-r from-violet-600 to-sky-500 text-white shadow-violet-600/20 hover:shadow-violet-600/40 hover:from-violet-500 hover:to-sky-400"
                  : "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-slate-600/20 hover:shadow-slate-600/40 hover:from-slate-600 hover:to-slate-500"
              }`}
            >
              {status === "in-progress" ? "Continue Coding" : "Start First Phase"}
              <span>→</span>
            </Link>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">✓ Completed</span>
          )}
          <Link
            to={`/projects/${project.id}`}
            className="text-xs font-semibold text-slate-400 hover:text-violet-500 transition"
          >
            View roadmap
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── DashboardPage ───────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const email = useAuthStore((s) => s.email)
  const fullName = useAuthStore((s) => s.fullName)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const { data: projects, isLoading, isError } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list })

  const sorted = useMemo(() => (projects ? sortByImportance(projects) : []), [projects])

  // "Continue where you left off" — most recently active in-progress project
  const continueProject = useMemo(() => {
    return sorted.find((p) => getProjectStatus(p) === "in-progress") ?? null
  }, [sorted])

  const continuePhase = continueProject ? getActivePhaseInfo(continueProject) : null
  const continueNext = continueProject ? getNextTask(continueProject) : null

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

        {/* ── Action Center ──────────────────────────────────────────── */}
        {continueProject && (
          <div className="mb-10 relative rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-sky-500" />

            <div className="px-6 py-5">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">
                Continue where you left off
              </p>

              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-slate-900 truncate mb-1">
                    {continueProject.title}
                  </h3>
                  {continuePhase && (
                    <p className="text-sm text-slate-600 font-medium">
                      {/^phase\s+\d/i.test(continuePhase.phase.phase) ? continuePhase.phase.phase : `Phase ${continuePhase.index + 1}: ${continuePhase.phase.phase}`}
                    </p>
                  )}
                  {continueNext && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Next task: {continueNext.name}
                    </p>
                  )}
                </div>

                <Link
                  to={`/projects/${continueProject.id}`}
                  className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 transition"
                >
                  Continue →
                </Link>
              </div>
            </div>
          </div>
        )}

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

        {sorted.length > 0 && (
          <div className="divide-y divide-slate-100">
            {sorted.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}
      </main>
    </div>
  )
}
