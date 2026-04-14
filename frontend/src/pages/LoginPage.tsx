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
    <div className="min-h-screen bg-[#060611] flex items-center justify-center px-4 relative overflow-hidden text-white">
      <div className="glow-orb w-[30rem] h-[30rem] bg-violet-500/60 -top-24 -left-24" />
      <div className="glow-orb w-[24rem] h-[24rem] bg-sky-500/45 bottom-0 -right-20" />
      <div className="glow-orb w-[20rem] h-[20rem] bg-rose-500/30 top-1/2 right-1/4" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <BrandLogo size="md" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back</h1>
          <p className="text-white/45 text-sm">Log in to continue building</p>
        </div>

        <div className="surface-glow rounded-3xl p-8 shadow-2xl shadow-violet-950/30">
          {error && (
            <div className="mb-5 text-sm text-rose-200 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.04] text-white border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-transparent placeholder:text-white/20 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] text-white border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-transparent placeholder:text-white/20 transition"
                placeholder=""
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 hover:from-violet-500 hover:via-sky-400 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-2xl px-4 py-3 text-sm transition shadow-lg shadow-violet-600/30 mt-1"
            >
              {loading ? "Logging in" : "Log in →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/35">
            No account?{" "}
            <Link to="/register" className="text-sky-300 font-bold hover:text-sky-200 transition">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
