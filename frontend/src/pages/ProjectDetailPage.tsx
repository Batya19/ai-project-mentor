import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../lib/api"
import type { Task } from "../lib/api"

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    junior: "bg-teal-400/15 text-teal-300 border-teal-400/25",
    mid: "bg-amber-400/15 text-amber-300 border-amber-400/25",
    advanced: "bg-rose-400/15 text-rose-300 border-rose-400/25",
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize border ${styles[level] ?? "bg-zinc-800 text-zinc-400"}`}>
      {level}
    </span>
  )
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string, v: boolean) => void }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <label className="flex items-start gap-3 cursor-pointer w-full group">
        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition ${
          task.completed
            ? "bg-teal-400 border-teal-400"
            : "border-zinc-700 bg-zinc-800 group-hover:border-teal-400/60"
        }`}>
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-zinc-900" fill="none" viewBox="0 0 10 8">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <input type="checkbox" checked={task.completed} onChange={(e) => onToggle(task.id, e.target.checked)} className="sr-only" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${task.completed ? "line-through text-zinc-600" : "text-zinc-300"}`}>{task.name}</p>
          {task.description && <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{task.description}</p>}
          {task.estimated_hours > 0 && (
            <span className="inline-block mt-1.5 text-xs bg-violet-400/10 text-violet-300 border border-violet-400/20 px-2 py-0.5 rounded-full">~{task.estimated_hours}h</span>
          )}
        </div>
      </label>
    </li>
  )
}

function PhaseAccordion({ index, phaseName, description, tasks, onToggle }: {
  index: number; phaseName: string; description: string; tasks: Task[]; onToggle: (id: string, v: boolean) => void
}) {
  const [open, setOpen] = useState(index === 0)
  const done = tasks.filter((t) => t.completed).length
  const phasePct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className={`border rounded-2xl overflow-hidden transition ${phasePct === 100 ? "border-teal-400/25 bg-teal-400/5" : "border-white/6 bg-zinc-900"}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${phasePct === 100 ? "bg-teal-400 text-zinc-900" : "bg-zinc-800 text-zinc-400"}`}>
            {phasePct === 100 ? "" : index + 1}
          </div>
          <span className="text-zinc-200 font-semibold text-sm">{phaseName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-600 hidden sm:block">{done}/{tasks.length}</span>
          {phasePct === 100 && <span className="text-xs bg-teal-400/15 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/25">Done</span>}
          <svg className={`w-4 h-4 text-zinc-600 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-white/5">
          {description && <p className="text-xs text-zinc-600 mt-3 mb-1 leading-relaxed">{description}</p>}
          {tasks.length > 0
            ? <ul className="divide-y divide-white/4">{tasks.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggle} />)}</ul>
            : <p className="text-xs text-zinc-700 mt-3">No tasks for this phase.</p>
          }
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

  if (isLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-600">Loading</div>
  if (isError || !project) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-rose-400">Failed to load project.</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-white/6 px-6 py-4 flex items-center gap-3 sticky top-0 z-10 bg-zinc-950/80 backdrop-blur">
        <Link to="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-200 transition font-medium"> Dashboard</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-zinc-100 leading-tight">{project.title}</h1>
            <LevelBadge level={project.level} />
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed">{project.description}</p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-xs bg-zinc-800 text-zinc-400 border border-white/6 px-2.5 py-0.5 rounded-lg">{tech}</span>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="bg-zinc-900 border border-white/6 rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-zinc-300">Overall progress</span>
            <span className={`text-sm font-bold ${progress === 100 ? "text-teal-400" : "text-violet-300"}`}>{progress}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${progress === 100 ? "bg-teal-400" : "bg-gradient-to-r from-teal-400 to-violet-400"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600">{doneTasks} of {totalTasks} tasks completed</p>
        </div>

        {/* Roadmap */}
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Roadmap</p>
        <div className="space-y-3">
          {project.roadmap.map((phase, i) => (
            <PhaseAccordion
              key={i}
              index={i}
              phaseName={phase.phase}
              description={phase.description}
              tasks={project.tasks.filter((t) => t.phase === phase.phase)}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {progress === 100 && (
          <div className="mt-8 text-center py-8 bg-teal-400/8 border border-teal-400/20 rounded-3xl">
            <p className="text-3xl mb-2"></p>
            <p className="text-teal-300 font-bold text-base">Project complete!</p>
            <p className="text-zinc-500 text-sm mt-1 mb-5">You shipped something real. Amazing work.</p>
            <button
              onClick={() => navigate("/generate")}
              className="bg-teal-400 hover:bg-teal-300 text-zinc-900 text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-teal-400/15"
            >
              Generate next project 
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
