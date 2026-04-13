import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { projectsApi } from "../lib/api"
import type { Project } from "../lib/api"
import { useAuthStore } from "../store/authStore"

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    junior: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    mid: "bg-amber-100 text-amber-700 border border-amber-200",
    advanced: "bg-rose-100 text-rose-700 border border-rose-200",
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 capitalize ${styles[level] ?? "bg-slate-100 text-slate-600"}`}>
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="text-slate-800 font-semibold text-base hover:text-violet-600 transition line-clamp-2 leading-snug"
        >
          {project.title}
        </Link>
        <LevelBadge level={project.level} />
      </div>

      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{project.description}</p>

      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span key={tech} className="text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-lg font-medium">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-xs text-slate-400">+{project.technologies.length - 4}</span>
          )}
        </div>
      )}

      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>{doneTasks} of {totalTasks} tasks done</span>
          <span className="font-medium text-violet-500">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-violet-400 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
        <Link
          to={`/projects/${project.id}`}
          className="flex-1 text-center text-sm bg-violet-50 hover:bg-violet-100 text-violet-600 font-medium rounded-xl py-2 transition"
        >
          View roadmap
        </Link>
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="text-sm text-slate-400 hover:text-rose-500 transition disabled:opacity-40 px-2 py-2"
          title="Delete project"
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
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center text-sm"></div>
          <span className="font-bold text-slate-800 text-base">AI Project Mentor</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 hidden sm:block">{email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-800 transition font-medium"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Your Projects</h1>
            <p className="text-slate-400 text-sm mt-0.5">Track your AI-generated learning roadmaps</p>
          </div>
          <Link
            to="/generate"
            className="bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            + New project
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-24 text-slate-400">Loading projects</div>
        )}

        {isError && (
          <div className="text-center py-24 text-rose-500">Failed to load projects.</div>
        )}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"></div>
            <p className="text-slate-500 font-medium mb-1">No projects yet</p>
            <p className="text-slate-400 text-sm mb-5">Generate your first AI-powered project idea</p>
            <Link
              to="/generate"
              className="inline-block bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Generate a project
            </Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
