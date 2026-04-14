import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../lib/api"
import type { Task } from "../lib/api"
import ArchitectView from "../components/ArchitectView"

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
          task.completed ? "bg-gradient-to-br from-violet-500 to-sky-500 border-violet-400" : "border-slate-200 bg-white group-hover:border-violet-400"
        }`}>
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <input type="checkbox" checked={task.completed} onChange={(e) => onToggle(task.id, e.target.checked)} className="sr-only"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${task.completed ? "line-through text-slate-300" : "text-slate-700"}`}>{task.name}</p>
          {task.description && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>}
          {task.estimated_hours > 0 && (
            <span className="inline-block mt-1.5 text-xs bg-violet-100 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full font-medium">~{task.estimated_hours}h</span>
          )}
        </div>
      </label>
    </li>
  )
}

const PHASE_COLORS = [
  { bg: "from-violet-50 to-purple-50", border: "border-violet-200", num: "bg-gradient-to-br from-violet-500 to-purple-500" },
  { bg: "from-sky-50 to-cyan-50",      border: "border-sky-200",    num: "bg-gradient-to-br from-sky-500 to-cyan-500" },
  { bg: "from-rose-50 to-pink-50",     border: "border-rose-200",   num: "bg-gradient-to-br from-rose-500 to-pink-500" },
  { bg: "from-amber-50 to-yellow-50",  border: "border-amber-200",  num: "bg-gradient-to-br from-amber-500 to-yellow-500" },
  { bg: "from-emerald-50 to-teal-50",  border: "border-emerald-200",num: "bg-gradient-to-br from-emerald-500 to-teal-500" },
]

function PhaseAccordion({ index, phaseName, description, tasks, onToggle }: {
  index: number; phaseName: string; description: string; tasks: Task[]; onToggle: (id: string, v: boolean) => void
}) {
  const [open, setOpen] = useState(index === 0)
  const done = tasks.filter((t) => t.completed).length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
  const colors = PHASE_COLORS[index % PHASE_COLORS.length]

  return (
    <div className={`border-2 rounded-3xl overflow-hidden transition ${pct === 100 ? "border-emerald-200 bg-emerald-50" : `${colors.border} bg-gradient-to-br ${colors.bg}`}`}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/40 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm ${pct === 100 ? "bg-gradient-to-br from-emerald-400 to-teal-400" : colors.num}`}>
            {pct === 100 ? "" : index + 1}
          </div>
          <span className="text-slate-800 font-bold text-sm">{phaseName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">{done}/{tasks.length}</span>
          {pct === 100 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">Done </span>}
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-white/60">
          {description && <p className="text-xs text-slate-400 mt-3 mb-1 leading-relaxed">{description}</p>}
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

  if (isLoading) return <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center text-slate-400">Loading</div>
  if (isError || !project) return <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center text-rose-500">Failed to load project.</div>

  return (
    <div className="min-h-screen bg-[#faf9ff] relative overflow-hidden">
      <div className="pointer-events-none">
        <div className="blob w-96 h-96 bg-violet-200 -top-32 -right-32" style={{position:"fixed"}} />
        <div className="blob w-80 h-80 bg-sky-100 bottom-0 -left-32" style={{position:"fixed"}} />
      </div>

      <nav className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/80 px-6 py-4 flex items-center gap-3 sticky top-0">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 font-semibold transition"> Dashboard</Link>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">{project.title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border ${LEVEL_STYLE[project.level] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {project.level}
            </span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">{project.description}</p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-xs bg-violet-100 text-violet-600 border border-violet-200 px-2.5 py-0.5 rounded-full font-medium">{tech}</span>
              ))}
            </div>
          )}
        </div>

        {/* Progress card */}
        <div className="bg-white/70 backdrop-blur border border-white/80 rounded-3xl p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-700">Overall progress</span>
            <span className={`text-sm font-extrabold ${progress === 100 ? "text-emerald-500" : "text-violet-600"}`}>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${progress === 100 ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-violet-400 to-sky-400"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{doneTasks} of {totalTasks} tasks completed</p>
        </div>

        {/* ── View toggle ── */}
        <div className="flex items-center gap-2 mb-5 bg-white/60 backdrop-blur border border-white/80 rounded-2xl p-1 w-fit shadow-sm">
          <button
            onClick={() => setArchiView(false)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              !archiView ? "bg-gradient-to-r from-violet-500 to-sky-500 text-white shadow-md shadow-violet-200" : "text-slate-400 hover:text-slate-600"
            }`}>
            📋 Roadmap
          </button>
          <button
            onClick={() => setArchiView(true)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              archiView ? "bg-gradient-to-r from-violet-600 to-sky-600 text-white shadow-md shadow-violet-300" : "text-slate-400 hover:text-slate-600"
            }`}>
            🏗 Architect View
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
              <div className="mt-8 text-center py-10 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl">
                <p className="text-4xl mb-3"></p>
                <p className="text-emerald-700 font-extrabold text-xl mb-1">Project complete!</p>
                <p className="text-emerald-600 text-sm mb-6">You built something real. Amazing work!</p>
                <button onClick={() => navigate("/generate")} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-6 py-2.5 rounded-2xl text-sm shadow-lg shadow-emerald-200 transition">
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
