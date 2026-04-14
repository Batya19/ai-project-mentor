import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import BrandLogo from "../components/BrandLogo"
import { useAuthStore } from "../store/authStore"

/*  Terminal typing animation  */
const OUTPUT_LINES = [
  { t: "    Calling Groq llama-3.3-70b-versatile", c: "text-violet-500" },
  { t: "", c: "" },
  { t: '    Project: "Task Manager SaaS"', c: "text-slate-900" },
  { t: '     stack: ["React", "FastAPI", "PostgreSQL"]', c: "text-sky-600" },
  { t: "      Phase 1  Setup & Auth         ~8h", c: "text-slate-500" },
  { t: "      Phase 2  Core API & Models   ~14h", c: "text-slate-500" },
  { t: "      Phase 3  React Frontend      ~12h", c: "text-slate-500" },
  { t: "      Phase 4  Deploy & Polish      ~6h", c: "text-slate-500" },
  { t: "", c: "" },
  { t: "    24 tasks created. Let's build! ", c: "text-emerald-600" },
]

function Terminal() {
  const CMD = '$ generate --stack "React, FastAPI" --level junior'
  const [ti, setTi] = useState(0)
  const [oi, setOi] = useState(0)
  const done = ti >= CMD.length

  useEffect(() => {
    if (ti >= CMD.length) return
    const id = setTimeout(() => setTi((v) => v + 1), 38)
    return () => clearTimeout(id)
  }, [ti])

  useEffect(() => {
    if (!done || oi >= OUTPUT_LINES.length) return
    const id = setTimeout(() => setOi((v) => v + 1), oi === 0 ? 700 : 210)
    return () => clearTimeout(id)
  }, [done, oi])

  return (
    <div className="relative group">
      <div className="absolute -inset-3 bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-200 opacity-60 blur-3xl rounded-3xl group-hover:opacity-80 transition duration-500" />
      <div className="relative bg-white/80 border border-white/90 rounded-2xl overflow-hidden shadow-2xl shadow-violet-100/80 backdrop-blur-2xl font-mono text-xs sm:text-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 via-sky-50 to-emerald-50 border-b border-white/80">
          <span className="w-3 h-3 rounded-full bg-rose-300" />
          <span className="w-3 h-3 rounded-full bg-amber-300" />
          <span className="w-3 h-3 rounded-full bg-emerald-300" />
          <span className="ml-2 text-slate-400 text-[11px] tracking-widest uppercase">ai-mentor terminal</span>
        </div>
        <div className="p-5 min-h-[240px] leading-6 space-y-0.5">
          <div className="text-emerald-600">
            {CMD.slice(0, ti)}
            {!done && (
              <span className="inline-block w-2 h-[1em] bg-violet-400/80 ml-0.5 align-middle animate-pulse rounded-sm" />
            )}
          </div>
          {OUTPUT_LINES.slice(0, oi).map((l, i) => (
            <div key={i} className={l.c || "text-transparent select-none"}>{l.t || "\u00a0"}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

/*  Feature cards with code snippets  */
const FEATURES = [
  {
    grad: "from-violet-500 to-purple-600",
    title: "AI-Generated Roadmaps",
    snippet: `const roadmap = await ai.generate({\n  stack: ["React","FastAPI"],\n  level: "junior",\n  goals: "SaaS app"\n})`,
    desc: "Describe your level and stack  get a full phased project plan in seconds.",
  },
  {
    grad: "from-sky-500 to-cyan-500",
    title: "Real Task Tracking",
    snippet: `tasks\n  .filter(t => !t.completed)\n  .length\n//  14 remaining`,
    desc: "Phase-by-phase tasks with live progress. Watch your bar fill as you ship.",
  },
  {
    grad: "from-rose-500 to-pink-500",
    title: "Built for Your Level",
    snippet: `if (user.level === "junior")\n  depth = "guided"\nelse\n  depth = "architectural"`,
    desc: "Junior, mid, or advanced  complexity and architecture tailored for you.",
  },
]

/*  Page  */
export default function WelcomePage() {
  const token = useAuthStore((s) => s.token)

  return (
    <div className="min-h-screen bg-[#faf9ff] overflow-hidden relative text-slate-900">
      <div className="pointer-events-none select-none" aria-hidden>
        <div style={{position:"fixed",top:"-10%",left:"-10%",width:"700px",height:"700px", background:"radial-gradient(circle,rgba(167,139,250,0.42) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",top:"15%",right:"-12%",width:"600px",height:"600px", background:"radial-gradient(circle,rgba(125,211,252,0.42) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",bottom:"-5%",left:"15%",width:"650px",height:"650px", background:"radial-gradient(circle,rgba(251,182,206,0.4) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",bottom:"8%",right:"8%",width:"450px",height:"450px", background:"radial-gradient(circle,rgba(167,243,208,0.34) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",top:"50%",left:"42%",width:"350px",height:"350px", background:"radial-gradient(circle,rgba(253,230,138,0.32) 0%,transparent 70%)",zIndex:0}} />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <BrandLogo size="md" theme="light" />
        <div className="flex items-center gap-3">
          {token ? (
            <Link to="/dashboard" className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-500/30 transition">
              My dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 font-semibold transition px-3 py-2">
                Log in
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-500/30 transition">
                Get started free →
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-white/80 text-violet-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-sm shadow-violet-100/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Groq · llama-3.3-70b-versatile
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.07] mb-6">
            Your AI mentor<br />
            for {" "}
            <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              real projects
            </span>
          </h1>

          <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-md">
            Stop wondering what to build. Tell the AI your stack and experience level,
            get a complete project with phased roadmap and tasks instantly.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link to={token ? "/dashboard" : "/register"} className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-violet-500/30 transition">
              {token ? "Open dashboard →" : "Start for free →"}
            </Link>
            {!token && (
              <Link to="/login" className="bg-white/70 hover:bg-white border border-white/80 text-slate-600 hover:text-slate-900 font-semibold px-6 py-3.5 rounded-2xl text-sm transition shadow-sm shadow-violet-100/80">
                I have an account
              </Link>
            )}
          </div>
        </div>

        <Terminal />
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="group bg-white/72 hover:bg-white/86 border border-white/80 rounded-2xl p-6 flex flex-col gap-4 transition duration-300 shadow-xl shadow-violet-100/70">
              <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${f.grad}`} />
              <h3 className="text-slate-900 font-bold text-sm">{f.title}</h3>
              <pre className="text-xs leading-relaxed font-mono bg-slate-950 text-sky-200 border border-slate-800 rounded-xl p-3.5 whitespace-pre-wrap overflow-x-auto shadow-inner">
                {f.snippet}
              </pre>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-6xl mx-auto relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-violet-300/90 via-sky-300/80 to-emerald-200/80 opacity-70 blur-3xl rounded-[2.5rem]" />
          <div className="absolute left-[8%] top-8 h-32 w-32 rounded-full bg-violet-200/70 blur-3xl" />
          <div className="absolute right-[10%] bottom-8 h-36 w-36 rounded-full bg-sky-200/70 blur-3xl" />
          <div className="relative overflow-hidden bg-white/76 border border-white/85 backdrop-blur-xl rounded-[2.5rem] px-8 py-10 md:px-12 md:py-12 shadow-2xl shadow-violet-100/80">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(167,243,208,0.35),transparent_55%)]" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_bottom_left,rgba(196,181,253,0.32),transparent_58%)]" />

            <div className="relative grid gap-10 md:grid-cols-[1.3fr_0.9fr] md:items-end">
              <div className="max-w-3xl">
                <p className="text-violet-500 text-xs uppercase tracking-[0.28em] font-semibold mb-4">Ready to build?</p>
                <h2 className="text-slate-900 text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                  Pick your stack.<br />
                  <span className="bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                    Let the AI shape the plan.
                  </span>
                </h2>
                <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl">
                  Go from a rough idea to a structured build path with phases, tasks, and clear momentum from day one.
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-4">
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="rounded-full bg-white/85 border border-white/90 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm shadow-violet-100/70">Roadmaps</span>
                  <span className="rounded-full bg-white/85 border border-white/90 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm shadow-sky-100/70">Architecture</span>
                  <span className="rounded-full bg-white/85 border border-white/90 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm shadow-emerald-100/70">Tasks</span>
                </div>
                <Link to={token ? "/dashboard" : "/register"} className="inline-block bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-violet-500/30 transition">
                  {token ? "Go to dashboard →" : "Create free account →"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/70 text-center py-6 text-slate-400 text-xs">
        AI Project Mentor · Built with FastAPI + React + Groq AI
      </footer>
    </div>
  )
}
