import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { projectsApi } from '../lib/api'

const LEVELS = ['junior', 'mid', 'advanced'] as const
type Level = typeof LEVELS[number]

const DOMAINS = [
  'Web Development', 'Mobile App', 'Data Science', 'Machine Learning',
  'DevOps', 'Cybersecurity', 'Game Development', 'API / Backend', 'Other',
]

export default function GeneratePage() {
  const [level, setLevel] = useState<Level>('mid')
  const [technologies, setTechnologies] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')
  const [domain, setDomain] = useState('')
  const [businessValue, setBusinessValue] = useState('')
  const [uniqueAspects, setUniqueAspects] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function addTech() {
    const trimmed = techInput.trim()
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies((prev) => [...prev, trimmed])
    }
    setTechInput('')
  }

  function onTechKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTech()
    }
  }

  function removeTech(t: string) {
    setTechnologies((prev) => prev.filter((x) => x !== t))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (technologies.length === 0) {
      setError('Add at least one technology.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const project = await projectsApi.generate({
        level,
        technologies,
        domain: domain || undefined,
      })
      navigate(`/projects/${project.id}`)
    } catch {
      setError('Failed to generate project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-700">|</span>
        <span className="font-semibold text-indigo-400">Generate Project</span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Generate a project idea</h1>
        <p className="text-gray-400 text-sm mb-8">
          Tell us your level and tech stack — the AI will design a custom project with a full roadmap.
        </p>

        {error && (
          <div className="mb-5 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Experience level</label>
            <div className="flex gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
                    level === l
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Technologies <span className="text-gray-500">(press Enter or comma to add)</span>
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {technologies.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 bg-indigo-900/50 border border-indigo-700 text-indigo-200 text-xs px-3 py-1 rounded-full"
                >
                  {t}
                  <button type="button" onClick={() => removeTech(t)} className="hover:text-white ml-0.5">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={onTechKeyDown}
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. React, Node.js, PostgreSQL"
              />
              <button
                type="button"
                onClick={addTech}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-white px-4 rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Domain <span className="text-gray-500">(optional)</span></label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any domain</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Business value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Business value <span className="text-gray-500">(optional)</span></label>
            <input
              type="text"
              value={businessValue}
              onChange={(e) => setBusinessValue(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Help small businesses manage inventory"
            />
          </div>

          {/* Unique aspects */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Unique aspects <span className="text-gray-500">(optional)</span></label>
            <textarea
              value={uniqueAspects}
              onChange={(e) => setUniqueAspects(e.target.value)}
              rows={2}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="e.g. AI-powered, real-time collaboration, offline support"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 text-sm transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating with AI…
              </span>
            ) : (
              'Generate project →'
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
