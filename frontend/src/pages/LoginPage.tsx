import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import BrandLogo from "../components/BrandLogo"
import { authApi } from "../lib/api"
import { useAuthStore } from "../store/authStore"

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const justVerified = searchParams.get("verified") === "1"
  const justReset = searchParams.get("reset") === "1"
  const emailParam = searchParams.get("email") ?? ""
  const [email, setEmail] = useState(emailParam)
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
      setAuth(data.access_token, email, data.full_name || '')
      navigate("/dashboard")
    } catch {
      setError("Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center px-4 py-16 relative overflow-hidden text-slate-900">
      <div className="glow-orb w-[38rem] h-[38rem] bg-sky-300/50 -top-28 -right-28" />
      <div className="glow-orb w-[30rem] h-[30rem] bg-violet-300/60 -bottom-20 -left-20" />
      <div className="glow-orb w-[20rem] h-[20rem] bg-emerald-200/35 top-1/2 left-1/3" />

      <Link to="/" className="absolute top-6 left-6 z-20">
        <BrandLogo size="sm" theme="light" />
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-slate-900">Welcome </span>
            <span className="text-shimmer">back</span>
          </h1>
          <p className="text-slate-400 text-sm">Pick up right where you left off</p>
        </div>

        {justVerified && (
          <p className="mb-6 text-sm text-emerald-500 text-center font-medium">Email verified! Log in to continue.</p>
        )}
        {justReset && (
          <p className="mb-6 text-sm text-emerald-500 text-center font-medium">Password reset! Log in with your new password.</p>
        )}
        {error && (
          <p className="mb-6 text-sm text-rose-500 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-sm text-slate-900 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-transparent placeholder:text-slate-300 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-sm text-slate-900 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-transparent placeholder:text-slate-300 transition"
              placeholder="Your password"
            />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-violet-500 font-medium hover:text-violet-600 transition">
              Forgot password?
            </Link>
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
