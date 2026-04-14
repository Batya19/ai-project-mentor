import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import BrandLogo from "../components/BrandLogo"
import { authApi } from "../lib/api"
import { useAuthStore } from "../store/authStore"

export default function RegisterPage() {
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
      await authApi.register(email, password)
      const data = await authApi.login(email, password)
      setAuth(data.access_token, email)
      navigate("/dashboard")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060611] flex items-center justify-center px-4 relative overflow-hidden text-white">
      <div className="glow-orb w-[30rem] h-[30rem] bg-sky-500/45 -top-20 -right-20" />
      <div className="glow-orb w-[24rem] h-[24rem] bg-violet-500/55 bottom-0 -left-20" />
      <div className="glow-orb w-[18rem] h-[18rem] bg-amber-400/20 top-1/3 left-1/4" />
      <div className="glow-orb w-[16rem] h-[16rem] bg-emerald-400/20 bottom-1/4 right-1/4" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <BrandLogo size="md" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white mb-1">Create your account</h1>
          <p className="text-white/45 text-sm">Start building real projects with AI guidance</p>
        </div>

        <div className="surface-glow rounded-3xl p-8 shadow-2xl shadow-sky-950/30">
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
                className="w-full bg-white/[0.04] text-white border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-transparent placeholder:text-white/20 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] text-white border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-transparent placeholder:text-white/20 transition"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 hover:from-violet-500 hover:via-sky-400 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-2xl px-4 py-3 text-sm transition shadow-lg shadow-violet-600/30 mt-1"
            >
              {loading ? "Creating account" : "Sign up free →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/35">
            Already have an account?{" "}
            <Link to="/login" className="text-sky-300 font-bold hover:text-sky-200 transition">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
