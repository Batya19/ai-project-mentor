import { useState, Fragment } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../lib/api"
import type { Project, Task } from "../lib/api"
import ArchitectView from "../components/ArchitectView"
import BrandLogo from "../components/BrandLogo"

const LEVEL_STYLE: Record<string, string> = {
  junior: "bg-emerald-100 text-emerald-700 border-emerald-200",
  mid: "bg-amber-100 text-amber-700 border-amber-200",
  advanced: "bg-rose-100 text-rose-700 border-rose-200",
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string, v: boolean) => void }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <label className="flex items-start gap-3 cursor-pointer w-full group">
        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded-lg border-2 flex items-center justify-center transition ${
          task.completed ? "bg-gradient-to-br from-violet-500 via-sky-400 to-emerald-400 border-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.45)]" : "border-slate-200 bg-white group-hover:border-sky-400"
        }`}>
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <input type="checkbox" checked={task.completed} onChange={(e) => onToggle(task.id, e.target.checked)} className="sr-only"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${task.completed ? "line-through text-slate-300" : "text-slate-800"}`}>{task.name}</p>
          {task.description && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>}
          {task.estimated_hours > 0 && (
            <span className="inline-block mt-1.5 text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-medium">~{task.estimated_hours}h</span>
          )}
        </div>
      </label>
    </li>
  )
}

const PHASE_COLORS = [
  { bg: "from-violet-100 to-white", border: "border-violet-200", num: "bg-gradient-to-br from-violet-500 to-purple-500" },
  { bg: "from-sky-100 to-white", border: "border-sky-200", num: "bg-gradient-to-br from-sky-500 to-cyan-500" },
  { bg: "from-rose-100 to-white", border: "border-rose-200", num: "bg-gradient-to-br from-rose-500 to-pink-500" },
  { bg: "from-amber-100 to-white", border: "border-amber-200", num: "bg-gradient-to-br from-amber-500 to-yellow-500" },
  { bg: "from-emerald-100 to-white", border: "border-emerald-200", num: "bg-gradient-to-br from-emerald-500 to-teal-500" },
]

function computeDailyStreak(tasks: Task[]): number {
  // Collect the local-date strings of each completed task.
  const completedDates = tasks
    .filter((t) => t.completed && t.completed_at)
    .map((t) => new Date(t.completed_at!).toLocaleDateString("en-CA")) // YYYY-MM-DD

  if (completedDates.length === 0) return 0

  // Unique days, sorted descending.
  const uniqueDays = [...new Set(completedDates)].sort().reverse()

  // Walk backward from today counting consecutive calendar days.
  const today = new Date().toLocaleDateString("en-CA")
  let streak = 0
  let expected = today

  for (const day of uniqueDays) {
    if (day === expected) {
      streak += 1
      // Move expected to the previous calendar day.
      const prev = new Date(expected)
      prev.setDate(prev.getDate() - 1)
      expected = prev.toLocaleDateString("en-CA")
    } else if (day < expected) {
      // Gap — streak is broken.
      break
    }
  }

  return streak
}

/** Number of tasks completed within the last 48 h (for per-phase vibe). */
function recentTaskCount(tasks: Task[]): number {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000
  return tasks.filter(
    (t) => t.completed && t.completed_at && new Date(t.completed_at).getTime() >= cutoff
  ).length
}

