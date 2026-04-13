import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../lib/api"
import type { Task } from "../lib/api"

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    junior: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    mid: "bg-amber-100 text-amber-700 border border-amber-200",
    advanced: "bg-rose-100 text-rose-700 border border-rose-200",
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${styles[level] ?? "bg-slate-100 text-slate-600"}`}>
      {level}
    </span>
  )
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string, v: boolean) => void }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <label className="flex items-start gap-3 cursor-pointer w-full group">
        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition ${task.completed ? "bg-violet-500 border-violet-500" : "border-slate-300 bg-white group-hover:border-violet-400"}`}>
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <input type="checkbox" checked={task.completed} onChange={(e) => onToggle(task.id, e.target.checked)} className="sr-only" />
        </div>
        <div className="flex-1">
          <p className={`text-sm leading-snug ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{task.name}</p>
          {task.description && <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>}
          {task.estimated_hours > 0 && (
            <span className="inline-block mt-1 text-xs bg-violet-50 text-violet-500 border border-violet-100 px-2 py-0.5 rounded-full">~{task.estimated_hours}h</span>
          )}
        </div>
      </label>
    </li>
  )
}

function PhaseAccordion({
  index,
  phaseName,
  description,
  tasks,
  onToggle,
}: {
  index: number
  phaseName: string
  description: string
  tasks: Task[]
  onToggle: (id: string, v: boolean) => void
}) {
  const [open, setOpen] = useState(index === 0)
  const done = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const phasePct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-violet-600">{index + 1}</span>
          </div>
          <span className="text-slate-800 font-semibold text-sm">{phaseName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">{done}/{total} done</span>
          {phasePct === 100 && <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Complete</span>}
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-slate-50">
          {description && <p className="text-xs text-slate-400 mt-3 mb-1">{description}</p>}
          {tasks.length > 0 ? (
            <ul className="divide-y divide-slate-50">
              {tasks.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggle} />)}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 mt-3">No tasks for this phase.</p>
          )}
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
    const newTasks = project.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t))
    updateMutation.mutate(newTasks)
  }

  const totalTasks = project?.tasks?.length ?? 0
  const doneTasks = project?.tasks?.filter((t) => t.completed).length ?? 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading</div>
  )
  if (isError || !project) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-rose-500">Failed to load project.</div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium">
           Dashboard
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">{project.title}</h1>
            <LevelBadge level={project.level} />
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">{project.description}</p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2.5 py-0.5 rounded-lg font-medium">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-700">Overall progress</span>
            <span className={`text-sm font-bold ${progress === 100 ? "text-emerald-500" : "text-violet-500"}`}>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${progress === 100 ? "bg-emerald-400" : "bg-violet-400"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{doneTasks} of {totalTasks} tasks completed</p>
        </div>

        {/* Roadmap */}
        <h2 className="text-base font-bold text-slate-700 mb-3">Roadmap</h2>
        <div className="space-y-3">
          {project.roadmap.map((phase, i) => {
            const phaseTasks = project.tasks.filter((t) => t.phase === phase.phase)
            return (
              <PhaseAccordion
                key={i}
                index={i}
                phaseName={phase.phase}
                description={phase.description}
                tasks={phaseTasks}
                onToggle={handleToggle}
              />
            )
          })}
        </div>

        {progress === 100 && (
          <div className="mt-8 text-center py-8 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <p className="text-3xl mb-2"></p>
            <p className="text-emerald-700 font-semibold text-base">Project complete! Great work.</p>
            <p className="text-emerald-600 text-sm mt-1 mb-4">You built something real.</p>
            <button
              onClick={() => navigate("/generate")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-sm"
            >
              Generate next project 
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
