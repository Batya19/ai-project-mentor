import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const FEATURES = [
  {
    icon: '✦',
    color: 'text-teal-300',
    bg: 'bg-teal-400/10 border-teal-400/20',
    title: 'AI-Generated Roadmaps',
    desc: 'Describe your level and stack — get a full phased project plan designed by AI in seconds.',
  },
  {
    icon: '◈',
    color: 'text-violet-300',
    bg: 'bg-violet-400/10 border-violet-400/20',
    title: 'Real Task Tracking',
    desc: 'Break down each phase into tasks. Check them off as you go and watch your progress grow.',
  },
  {
    icon: '◉',
    color: 'text-rose-300',
    bg: 'bg-rose-400/10 border-rose-400/20',
    title: 'Built for Your Level',
    desc: 'Junior, mid, or advanced — the AI tailors complexity, architecture, and scope to match you.',
  },
]

export default function WelcomePage() {
  const token = useAuthStore((s) => s.token)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-violet-500/6 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-400/15 border border-teal-400/30 flex items-center justify-center">
            <span className="text-teal-300 text-sm">✦</span>
          </div>
          <span className="font-bold text-zinc-100">AI Project Mentor</span>
        </div>
        <div className="flex items-center gap-3">
          {token ? (
            <Link
              to="/dashboard"
              className="bg-teal-400/15 hover:bg-teal-400/25 text-teal-300 border border-teal-400/30 text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              Go to dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-200 transition font-medium px-3 py-2">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-teal-400/15 hover:bg-teal-400/25 text-teal-300 border border-teal-400/30 text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24">
        <div className="inline-flex items-center gap-2 bg-teal-400/8 border border-teal-400/20 text-teal-300 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Powered by Groq · llama-3.3-70b
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight max-w-3xl mb-6">
          Your AI mentor for{' '}
          <span className="text-grad">real projects</span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-xl leading-relaxed mb-10">
          Stop getting stuck wondering what to build. Describe your stack — the AI generates a complete project with phases, tasks, and a guided roadmap.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link
            to={token ? '/dashboard' : '/register'}
            className="bg-teal-400 hover:bg-teal-300 text-zinc-900 font-bold px-7 py-3 rounded-2xl text-sm transition shadow-lg shadow-teal-400/20"
          >
            {token ? 'Go to dashboard' : 'Start for free →'}
          </Link>
          {!token && (
            <Link to="/login" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition">
              Already have an account
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border p-6 flex flex-col gap-3 ${f.bg} backdrop-blur-sm`}
            >
              <span className={`text-2xl ${f.color}`}>{f.icon}</span>
              <h3 className="text-zinc-100 font-semibold text-sm">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 text-center pb-24 px-6">
        <div className="inline-block bg-zinc-900 border border-white/8 rounded-3xl px-10 py-10 max-w-lg mx-auto">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3 font-medium">Ready to ship something real?</p>
          <h2 className="text-2xl font-bold text-zinc-100 mb-5">
            Pick your stack.<br />
            <span className="text-grad">Let the AI do the rest.</span>
          </h2>
          <Link
            to={token ? '/dashboard' : '/register'}
            className="inline-block bg-teal-400 hover:bg-teal-300 text-zinc-900 font-bold px-7 py-3 rounded-2xl text-sm transition shadow-lg shadow-teal-400/15"
          >
            {token ? 'Open dashboard' : 'Create free account →'}
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 text-center py-6 text-zinc-600 text-xs">
        AI Project Mentor · Built with FastAPI + React + Groq
      </footer>
    </div>
  )
}
