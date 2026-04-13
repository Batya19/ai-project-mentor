import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../lib/api"
import type { Task } from "../lib/api"

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string, v: boolean) => void }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => onToggle(task.id, e.target.checked)}
        className="mt-0.5 accent-indigo-500 w-4 h-4 shrink-0 cursor-pointer"
      />
      <div>
        <p className={`text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-200"}`}>{task.name}</p>
        {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
        {task.estimated_hours > 0 && <p className="text-xs text-indigo-400 mt-0.5">~{task.estimated_hours}h</p>}
      </div>
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

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-900 hover:bg-gray-800 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-indigo-400 bg-indigo-900/40 px-2 py-0.5 rounded-full">Phase {index + 1}</span>
          <span className="text-white font-medium text-sm">{phaseName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{done}/{tasks.length}</span>
          <span className="text-gray-500 text-lg leading-none">{open ? "" : ""}</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 bg-gray-950 border-t border-gray-800">
          {description && <p className="text-xs text-gray-500 mt-3 mb-2">{description}</p>}
          {tasks.length > 0 ? (
            <ul className="divide-y divide-gray-800">
              {tasks.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggle} />)}
            </ul>
          ) : (
            <p className="text-xs text-gray-600 mt-3">No tasks for this phase.</p>
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

  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">Loading</div>
  if (isError || !project) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">Failed to load project.</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition text-sm"> Dashboard</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              project.level === "junior" ? "bg-green-900 text-green-300" :
              project.level === "mid" ? "bg-yellow-900 text-yellow-300" :
              "bg-red-900 text-red-300"
            }`}>{project.level}</span>
          </div>
          <p className="text-gray-400 text-sm">{project.description}</p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md">{tech}</span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300 font-medium">Overall progress</span>
            <span className="text-indigo-400 font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{doneTasks} of {totalTasks} tasks completed</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Roadmap</h2>
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
        </div>

        {progress === 100 && (
          <div className="mt-8 text-center py-6 bg-green-900/20 border border-green-800 rounded-2xl">
            <p className="text-2xl mb-1"></p>
            <p className="text-green-300 font-semibold">Project complete! Great work.</p>
            <button onClick={() => navigate("/generate")} className="mt-3 text-sm text-indigo-400 hover:underline">Generate another project </button>
          </div>
        )}
      </main>
    </div>
  )
}
