import { useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import BrandLogo from "../components/BrandLogo"
import { projectsApi } from "../lib/api"

const LEVELS = ["junior", "mid", "advanced"] as const
type Level = typeof LEVELS[number]

const DOMAINS = ["Web Development","Mobile App","Data Science","Machine Learning","DevOps","Cybersecurity","Game Development","API / Backend","Other"]

const LEVEL_INFO: Record<string, { desc: string; gradient: string; border: string; active: string }> = {
  junior: { desc: "0-2 yrs", gradient: "from-emerald-400 to-teal-400", border: "border-emerald-200", active: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700" },
  mid: { desc: "2-5 yrs", gradient: "from-violet-400 to-sky-400", border: "border-violet-200", active: "border-violet-300 bg-gradient-to-br from-violet-50 to-sky-50 text-violet-700" },
  advanced: { desc: "5+ yrs", gradient: "from-rose-400 to-orange-400", border: "border-rose-200", active: "border-rose-300 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-700" },
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
    const t = techInput.trim()
    if (t && !technologies.includes(t)) setTechnologies((p) => [...p, t])
    setTechInput("")
  }
  function onTechKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTech() }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!technologies.length) { setError("Add at least one technology."); return }
    setError(""); setLoading(true)
    try {
      const project = await projectsApi.generate({
        level,
        technologies,
        domain: domain || "general",
        business_value: businessValue.trim() || undefined,
        unique_aspects: uniqueAspects.trim() || undefined,
      })
      navigate(`/projects/${project.id}`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === "string") {
          setError(detail)
        } else if (Array.isArray(detail) && detail.length > 0) {
          setError(detail.map((item) => item.msg).join(". "))
        } else {
          setError("Failed to generate. Please try again.")
        }
      } else {
        setError("Failed to generate. Please try again.")
      }
    }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] relative overflow-hidden text-slate-900">
      <div className="pointer-events-none">
        <div className="glow-orb w-[34rem] h-[34rem] bg-violet-300/65 -top-36 -left-28" />
        <div className="glow-orb w-[30rem] h-[30rem] bg-sky-300/55 bottom-0 -right-24" />
        <div className="glow-orb w-[16rem] h-[16rem] bg-amber-200/40 top-1/2 right-1/4" />
      </div>

      <nav className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/80 px-6 py-4 flex items-center justify-between sticky top-0 gap-3">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 font-semibold transition">← Dashboard</Link>
        <BrandLogo size="sm" theme="light" />
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Generate a project</h1>
          <p className="text-slate-500 text-sm">Tell the AI your level and tech stack. It designs a complete roadmap just for you.</p>
        </div>

        {error && <div className="mb-5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Level */}
          <div className="surface-glow rounded-3xl p-5 shadow-2xl shadow-black/15">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Experience level</p>
            <div className="flex gap-3">
              {LEVELS.map((l) => {
                const info = LEVEL_INFO[l]
                const isActive = level === l
                return (
                  <button key={l} type="button" onClick={() => setLevel(l)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition flex flex-col items-center gap-0.5 ${isActive ? info.active : "border-slate-100 bg-white/80 text-slate-400 hover:border-slate-200"}`}
                  >
                    <span className="capitalize">{l}</span>
                    <span className={`text-xs font-normal ${isActive ? "opacity-70" : "text-slate-300"}`}>{info.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Technologies */}
          <div className="surface-glow rounded-3xl p-5 shadow-2xl shadow-black/15">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Technologies</p>
            <p className="text-xs text-slate-400 mb-3">Press Enter or comma to add a tag</p>
            {technologies.length > 0 && (
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {technologies.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 bg-violet-100 border border-violet-200 text-violet-700 text-xs px-3 py-1 rounded-full font-semibold">
                    {t}
                    <button type="button" onClick={() => setTechnologies((p) => p.filter((x) => x !== t))} className="hover:text-rose-300 transition">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={onTechKeyDown}
                className="flex-1 bg-white/80 text-slate-900 border border-white/80 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 placeholder:text-slate-300 transition"
                placeholder="React, Node.js, PostgreSQL"
              />
              <button type="button" onClick={addTech} className="bg-violet-100 hover:bg-violet-200 border border-violet-200 text-violet-700 text-sm font-bold px-4 rounded-2xl transition">
                Add
              </button>
            </div>
          </div>

          {/* Domain */}
          <div className="surface-glow rounded-3xl p-5 shadow-2xl shadow-black/15">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Domain <span className="text-slate-300 normal-case font-normal">(optional)</span></p>
            <p className="text-xs text-slate-400 mb-3">Focuses the AI on a specific area</p>
            <select value={domain} onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-white/80 text-slate-700 border border-white/80 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 transition"
            >
              <option value="">Any domain</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Business value */}
          <div className="surface-glow rounded-3xl p-5 shadow-2xl shadow-black/15">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Business value <span className="text-slate-300 normal-case font-normal">(optional)</span></p>
            <p className="text-xs text-slate-400 mb-3">What real-world problem should it solve?</p>
            <input type="text" value={businessValue} onChange={(e) => setBusinessValue(e.target.value)}
              className="w-full bg-white/80 text-slate-900 border border-white/80 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 placeholder:text-slate-300 transition"
              placeholder="e.g. Help small businesses manage inventory"
            />
          </div>

          {/* Unique aspects */}
          <div className="surface-glow rounded-3xl p-5 shadow-2xl shadow-black/15">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unique aspects <span className="text-slate-300 normal-case font-normal">(optional)</span></p>
            <p className="text-xs text-slate-400 mb-3">Special features or constraints?</p>
            <textarea value={uniqueAspects} onChange={(e) => setUniqueAspects(e.target.value)} rows={2}
              className="w-full bg-white/80 text-slate-900 border border-white/80 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 placeholder:text-slate-300 transition resize-none"
              placeholder="e.g. real-time collaboration, offline support, AI-powered"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 hover:from-violet-500 hover:via-sky-400 hover:to-emerald-400 disabled:opacity-50 text-white font-extrabold rounded-3xl px-4 py-4 text-sm transition shadow-xl shadow-violet-600/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Generating with AI
              </span>
            ) : "Generate my project →"}
          </button>
        </form>
      </main>
    </div>
  )
}
