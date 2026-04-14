import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../lib/api"
import type { Task } from "../lib/api"
import ArchitectView from "../components/ArchitectView"
import BrandLogo from "../components/BrandLogo"

const LEVEL_STYLE: Record<string, string> = {
  junior: "bg-emerald-400/12 text-emerald-300 border-emerald-400/20",
  mid: "bg-amber-400/12 text-amber-300 border-amber-400/20",
  advanced: "bg-rose-400/12 text-rose-300 border-rose-400/20",
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string, v: boolean) => void }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <label className="flex items-start gap-3 cursor-pointer w-full group">
        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded-lg border-2 flex items-center justify-center transition ${
          task.completed ? "bg-gradient-to-br from-violet-500 via-sky-400 to-emerald-400 border-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.45)]" : "border-white/20 bg-white/[0.03] group-hover:border-sky-400"
        }`}>
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <input type="checkbox" checked={task.completed} onChange={(e) => onToggle(task.id, e.target.checked)} className="sr-only"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${task.completed ? "line-through text-white/20" : "text-white/85"}`}>{task.name}</p>
          {task.description && <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{task.description}</p>}
          {task.estimated_hours > 0 && (
            <span className="inline-block mt-1.5 text-xs bg-violet-500/10 text-violet-200 border border-violet-400/20 px-2 py-0.5 rounded-full font-medium">~{task.estimated_hours}h</span>
          )}
        </div>
      </label>
    </li>
  )
}

const PHASE_COLORS = [
  { bg: "from-violet-500/12 to-transparent", border: "border-violet-400/20", num: "bg-gradient-to-br from-violet-500 to-purple-500" },
  { bg: "from-sky-500/12 to-transparent", border: "border-sky-400/20", num: "bg-gradient-to-br from-sky-500 to-cyan-500" },
  { bg: "from-rose-500/12 to-transparent", border: "border-rose-400/20", num: "bg-gradient-to-br from-rose-500 to-pink-500" },
  { bg: "from-amber-500/12 to-transparent", border: "border-amber-400/20", num: "bg-gradient-to-br from-amber-500 to-yellow-500" },
  { bg: "from-emerald-500/12 to-transparent", border: "border-emerald-400/20", num: "bg-gradient-to-br from-emerald-500 to-teal-500" },
]

function PhaseAccordion({ index, phaseName, description, tasks, onToggle }: {
  index: number; phaseName: string; description: string; tasks: Task[]; onToggle: (id: string, v: boolean) => void
}) {
  const [open, setOpen] = useState(index === 0)
  const done = tasks.filter((t) => t.completed).length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
  const colors = PHASE_COLORS[index % PHASE_COLORS.length]

  return (
    <div className={`border rounded-3xl overflow-hidden transition bg-[#0b0a15]/85 backdrop-blur-xl ${pct === 100 ? "border-emerald-400/25 shadow-[0_0_24px_rgba(52,211,153,0.08)]" : `${colors.border} bg-gradient-to-br ${colors.bg}`}`}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm ${pct === 100 ? "bg-gradient-to-br from-emerald-400 to-teal-400" : colors.num}`}>
            {pct === 100 ? "✓" : index + 1}
          </div>
          <span className="text-white font-bold text-sm">{phaseName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/35 hidden sm:block">{done}/{tasks.length}</span>
          {pct === 100 && <span className="text-xs bg-emerald-400/12 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/20">Done ✓</span>}
          <svg className={`w-4 h-4 text-white/35 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-white/8">
          {description && <p className="text-xs text-white/35 mt-3 mb-1 leading-relaxed">{description}</p>}
          {tasks.length > 0
            ? <ul className="divide-y divide-white/8">{tasks.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggle} />)}</ul>
            : <p className="text-xs text-white/20 mt-3">No tasks for this phase.</p>}
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

  const updateMutation = useMutation({
    mutationFn: (tasks: Task[]) => projectsApi.update(id!, { tasks }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["project", id], updated)
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })

  function handleToggle(taskId: string, completed: boolean) {
    if (!project) return
    updateMutation.mutate(project.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)))
  }

  const totalTasks = project?.tasks?.length ?? 0
  const doneTasks = project?.tasks?.filter((t) => t.completed).length ?? 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const [archiView, setArchiView] = useState(false)

  if (isLoading) return <div className="min-h-screen bg-[#060611] flex items-center justify-center text-white/35">Loading</div>
  if (isError || !project) return <div className="min-h-screen bg-[#060611] flex items-center justify-center text-rose-300">Failed to load project.</div>

  return (
    <div className="min-h-screen bg-[#060611] relative overflow-hidden text-white">
      <div className="pointer-events-none">
        <div className="glow-orb w-[34rem] h-[34rem] bg-violet-500/45 -top-32 -right-32" />
        <div className="glow-orb w-[28rem] h-[28rem] bg-sky-500/28 bottom-0 -left-32" />
        <div className="glow-orb w-[16rem] h-[16rem] bg-emerald-500/18 top-1/3 right-1/4" />
      </div>

      <nav className="relative z-20 bg-black/20 backdrop-blur-xl border-b border-white/8 px-6 py-4 flex items-center justify-between gap-3 sticky top-0">
        <Link to="/dashboard" className="text-sm text-white/45 hover:text-white font-semibold transition">← Dashboard</Link>
        <BrandLogo size="sm" />
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-extrabold text-white leading-tight">{project.title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border ${LEVEL_STYLE[project.level] ?? "bg-white/10 text-white/60 border-white/10"}`}>
              {project.level}
            </span>
          </div>
          <p className="text-white/45 text-sm leading-relaxed">{project.description}</p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-xs bg-violet-400/10 text-violet-200 border border-violet-400/20 px-2.5 py-0.5 rounded-full font-medium">{tech}</span>
              ))}
            </div>
          )}
        </div>

        {/* Progress card */}
        <div className="surface-glow rounded-3xl p-5 mb-6 shadow-2xl shadow-black/15">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-white">Overall progress</span>
            <span className={`text-sm font-extrabold ${progress === 100 ? "text-emerald-300" : "text-sky-300"}`}>{progress}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${progress === 100 ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_14px_rgba(52,211,153,0.45)]" : "bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400 shadow-[0_0_16px_rgba(56,189,248,0.45)]"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/35">{doneTasks} of {totalTasks} tasks completed</p>
        </div>

        {/* ── View toggle ── */}
        <div className="flex items-center gap-2 mb-5 bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-1 w-fit shadow-sm">
          <button
            onClick={() => setArchiView(false)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              !archiView ? "bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 text-white shadow-md shadow-violet-600/30" : "text-white/40 hover:text-white"
            }`}>
            Roadmap
          </button>
          <button
            onClick={() => setArchiView(true)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              archiView ? "bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 text-white shadow-md shadow-violet-600/30" : "text-white/40 hover:text-white"
            }`}>
            Architect View
          </button>
        </div>

        {archiView ? (
          <ArchitectView project={project} />
        ) : (
          <>
            <p className="text-xs font-bold text-white/35 uppercase tracking-wider mb-3">Roadmap</p>
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
              <div className="mt-8 text-center py-10 bg-gradient-to-br from-emerald-500/12 to-sky-500/10 border border-emerald-400/20 rounded-3xl backdrop-blur-xl">
                <p className="text-4xl mb-3">✦</p>
                <p className="text-emerald-300 font-extrabold text-xl mb-1">Project complete!</p>
                <p className="text-white/45 text-sm mb-6">You built something real. Amazing work!</p>
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
