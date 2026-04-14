import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import BrandLogo from "../components/BrandLogo"
import { useAuthStore } from "../store/authStore"

/*  Terminal typing animation  */
const OUTPUT_LINES = [
  { t: "    Calling Groq llama-3.3-70b-versatile",    c: "text-violet-400" },
  { t: "",                                                c: "" },
  { t: '    Project: "Task Manager SaaS"',              c: "text-white" },
  { t: '     stack: ["React", "FastAPI", "PostgreSQL"]', c: "text-sky-300" },
  { t: "      Phase 1  Setup & Auth         ~8h",      c: "text-slate-400" },
  { t: "      Phase 2  Core API & Models   ~14h",      c: "text-slate-400" },
  { t: "      Phase 3  React Frontend      ~12h",      c: "text-slate-400" },
  { t: "      Phase 4  Deploy & Polish      ~6h",      c: "text-slate-400" },
  { t: "",                                                c: "" },
  { t: "    24 tasks created. Let's build! ",         c: "text-emerald-400" },
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
      {/* Glow behind terminal */}
      <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-sky-600 opacity-20 blur-3xl rounded-3xl group-hover:opacity-30 transition duration-500" />
      <div className="relative bg-[#0c0b1d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/40 font-mono text-xs sm:text-sm">
        {/* title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-white/25 text-[11px] tracking-widest uppercase">ai-mentor  terminal</span>
        </div>
        {/* body */}
        <div className="p-5 min-h-[240px] leading-6 space-y-0.5">
          <div className="text-emerald-400">
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
    <div className="min-h-screen bg-[#060611] overflow-hidden relative text-white">

      {/*  Glowing radial blobs  */}
      <div className="pointer-events-none select-none" aria-hidden>
        <div style={{position:"fixed",top:"-10%",left:"-10%",width:"700px",height:"700px",
          background:"radial-gradient(circle,rgba(124,58,237,0.5) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",top:"15%",right:"-12%",width:"600px",height:"600px",
          background:"radial-gradient(circle,rgba(14,165,233,0.38) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",bottom:"-5%",left:"15%",width:"650px",height:"650px",
          background:"radial-gradient(circle,rgba(244,63,94,0.28) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",bottom:"8%",right:"8%",width:"450px",height:"450px",
          background:"radial-gradient(circle,rgba(16,185,129,0.22) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",top:"50%",left:"42%",width:"350px",height:"350px",
          background:"radial-gradient(circle,rgba(245,158,11,0.18) 0%,transparent 70%)",zIndex:0}} />
      </div>

      {/*  Nav  */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <BrandLogo size="md" />
        <div className="flex items-center gap-3">
          {token ? (
            <Link to="/dashboard"
              className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-500/30 transition">
              My dashboard 
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/50 hover:text-white font-semibold transition px-3 py-2">
                Log in
              </Link>
              <Link to="/register"
                className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-500/30 transition">
                Get started free 
              </Link>
            </>
          )}
        </div>
      </nav>

      {/*  Hero  */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-14 items-center">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Groq  llama-3.3-70b-versatile
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.07] mb-6">
            Your AI mentor<br />
            for{" "}
            <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              real projects
            </span>
          </h1>

          <p className="text-white/45 text-lg leading-relaxed mb-10 max-w-md">
            Stop wondering what to build. Tell the AI your stack and experience level 
            get a complete project with phased roadmap and tasks instantly.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to={token ? "/dashboard" : "/register"}
              className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-violet-500/30 transition">
              {token ? "Open dashboard " : "Start for free "}
            </Link>
            {!token && (
              <Link to="/login"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-semibold px-6 py-3.5 rounded-2xl text-sm transition">
                I have an account
              </Link>
            )}
          </div>
        </div>

        {/* Terminal widget */}
        <Terminal />
      </section>

      {/*  Feature cards  */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title}
              className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 transition duration-300">
              {/* colour bar */}
              <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${f.grad}`} />
              <h3 className="text-white font-bold text-sm">{f.title}</h3>
              {/* code snippet */}
              <pre className="text-xs leading-relaxed font-mono bg-black/30 border border-white/[0.07] rounded-xl p-3.5 text-sky-300 whitespace-pre-wrap overflow-x-auto">
                {f.snippet}
              </pre>
              <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/*  CTA  */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 opacity-25 blur-3xl rounded-3xl" />
          <div className="relative bg-gradient-to-br from-violet-900/50 to-sky-900/50 border border-white/10 backdrop-blur-xl rounded-3xl p-10 text-center">
            <p className="text-violet-300 text-xs uppercase tracking-widest font-semibold mb-3">Ready to build?</p>
            <h2 className="text-white text-2xl font-extrabold mb-2">Pick your stack.</h2>
            <p className="text-white/40 text-base mb-8">Let the AI do the rest.</p>
            <Link
              to={token ? "/dashboard" : "/register"}
              className="inline-block bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-bold px-8 py-3 rounded-2xl text-sm shadow-xl shadow-violet-500/30 transition">
              {token ? "Go to dashboard " : "Create free account "}
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] text-center py-6 text-white/20 text-xs">
        AI Project Mentor  Built with FastAPI + React + Groq AI
      </footer>
    </div>
  )
}
