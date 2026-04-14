import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { projectsApi } from "../lib/api"
import type { Project } from "../lib/api"
import BrandLogo from "../components/BrandLogo"
import { useAuthStore } from "../store/authStore"

const LEVEL_STYLE: Record<string, string> = {
  junior: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  mid: "bg-amber-100 text-amber-700 border border-amber-200",
  advanced: "bg-rose-100 text-rose-700 border border-rose-200",
}

const CARD_GRADIENTS = [
  "from-violet-100 via-violet-50 to-white border-violet-200",
  "from-sky-100 via-sky-50 to-white border-sky-200",
  "from-rose-100 via-rose-50 to-white border-rose-200",
  "from-amber-100 via-amber-50 to-white border-amber-200",
  "from-emerald-100 via-emerald-50 to-white border-emerald-200",
]

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(project.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  })
  const totalTasks = project.tasks?.length ?? 0
  const doneTasks = project.tasks?.filter((t) => t.completed).length ?? 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const gradClass = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

  return (
    <div className={`card-lift bg-gradient-to-br ${gradClass} backdrop-blur-xl border rounded-3xl p-5 flex flex-col gap-4 shadow-xl shadow-violet-100/70`}>
      <div className="flex items-start justify-between gap-2">
        <Link to={`/projects/${project.id}`} className="text-slate-900 font-bold text-sm leading-snug line-clamp-2 hover:text-violet-600 transition">
          {project.title}
        </Link>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 capitalize ${LEVEL_STYLE[project.level] ?? "bg-slate-100 text-slate-600 border border-slate-200"}`}>
          {project.level}
        </span>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{project.description}</p>

      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span key={tech} className="text-xs bg-white/80 text-slate-600 border border-white/80 px-2 py-0.5 rounded-full shadow-sm">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && <span className="text-xs text-slate-400">+{project.technologies.length - 4}</span>}
        </div>
      )}

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">{doneTasks}/{totalTasks} tasks</span>
          <span className="font-bold text-violet-600">{progress}%</span>
        </div>
        <div className="w-full bg-white/70 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400 h-1.5 rounded-full transition-all shadow-[0_0_14px_rgba(56,189,248,0.45)]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/60">
        <Link to={`/projects/${project.id}`} className="flex-1 text-center text-xs bg-white/80 hover:bg-white text-slate-900 font-bold rounded-2xl py-2 transition shadow-sm border border-white/80">
          View roadmap →
        </Link>
        <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="text-slate-300 hover:text-rose-400 transition disabled:opacity-40 text-sm px-2" title="Delete">
          ×
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const email = useAuthStore((s) => s.email)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const { data: projects, isLoading, isError } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list })

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
          <span className="text-xs text-slate-400 hidden sm:block">{email}</span>
          <button onClick={() => { logout(); navigate("/login") }} className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition">Log out</button>
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

        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}
      </main>
    </div>
  )
}
