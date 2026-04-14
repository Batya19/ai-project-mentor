import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { projectsApi } from "../lib/api"
import type { Project } from "../lib/api"
import { useAuthStore } from "../store/authStore"

const LEVEL_STYLE: Record<string, string> = {
  junior: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  mid:    "bg-amber-100 text-amber-700 border border-amber-200",
  advanced: "bg-rose-100 text-rose-700 border border-rose-200",
}

const CARD_GRADIENTS = [
  "from-violet-50 to-purple-50 border-violet-200",
  "from-sky-50 to-cyan-50 border-sky-200",
  "from-rose-50 to-pink-50 border-rose-200",
  "from-amber-50 to-yellow-50 border-amber-200",
  "from-emerald-50 to-teal-50 border-emerald-200",
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
    <div className={`card-lift bg-gradient-to-br ${gradClass} border rounded-3xl p-5 flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-2">
        <Link to={`/projects/${project.id}`} className="text-slate-800 font-bold text-sm leading-snug line-clamp-2 hover:text-violet-600 transition">
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
            <span key={tech} className="text-xs bg-white/70 text-slate-600 border border-white/80 px-2 py-0.5 rounded-full shadow-sm">
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
        <div className="w-full bg-white/60 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-violet-400 to-sky-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/50">
        <Link to={`/projects/${project.id}`} className="flex-1 text-center text-xs bg-white/70 hover:bg-white text-violet-600 font-bold rounded-2xl py-2 transition shadow-sm border border-white/80">
          View roadmap 
        </Link>
        <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="text-slate-300 hover:text-rose-400 transition disabled:opacity-40 text-sm px-2" title="Delete"></button>
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
    <div className="min-h-screen bg-[#faf9ff] relative overflow-hidden">
      {/* background blobs */}
      <div className="pointer-events-none">
        <div className="blob w-96 h-96 bg-violet-200 -top-32 -right-32" style={{position:"fixed"}} />
        <div className="blob w-80 h-80 bg-sky-100 bottom-0 -left-32" style={{position:"fixed"}} />
        <div className="blob w-64 h-64 bg-rose-100 top-1/2 right-1/3" style={{position:"fixed", borderRadius:"60% 40% 40% 60% / 50% 60% 40% 50%"}} />
      </div>

      <nav className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/80 px-6 py-4 flex items-center justify-between sticky top-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center shadow-md shadow-violet-200">
            <span className="text-white text-sm font-bold"></span>
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight">AI Project Mentor</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden sm:block">{email}</span>
          <button onClick={() => { logout(); navigate("/login") }} className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition">Log out</button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Your Projects</h1>
            <p className="text-slate-400 text-sm mt-0.5">Track your AI-generated learning roadmaps</p>
          </div>
          <Link to="/generate" className="bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-200 transition">
            + New project
          </Link>
        </div>

        {isLoading && <div className="text-center py-24 text-slate-400">Loading</div>}
        {isError && <div className="text-center py-24 text-rose-500">Failed to load projects.</div>}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-sky-100 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-sm"></div>
            <p className="text-slate-700 font-bold text-lg mb-1">No projects yet!</p>
            <p className="text-slate-400 text-sm mb-6">Generate your first AI-powered project idea</p>
            <Link to="/generate" className="inline-block bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-violet-200 transition">
              Generate a project 
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
