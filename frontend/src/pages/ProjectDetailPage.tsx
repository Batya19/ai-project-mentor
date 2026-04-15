import { useState } from "react"
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

function PhaseAccordion({ index, phaseName, description, tasks, onToggle }: {
  index: number; phaseName: string; description: string; tasks: Task[]; onToggle: (id: string, v: boolean) => void
}) {
  const [open, setOpen] = useState(index === 0)
  const done = tasks.filter((t) => t.completed).length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
  const recentDone = recentTaskCount(tasks)
  const colors = PHASE_COLORS[index % PHASE_COLORS.length]
  const phaseVibe = pct === 100
    ? `Phase closed: all ${done} tasks finished.`
    : recentDone >= 3
      ? `${recentDone} tasks completed in the last 48 h. Strong momentum here.`
      : recentDone === 2
        ? "2 tasks done recently. Keep feeding the pace."
        : recentDone === 1
          ? "1 task completed recently. Add another before the session ends."
          : "No recent activity in this phase. Open it and pick the next task."

  return (
    <div className={`border rounded-3xl overflow-hidden transition bg-white/72 backdrop-blur-xl ${pct === 100 ? "border-emerald-200 shadow-xl shadow-emerald-100/60" : `${colors.border} bg-gradient-to-br ${colors.bg}`}`}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm ${pct === 100 ? "bg-gradient-to-br from-emerald-400 to-teal-400" : colors.num}`}>
            {pct === 100 ? "✓" : index + 1}
          </div>
          <span className="text-slate-900 font-bold text-sm">{phaseName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">{done}/{tasks.length}</span>
          {pct === 100 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">Done ✓</span>}
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-white/60">
          {description && <p className="text-xs text-slate-400 mt-3 mb-1 leading-relaxed">{description}</p>}
          <div className="mt-3 mb-2 rounded-2xl bg-gradient-to-r from-violet-50 via-sky-50 to-emerald-50 border border-white/90 px-3.5 py-2.5 shadow-sm shadow-violet-100/60">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-500 mb-1">Motivation</p>
            <p className="text-sm text-slate-600 leading-relaxed">{phaseVibe}</p>
          </div>
          {tasks.length > 0
            ? <ul className="divide-y divide-white/60">{tasks.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggle} />)}</ul>
            : <p className="text-xs text-slate-300 mt-3">No tasks for this phase.</p>}
        </div>
      )}
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
        <BrandLogo size="sm" theme="light" />
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{project.title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border ${LEVEL_STYLE[project.level] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {project.level}
            </span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">{project.description}</p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full font-medium">{tech}</span>
              ))}
            </div>
          )}
        </div>

        {/* Progress card */}
        <div className="surface-glow rounded-3xl p-5 mb-6 shadow-2xl shadow-black/15">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-800">Overall progress</span>
            <span className={`text-sm font-extrabold ${progress === 100 ? "text-emerald-600" : "text-violet-600"}`}>{progress}%</span>
          </div>
          <div className="w-full bg-white/70 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${progress === 100 ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_14px_rgba(52,211,153,0.45)]" : "bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400 shadow-[0_0_16px_rgba(56,189,248,0.45)]"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{doneTasks} of {totalTasks} tasks completed</p>
        </div>

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-violet-100 via-sky-50 to-emerald-50 border border-white/90 px-5 py-4 shadow-xl shadow-violet-100/60">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-500 via-sky-400 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-violet-200 transition-opacity ${coachLoading ? "opacity-60" : ""}`}>✦</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-500">
                  {coachLoading ? "AI Coach" : aiCoachMessage ? "AI Coach" : "Real-Time Motivation"}
                </p>
                {coachLoading && (
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-violet-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              {coachLoading ? (
                <div className="h-4 bg-violet-100/60 rounded-full w-3/4 animate-pulse" />
              ) : (
                <p className="text-sm leading-relaxed text-slate-700">
                  {aiCoachMessage || motivationMessage}
                </p>
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Roadmap</p>
            <div className="space-y-3">
              {project.roadmap.map((phase, i) => (
                <PhaseAccordion
                  key={i} index={i} phaseName={phase.phase} description={phase.description}
                  tasks={project.tasks.filter((t) => t.phase === phase.phase)}
                  onToggle={handleToggle}
                />
              ))}
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
        {/* ── Danger zone ── */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-slate-400 hover:text-rose-500 font-medium transition"
            >
              Delete this project
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-sm text-rose-500 font-semibold">Delete "{project.title}" permanently?</p>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 px-4 py-2 rounded-xl transition"
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
