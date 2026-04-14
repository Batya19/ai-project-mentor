import { Link } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const FEATURES = [
  {
    emoji: "",
    gradient: "from-violet-100 to-purple-50",
    border: "border-violet-200",
    accent: "bg-violet-500",
    title: "AI-Generated Roadmaps",
    desc: "Describe your level and stack  the AI designs a full phased project plan in seconds.",
  },
  {
    emoji: "",
    gradient: "from-sky-100 to-cyan-50",
    border: "border-sky-200",
    accent: "bg-sky-500",
    title: "Real Task Tracking",
    desc: "Phase-by-phase tasks with checkboxes. Watch your progress bar fill as you ship.",
  },
  {
    emoji: "",
    gradient: "from-rose-100 to-pink-50",
    border: "border-rose-200",
    accent: "bg-rose-500",
    title: "Built for Your Level",
    desc: "Junior, mid, or advanced  the AI tailors complexity and architecture exactly for you.",
  },
]

const STACK = ["React", "FastAPI", "PostgreSQL", "Groq AI", "TypeScript", "TailwindCSS"]

export default function WelcomePage() {
  const token = useAuthStore((s) => s.token)

  return (
    <div className="min-h-screen bg-[#faf9ff] overflow-hidden relative">

      {/*  Background blobs  */}
      <div className="pointer-events-none select-none">
        <div className="blob w-[500px] h-[500px] bg-violet-300 -top-32 -left-40" style={{position:"fixed"}} />
        <div className="blob w-[400px] h-[400px] bg-sky-300 top-1/3 -right-32" style={{position:"fixed"}} />
        <div className="blob w-[350px] h-[350px] bg-rose-200 bottom-0 left-1/4" style={{position:"fixed"}} />
        <div className="blob w-[300px] h-[300px] bg-amber-200 -bottom-20 right-1/4" style={{position:"fixed"}} />
        <div className="blob w-[250px] h-[250px] bg-emerald-200 top-1/2 left-1/2" style={{position:"fixed", borderRadius:"70% 30% 50% 60% / 40% 70% 30% 60%"}} />
      </div>

      {/*  Nav  */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center shadow-lg shadow-violet-200">
            <span className="text-white text-lg font-bold"></span>
          </div>
          <span className="font-extrabold text-slate-800 text-base tracking-tight">AI Project Mentor</span>
        </div>
        <div className="flex items-center gap-3">
          {token ? (
            <Link to="/dashboard" className="bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-200 transition">
              My dashboard 
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-500 hover:text-slate-800 font-semibold transition px-3 py-2">
                Log in
              </Link>
              <Link to="/register" className="bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-200 transition">
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/*  Hero  */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-violet-200 text-violet-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Powered by Groq  llama-3.3-70b-versatile
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mb-6 text-slate-800">
          Your AI mentor<br />
          for{" "}
          <span className="text-grad-pastel">real projects</span>
        </h1>

        <p className="text-slate-500 text-lg max-w-lg leading-relaxed mb-10">
          Stop wondering what to build. Tell the AI your stack and experience level,
          and get a complete project with a phased roadmap and tasks  instantly.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center mb-16">
          <Link
            to={token ? "/dashboard" : "/register"}
            className="bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-violet-200 transition"
          >
            {token ? "Open dashboard " : "Start for free "}
          </Link>
          {!token && (
            <Link to="/login" className="bg-white/80 backdrop-blur border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-6 py-3.5 rounded-2xl text-sm shadow-sm transition">
              I have an account
            </Link>
          )}
        </div>

        {/* Tech stack strip */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {STACK.map((s) => (
            <span key={s} className="bg-white/70 backdrop-blur border border-white/80 text-slate-500 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/*  Feature cards  */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className={`card-lift bg-gradient-to-br ${f.gradient} border ${f.border} rounded-3xl p-6 flex flex-col gap-4 shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">
                  {f.emoji}
                </div>
                <div className={`h-1 flex-1 rounded-full ${f.accent} opacity-30`} />
              </div>
              <div>
                <h3 className="text-slate-800 font-bold text-sm mb-1.5">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*  Bottom CTA  */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-violet-500 to-sky-500 rounded-3xl p-10 text-center shadow-2xl shadow-violet-200 relative overflow-hidden">
          {/* inner decoration blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <p className="text-violet-100 text-xs uppercase tracking-widest font-semibold mb-3">Ready to build?</p>
          <h2 className="text-white text-2xl font-extrabold mb-2">Pick your stack.</h2>
          <p className="text-violet-100 text-base font-medium mb-8">Let the AI do the rest.</p>
          <Link
            to={token ? "/dashboard" : "/register"}
            className="inline-block bg-white hover:bg-violet-50 text-violet-600 font-bold px-8 py-3 rounded-2xl text-sm shadow-lg transition"
          >
            {token ? "Go to dashboard " : "Create free account "}
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/60 text-center py-6 text-slate-400 text-xs">
        AI Project Mentor  Built with FastAPI + React + Groq AI
      </footer>
    </div>
  )
}
