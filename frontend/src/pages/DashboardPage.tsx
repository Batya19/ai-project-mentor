import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { projectsApi } from '../lib/api'
import type { Project } from '../lib/api'
import { useAuthStore } from '../store/authStore'

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
      <div
        className="bg-indigo-500 h-1.5 rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(project.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  const totalTasks = project.tasks?.length ?? 0
  const doneTasks = project.tasks?.filter((t) => t.completed).length ?? 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-3 hover:border-indigo-700 transition">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/projects/${project.id}`} className="text-white font-semibold text-lg hover:text-indigo-300 transition line-clamp-2">
          {project.title}
        </Link>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
          project.level === 'junior' ? 'bg-green-900 text-green-300' :
          project.level === 'mid' ? 'bg-yellow-900 text-yellow-300' :
          'bg-red-900 text-red-300'
        }`}>
          {project.level}
        </span>
      </div>

      <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>

      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span key={tech} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-xs text-gray-500">+{project.technologies.length - 4} more</span>
          )}
        </div>
      )}

      <div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{doneTasks}/{totalTasks} tasks</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="flex items-center gap-3 mt-1">
        <Link
          to={`/projects/${project.id}`}
          className="flex-1 text-center text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-1.5 transition"
        >
          View roadmap
        </Link>
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="text-sm text-gray-500 hover:text-red-400 transition disabled:opacity-40"
        >
          Delete
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
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-indigo-400">AI Project Mentor</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">{email}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white transition">
            Log out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <p className="text-gray-400 text-sm mt-1">Track your AI-generated project roadmaps</p>
          </div>
          <Link
            to="/generate"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            + New project
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-20 text-gray-500">Loading projects…</div>
        )}

        {isError && (
          <div className="text-center py-20 text-red-400">Failed to load projects.</div>
        )}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No projects yet.</p>
            <Link to="/generate" className="text-indigo-400 hover:underline text-sm">
              Generate your first project →
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
