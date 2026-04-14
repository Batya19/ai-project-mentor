import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
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
    <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center px-4 relative overflow-hidden">
      {/* blobs */}
      <div className="blob w-96 h-96 bg-violet-300 -top-20 -left-20" style={{position:"fixed"}} />
      <div className="blob w-80 h-80 bg-sky-200 bottom-0 -right-20" style={{position:"fixed"}} />
      <div className="blob w-64 h-64 bg-rose-200 top-1/2 right-1/4" style={{position:"fixed", borderRadius:"40% 60% 70% 30% / 60% 30% 70% 40%"}} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center shadow-lg shadow-violet-200 group-hover:shadow-violet-300 transition">
              <span className="text-white font-bold"></span>
            </div>
            <span className="font-extrabold text-slate-800 tracking-tight group-hover:text-violet-600 transition">AI Project Mentor</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Welcome back </h1>
          <p className="text-slate-400 text-sm">Log in to continue building</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-8 shadow-xl shadow-violet-100">
          {error && (
            <div className="mb-5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-transparent placeholder-slate-300 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-transparent placeholder-slate-300 transition"
                placeholder=""
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 disabled:opacity-50 text-white font-bold rounded-2xl px-4 py-3 text-sm transition shadow-lg shadow-violet-200 mt-1"
            >
              {loading ? "Logging in" : "Log in "}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            No account?{" "}
            <Link to="/register" className="text-violet-600 font-bold hover:text-violet-700 transition">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
