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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium">
          ← Dashboard
        </Link>
        <span className="text-slate-200">|</span>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-violet-100 rounded-md flex items-center justify-center text-xs">✦</div>
          <span className="font-semibold text-slate-700 text-sm">Generate Project</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Generate a project idea</h1>
          <p className="text-slate-500 text-sm">
            Tell the AI your level and tech stack — it will design a custom project with a full roadmap.
          </p>
        </div>

        {error && (
          <div className="mb-5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Level */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Experience level</label>
            <div className="flex gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
                    level === l
                      ? 'border-violet-300 bg-violet-50 text-violet-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Technologies</label>
            <p className="text-xs text-slate-400 mb-3">Press Enter or comma to add a tag</p>
            {technologies.length > 0 && (
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {technologies.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-700 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    {t}
                    <button type="button" onClick={() => removeTech(t)} className="hover:text-rose-500 ml-0.5 transition">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={onTechKeyDown}
                className="flex-1 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder-slate-400 transition"
                placeholder="e.g. React, Node.js, PostgreSQL"
              />
              <button
                type="button"
                onClick={addTech}
                className="bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 text-sm font-medium px-4 rounded-xl transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Domain */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Domain <span className="text-slate-400 font-normal">(optional)</span></label>
            <p className="text-xs text-slate-400 mb-3">Focuses the AI on a specific area</p>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
            >
              <option value="">Any domain</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Business value */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Business value <span className="text-slate-400 font-normal">(optional)</span></label>
            <p className="text-xs text-slate-400 mb-3">What real-world problem should it solve?</p>
            <input
              type="text"
              value={businessValue}
              onChange={(e) => setBusinessValue(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder-slate-400 transition"
              placeholder="e.g. Help small businesses manage inventory"
            />
          </div>

          {/* Unique aspects */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Unique aspects <span className="text-slate-400 font-normal">(optional)</span></label>
            <p className="text-xs text-slate-400 mb-3">Any special features or constraints?</p>
            <textarea
              value={uniqueAspects}
              onChange={(e) => setUniqueAspects(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder-slate-400 transition resize-none"
              placeholder="e.g. AI-powered, real-time collaboration, offline support"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 text-sm transition shadow-sm"
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
