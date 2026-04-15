import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import BrandLogo from "../components/BrandLogo"
import { authApi } from "../lib/api"
import { useAuthStore } from "../store/authStore"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await authApi.login(email, password)
      setAuth(data.access_token, email)
      navigate("/dashboard")
    } catch {
      setError("Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center px-4 py-16 relative overflow-hidden text-slate-900">
      <div className="glow-orb w-[38rem] h-[38rem] bg-violet-300/55 -top-28 -left-28" />
      <div className="glow-orb w-[30rem] h-[30rem] bg-sky-300/50 -bottom-20 -right-20" />
      <div className="glow-orb w-[20rem] h-[20rem] bg-rose-200/30 top-1/2 right-1/3" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <BrandLogo size="md" theme="light" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Pick up right where you left off</p>
        </div>

        {error && (
          <p className="mb-6 text-sm text-rose-500 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-sm text-slate-900 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-transparent placeholder:text-slate-300 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-sm text-slate-900 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-transparent placeholder:text-slate-300 transition"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 hover:from-violet-500 hover:via-sky-400 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-2xl px-4 py-4 text-sm transition-all shadow-lg shadow-violet-500/25 mt-2"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
          >
            {loading ? "Logging in…" : "Log in →"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          No account yet?{" "}
          <Link to="/register" className="text-violet-600 font-semibold hover:text-violet-700 transition">
            Sign up free →
          </Link>
        </p>
      </div>
    </div>
  )
}