function buildMotivationMessage({
  totalTasks,
  completedPhases,
  totalPhases,
  dailyStreak,
  activePhaseName,
}: {
  totalTasks: number
  completedPhases: number
  totalPhases: number
  dailyStreak: number
  activePhaseName?: string
}) {
  if (totalTasks === 0) {
    return "No tasks yet. Regenerate the plan once the roadmap has real work to track."
  }

  if (completedPhases === totalPhases && totalPhases > 0) {
    return `All ${completedPhases} phases are closed. You finished the roadmap end to end.`
  }

  if (dailyStreak >= 7) {
    return `${dailyStreak}-day build streak. That kind of consistency is rare — keep the chain intact.`
  }

  if (dailyStreak >= 3) {
    return `${dailyStreak} days in a row with progress. Build streaks compound — do not break it today.`
  }

  if (completedPhases >= 2 && activePhaseName) {
    return `${completedPhases} phases closed. Keep the momentum into ${activePhaseName}.`
  }

  if (completedPhases === 1 && activePhaseName) {
    return `First phase locked. Push into ${activePhaseName} before the context fades.`
  }

  if (dailyStreak === 2) {
    return `2 days of progress in a row. One more makes it a real streak.`
  }

  if (dailyStreak === 1 && activePhaseName) {
    return `You shipped something today in ${activePhaseName}. Come back tomorrow to start a streak.`
  }

  if (activePhaseName) {
    return `No recent activity. Pick one task in ${activePhaseName} and start moving again.`
  }

  return "No recent activity. Pick any task and create the first day of a streak."
}

/* ── Zigzag node offsets for organic abstract roadmap ── */
const NODE_OFFSETS: Array<{ side: "left" | "right"; pad: string }> = [
  { side: "left",  pad: "pr-8 sm:pr-16 lg:pr-24" },
  { side: "right", pad: "pl-6 sm:pl-12 lg:pl-20" },
  { side: "left",  pad: "pr-12 sm:pr-24 lg:pr-36" },
  { side: "right", pad: "pl-10 sm:pl-20 lg:pl-28" },
  { side: "left",  pad: "pr-4 sm:pr-8 lg:pr-14" },
]

