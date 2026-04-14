import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { projectsApi } from "../lib/api"
import type { Project } from "../lib/api"
import { useAuthStore } from "../store/authStore"

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    junior: "bg-teal-400/15 text-teal-300 border border-teal-400/25",
    mid: "bg-amber-400/15 text-amber-300 border border-amber-400/25",
    advanced: "bg-rose-400/15 text-rose-300 border border-rose-400/25",
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 capitalize ${styles[level] ?? "bg-zinc-800 text-zinc-400"}`}>
      {level}
    </span>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(project.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  })

  const totalTasks = project.tasks?.length ?? 0
  const doneTasks = project.tasks?.filter((t) => t.completed).length ?? 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="bg-zinc-900 border border-white/6 rounded-2xl p-5 flex flex-col gap-4 hover:border-teal-400/25 hover:bg-zinc-800/60 transition group">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="text-zinc-100 font-semibold text-sm leading-snug line-clamp-2 hover:text-teal-300 transition"
        >
          {project.title}
        </Link>
        <LevelBadge level={project.level} />
      </div>

      <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{project.description}</p>

      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span key={tech} className="text-xs bg-zinc-800 text-zinc-400 border border-white/6 px-2 py-0.5 rounded-lg">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-xs text-zinc-600">+{project.technologies.length - 4}</span>
          )}
        </div>
      )}

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-zinc-600">{doneTasks}/{totalTasks} tasks</span>
          <span className="text-teal-400 font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1">
          <div
            className="bg-teal-400 h-1 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <Link
          to={`/projects/${project.id}`}
          className="flex-1 text-center text-xs bg-teal-400/10 hover:bg-teal-400/20 text-teal-300 font-medium rounded-xl py-2 transition border border-teal-400/20"
        >
          View roadmap 
        </Link>
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="text-zinc-600 hover:text-rose-400 transition disabled:opacity-40 text-xs px-2 py-2"
          title="Delete"
        >
          
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const email = useAuthStore((s) => s.email)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  })

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-white/6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-zinc-950/80 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-400/15 border border-teal-400/25 flex items-center justify-center">
            <span className="text-teal-300 text-xs"></span>
          </div>
          <span className="font-bold text-zinc-200 text-sm">AI Project Mentor</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-600 hidden sm:block">{email}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-zinc-500 hover:text-zinc-200 transition font-medium"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Your Projects</h1>
            <p className="text-zinc-600 text-sm mt-0.5">Track your AI-generated learning roadmaps</p>
          </div>
          <Link
            to="/generate"
            className="bg-teal-400 hover:bg-teal-300 text-zinc-900 text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-teal-400/15"
          >
            + New project
          </Link>
        </div>

        {isLoading && <div className="text-center py-24 text-zinc-600">Loading</div>}
        {isError && <div className="text-center py-24 text-rose-400">Failed to load projects.</div>}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-teal-400/10 border border-teal-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-teal-300 text-2xl"></span>
            </div>
            <p className="text-zinc-400 font-medium mb-1">No projects yet</p>
            <p className="text-zinc-600 text-sm mb-6">Generate your first AI-powered project idea</p>
            <Link
              to="/generate"
              className="inline-block bg-teal-400 hover:bg-teal-300 text-zinc-900 text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-teal-400/15"
            >
              Generate a project
            </Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </main>
    </div>
  )
}
