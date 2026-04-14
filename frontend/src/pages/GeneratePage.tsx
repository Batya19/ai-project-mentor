import { useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { projectsApi } from "../lib/api"

const LEVELS = ["junior", "mid", "advanced"] as const
type Level = typeof LEVELS[number]

const DOMAINS = [
  "Web Development", "Mobile App", "Data Science", "Machine Learning",
  "DevOps", "Cybersecurity", "Game Development", "API / Backend", "Other",
]

const LEVEL_INFO: Record<string, { desc: string; color: string; active: string }> = {
  junior: { desc: "02 yrs", color: "text-teal-300", active: "border-teal-400/50 bg-teal-400/10 text-teal-300" },
  mid:    { desc: "25 yrs", color: "text-amber-300", active: "border-amber-400/50 bg-amber-400/10 text-amber-300" },
  advanced: { desc: "5+ yrs", color: "text-rose-300", active: "border-rose-400/50 bg-rose-400/10 text-rose-300" },
}

export default function GeneratePage() {
  const [level, setLevel] = useState<Level>("mid")
  const [technologies, setTechnologies] = useState<string[]>([])
  const [techInput, setTechInput] = useState("")
  const [domain, setDomain] = useState("")
  const [businessValue, setBusinessValue] = useState("")
  const [uniqueAspects, setUniqueAspects] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  function addTech() {
    const trimmed = techInput.trim()
    if (trimmed && !technologies.includes(trimmed)) setTechnologies((p) => [...p, trimmed])
    setTechInput("")
  }

  function onTechKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTech() }
  }

  function removeTech(t: string) {
    setTechnologies((p) => p.filter((x) => x !== t))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (technologies.length === 0) { setError("Add at least one technology."); return }
    setError(""); setLoading(true)
    try {
      const project = await projectsApi.generate({ level, technologies, domain: domain || undefined })
      navigate(`/projects/${project.id}`)
    } catch {
      setError("Failed to generate project. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-white/6 px-6 py-4 flex items-center gap-3 sticky top-0 z-10 bg-zinc-950/80 backdrop-blur">
        <Link to="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-200 transition font-medium">
           Dashboard
        </Link>
        <span className="text-zinc-800">|</span>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-teal-400/15 border border-teal-400/25 rounded-md flex items-center justify-center">
            <span className="text-teal-300 text-xs"></span>
          </div>
          <span className="font-semibold text-zinc-400 text-sm">Generate Project</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100 mb-1">Generate a project</h1>
          <p className="text-zinc-500 text-sm">Tell the AI your level and stack  it designs a complete project with roadmap and tasks.</p>
        </div>

        {error && (
          <div className="mb-5 text-sm text-rose-300 bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Level */}
          <div className="bg-zinc-900 border border-white/6 rounded-2xl p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Experience level</p>
            <div className="flex gap-3">
              {LEVELS.map((l) => {
                const info = LEVEL_INFO[l]
                const isActive = level === l
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-semibold border transition flex flex-col items-center gap-0.5 ${
                      isActive ? info.active : "border-white/6 bg-zinc-800 text-zinc-500 hover:border-white/12"
                    }`}
                  >
                    <span className="capitalize">{l}</span>
                    <span className={`text-xs font-normal ${isActive ? "opacity-70" : "text-zinc-700"}`}>{info.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-zinc-900 border border-white/6 rounded-2xl p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Technologies</p>
            <p className="text-xs text-zinc-600 mb-3">Press Enter or comma to add</p>
            {technologies.length > 0 && (
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {technologies.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 bg-teal-400/10 border border-teal-400/25 text-teal-300 text-xs px-3 py-1 rounded-full font-medium">
                    {t}
                    <button type="button" onClick={() => removeTech(t)} className="hover:text-rose-400 transition"></button>
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
                className="flex-1 bg-zinc-800 text-zinc-100 border border-white/6 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder-zinc-600 transition"
                placeholder="React, Node.js, PostgreSQL"
              />
              <button type="button" onClick={addTech} className="bg-teal-400/10 hover:bg-teal-400/20 border border-teal-400/25 text-teal-300 text-sm font-medium px-4 rounded-xl transition">
                Add
              </button>
            </div>
          </div>

          {/* Domain */}
          <div className="bg-zinc-900 border border-white/6 rounded-2xl p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Domain <span className="text-zinc-700 normal-case font-normal">(optional)</span></p>
            <p className="text-xs text-zinc-600 mb-3">Helps the AI focus on a specific area</p>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-zinc-800 text-zinc-300 border border-white/6 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 transition"
            >
              <option value="">Any domain</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Business value */}
          <div className="bg-zinc-900 border border-white/6 rounded-2xl p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Business value <span className="text-zinc-700 normal-case font-normal">(optional)</span></p>
            <p className="text-xs text-zinc-600 mb-3">What real-world problem should it solve?</p>
            <input
              type="text"
              value={businessValue}
              onChange={(e) => setBusinessValue(e.target.value)}
              className="w-full bg-zinc-800 text-zinc-100 border border-white/6 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder-zinc-600 transition"
              placeholder="e.g. Help small businesses manage inventory"
            />
          </div>

          {/* Unique aspects */}
          <div className="bg-zinc-900 border border-white/6 rounded-2xl p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Unique aspects <span className="text-zinc-700 normal-case font-normal">(optional)</span></p>
            <p className="text-xs text-zinc-600 mb-3">Special features or constraints?</p>
            <textarea
              value={uniqueAspects}
              onChange={(e) => setUniqueAspects(e.target.value)}
              rows={2}
              className="w-full bg-zinc-800 text-zinc-100 border border-white/6 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder-zinc-600 transition resize-none"
              placeholder="e.g. real-time collaboration, offline support, AI-powered"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-zinc-900 font-bold rounded-2xl px-4 py-3.5 text-sm transition shadow-lg shadow-teal-400/15"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating with AI
              </span>
            ) : "Generate project "}
          </button>
        </form>
      </main>
    </div>
  )
}