function PhaseAccordion({ index, phaseName, description, tasks, onToggle, state, side, skills, pitfall, tools }: {
  index: number; phaseName: string; description: string; tasks: Task[];
  onToggle: (id: string, v: boolean) => void; state: "done" | "active" | "locked";
  side: "left" | "right"; skills: string[]; pitfall: string; tools: string[]
}) {
  const [open, setOpen] = useState(state === "active")
  const done = tasks.filter((t) => t.completed).length
  const colors = PHASE_COLORS[index % PHASE_COLORS.length]
  const isRight = side === "right"

  return (
    <div className={`flex ${isRight ? "flex-row-reverse" : "flex-row"} items-start gap-3 sm:gap-4`}>
      {/* ── Node circle ── */}
      <div className="relative flex-shrink-0">
        <div className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-sm transition-all duration-500 ${
          state === "done"
            ? "bg-gradient-to-br from-emerald-400 to-teal-400 shadow-emerald-200"
            : state === "active"
              ? `${colors.num} shadow-lg ring-4 ring-white/80 scale-110`
              : "bg-slate-200 text-slate-400 shadow-none"
        }`}>
          {state === "done" ? "✓" : index + 1}
        </div>
        {state === "active" && (
          <div className={`absolute inset-0 rounded-2xl ${colors.num} opacity-25 blur-lg animate-pulse`} />
        )}
      </div>

      {/* ── Card ── */}
      <div className={`flex-1 border rounded-2xl overflow-hidden transition-all duration-300 ${
        state === "done"
          ? "bg-white/40 border-emerald-200/60 opacity-70"
          : state === "active"
            ? "bg-white/80 backdrop-blur-md border-violet-200 shadow-lg shadow-violet-100/40 ring-1 ring-violet-100/50"
            : "bg-white/30 border-slate-200/50 opacity-50"
      }`}>
        <button type="button" onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/50 transition text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className={`font-bold text-sm truncate ${
              state === "active" ? "text-slate-900" : state === "done" ? "text-slate-500" : "text-slate-400"
            }`}>{phaseName}</span>
            {state === "active" && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 flex-shrink-0">Current</span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-slate-400 hidden sm:block">{done}/{tasks.length}</span>
            {state === "done" && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">Done ✓</span>}
            {state === "locked" && <span className="text-xs text-slate-300">🔒</span>}
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </button>
        {open && (
          <div className="px-5 pb-4 border-t border-white/60">
            {description && <p className="text-xs text-slate-400 mt-3 mb-1 leading-relaxed line-clamp-2">{description}</p>}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600 mr-1">Skills:</span>
                {skills.map((s) => (
                  <span key={s} className="text-[11px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            )}
            {pitfall && (
              <div className="mt-2 mb-3 rounded-xl bg-rose-50/80 border border-rose-200/60 px-3.5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">⚠ The Trap</p>
                <p className="text-xs text-rose-700 leading-relaxed">{pitfall}</p>
              </div>
            )}
            {tools.length > 0 && (
              <div className="mt-2 mb-3 rounded-xl bg-indigo-50/70 border border-indigo-200/50 px-3.5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1.5">🛠 Dev Tools</p>
                <div className="space-y-1">
                  {tools.map((t, i) => (
                    <p key={i} className="text-xs text-indigo-700 leading-relaxed">• {t}</p>
                  ))}
                </div>
              </div>
            )}
            {tasks.length > 0
              ? <ul className="divide-y divide-white/60">{tasks.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggle} />)}</ul>
              : <p className="text-xs text-slate-300 mt-3">No tasks for this phase.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  })

  const [aiCoachMessage, setAiCoachMessage] = useState<string | null>(null)
  const [coachLoading, setCoachLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      navigate("/dashboard")
    },
  })

  function fetchCoachMessage(updated: Project) {
    const totalT = updated.tasks.length
    const doneT = updated.tasks.filter((t) => t.completed).length
    const streak = computeDailyStreak(updated.tasks)
    const compPhases = updated.roadmap.filter((phase) => {
      const pts = updated.tasks.filter((t) => t.phase === phase.phase)
      return pts.length > 0 && pts.every((t) => t.completed)
    }).length
    const activePhase = updated.roadmap.find((phase) => {
      const pts = updated.tasks.filter((t) => t.phase === phase.phase)
      return pts.some((t) => !t.completed)
    })
    setCoachLoading(true)
    projectsApi
      .coach(id!, {
        project_title: updated.title,
        level: updated.level,
        domain: updated.domain,
        done_tasks: doneT,
        total_tasks: totalT,
        completed_phases: compPhases,
        total_phases: updated.roadmap.length,
        daily_streak: streak,
        active_phase: activePhase?.phase ?? null,
      })
      .then((r) => setAiCoachMessage(r.message || null))
      .catch(() => setAiCoachMessage(null))
      .finally(() => setCoachLoading(false))
  }

  const updateMutation = useMutation({
    mutationFn: (tasks: Task[]) => projectsApi.update(id!, { tasks }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["project", id], updated)
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      fetchCoachMessage(updated)
    },
  })

  function handleToggle(taskId: string, completed: boolean) {
    if (!project) return
    updateMutation.mutate(project.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)))
  }

  const totalTasks = project?.tasks?.length ?? 0
  const doneTasks = project?.tasks?.filter((t) => t.completed).length ?? 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const dailyStreak = project ? computeDailyStreak(project.tasks) : 0
  const completedPhases = project?.roadmap.filter((phase) => {
    const phaseTasks = project.tasks.filter((task) => task.phase === phase.phase)
    return phaseTasks.length > 0 && phaseTasks.every((task) => task.completed)
  }).length ?? 0
  const currentPhase = project?.roadmap.find((phase) => {
    const phaseTasks = project.tasks.filter((task) => task.phase === phase.phase)
    return phaseTasks.some((task) => !task.completed)
  })
  const motivationMessage = buildMotivationMessage({
    totalTasks,
    completedPhases,
    totalPhases: project?.roadmap.length ?? 0,
    dailyStreak,
    activePhaseName: currentPhase?.phase,
  })
  const [archiView, setArchiView] = useState(false)

  if (isLoading) return <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center text-slate-400">Loading</div>
  if (isError || !project) return <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center text-rose-500">Failed to load project.</div>

  return (
    <div className="min-h-screen bg-[#faf9ff] relative overflow-hidden text-slate-900">
      <div className="pointer-events-none">
        <div className="glow-orb w-[34rem] h-[34rem] bg-violet-300/65 -top-32 -right-32" />
        <div className="glow-orb w-[28rem] h-[28rem] bg-sky-300/50 bottom-0 -left-32" />
        <div className="glow-orb w-[16rem] h-[16rem] bg-emerald-200/40 top-1/3 right-1/4" />
      </div>

      <nav className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/80 px-6 py-4 flex items-center justify-between gap-3 sticky top-0">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 font-semibold transition">← Dashboard</Link>
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" theme="light" />
          {/* ── Actions menu ── */}
          <div className="relative">
            <button onClick={() => setShowMenu((v) => !v)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/></svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-10 z-40 bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl shadow-slate-200/50 py-1 w-48">
                  {!confirmDelete ? (
                    <button onClick={() => setConfirmDelete(true)} className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition font-medium">
                      Delete project
                    </button>
                  ) : (
                    <div className="px-4 py-3">
                      <p className="text-xs text-rose-500 font-semibold mb-2">Delete permanently?</p>
                      <div className="flex gap-2">
                        <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}
                          className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 px-3 py-1.5 rounded-lg transition">
                          {deleteMutation.isPending ? "Deleting…" : "Yes"}
                        </button>
                        <button onClick={() => { setConfirmDelete(false); setShowMenu(false) }}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h1
              className="text-4xl sm:text-5xl font-extrabold leading-tight"
              style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #7c3aed 40%, #0ea5e9 70%, #10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {project.title}
            </h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border mt-2 ${LEVEL_STYLE[project.level] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {project.level}
            </span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">{project.description}</p>
          {project.technologies?.length > 0 && (() => {
            const userTechs = new Set((project.user_technologies ?? []).map(t => t.toLowerCase()))
            const chosen = project.technologies.filter(t => userTechs.has(t.toLowerCase()))
            const aiAdded = project.technologies.filter(t => !userTechs.has(t.toLowerCase()))
            return (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {chosen.map((tech) => (
                  <span key={tech} className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full font-medium">{tech}</span>
                ))}
                {aiAdded.map((tech) => (
                  <span key={tech} className="text-xs bg-white/60 text-slate-500 border border-dashed border-slate-300 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                    {tech}
                  </span>
                ))}
              </div>
            )
          })()}
        </div>

        {/* ── Tech Challenge ── */}
        {project.tech_challenge && (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-sky-50/80 border border-indigo-100/60 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-1.5">⚡ The Tech Challenge</p>
            <p className="text-sm text-slate-700 leading-relaxed">{project.tech_challenge}</p>
          </div>
        )}

        {/* ── Design Decisions (ADR) ── */}
        {project.design_decisions?.length > 0 && (
          <div className="mb-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/70 px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-3">🏛 Design Decisions</p>
            <div className="space-y-3">
              {project.design_decisions.map((d, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{d.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{d.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress card with circular indicator */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-white/70 p-5 mb-6 shadow-lg shadow-violet-100/20">
          <div className="flex items-center gap-5">
            {/* Circular progress */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" opacity="0.4" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="url(#progress-grad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progress-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={progress === 100 ? "#34d399" : "#7c3aed"} />
                    <stop offset="50%" stopColor={progress === 100 ? "#2dd4bf" : "#0ea5e9"} />
                    <stop offset="100%" stopColor={progress === 100 ? "#34d399" : "#10b981"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-extrabold ${progress === 100 ? "text-emerald-600" : "text-slate-800"}`}>{progress}%</span>
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800">Overall progress</span>
              <p className="text-xs text-slate-400 mt-0.5">{doneTasks} of {totalTasks} tasks completed</p>
              {dailyStreak > 0 && (
                <p className="text-xs font-semibold text-violet-500 mt-1">🔥 {dailyStreak}-day streak</p>
              )}
            </div>
          </div>
        </div>

        {/* ── View toggle ── */}
        <div className="flex items-center gap-2 mb-5 bg-white/70 backdrop-blur border border-white/80 rounded-2xl p-1 w-fit shadow-sm shadow-violet-100/70">
          <button
            onClick={() => setArchiView(false)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              !archiView ? "bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 text-white shadow-md shadow-violet-200" : "text-slate-400 hover:text-slate-900"
            }`}>
            Roadmap
          </button>
          <button
            onClick={() => setArchiView(true)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              archiView ? "bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 text-white shadow-md shadow-violet-200" : "text-slate-400 hover:text-slate-900"
            }`}>
            Architect View
          </button>
        </div>

        {archiView ? (
          <ArchitectView project={project} />
        ) : (
          <>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Roadmap</p>
            <div className="relative">
              {project.roadmap.map((phase, i) => {
                const phaseTasks = project.tasks.filter((t) => t.phase === phase.phase)
                const allDone = phaseTasks.length > 0 && phaseTasks.every((t) => t.completed)
                const isActive = !allDone && project.roadmap.slice(0, i).every((prev) => {
                  const prevTasks = project.tasks.filter((t) => t.phase === prev.phase)
                  return prevTasks.length > 0 && prevTasks.every((t) => t.completed)
                })
                const state: "done" | "active" | "locked" = allDone ? "done" : isActive || i === 0 && !allDone ? "active" : "locked"
                const layout = NODE_OFFSETS[i % NODE_OFFSETS.length]
                const nextLayout = i < project.roadmap.length - 1 ? NODE_OFFSETS[(i + 1) % NODE_OFFSETS.length] : null
                const isLast = i === project.roadmap.length - 1
                const fromX = layout.side === "left" ? 22 : 378
                const toX = nextLayout ? (nextLayout.side === "left" ? 22 : 378) : 0

                return (
                  <Fragment key={i}>
                    <div className={layout.pad}>
                      <PhaseAccordion
                        index={i} phaseName={phase.phase} description={phase.description}
                        tasks={phaseTasks}
                        onToggle={handleToggle}
                        state={state}
                        side={layout.side}
                        skills={phase.skills ?? []}
                        pitfall={phase.pitfall ?? ""}
                        tools={phase.tools ?? []}
                      />
                    </div>
                    {/* ── Curved abstract connector ── */}
                    {!isLast && nextLayout && (
                      <div className="relative h-10 sm:h-14 my-1 pointer-events-none">
                        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 60" preserveAspectRatio="none">
                          <path
                            d={`M ${fromX},0 C ${fromX},32 ${toX},28 ${toX},60`}
                            stroke={state === "done" ? "#86efac" : "#e2e8f0"}
                            strokeWidth="2"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeDasharray={state === "locked" ? "6 4" : "none"}
                            opacity={state === "locked" ? 0.45 : 0.7}
                          />
                          <circle
                            cx={(fromX + toX) / 2}
                            cy="30"
                            r="3"
                            fill={state === "done" ? "#6ee7b7" : "#cbd5e1"}
                            opacity={state === "locked" ? 0.25 : 0.5}
                          />
                        </svg>
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>

            {progress === 100 && (
              <div className="mt-8 text-center py-10 bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200 rounded-3xl backdrop-blur-xl shadow-xl shadow-emerald-100/70">
                <p className="text-4xl mb-3">✦</p>
                <p className="text-emerald-700 font-extrabold text-xl mb-1">Project complete!</p>
                <p className="text-slate-500 text-sm mb-6">You built something real. Amazing work!</p>
                <button onClick={() => navigate("/generate")} className="bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 hover:from-emerald-400 hover:via-sky-400 hover:to-violet-400 text-white font-bold px-6 py-2.5 rounded-2xl text-sm shadow-lg shadow-emerald-600/25 transition">
                  Generate next project →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
