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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-500/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-500/8 blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 rounded-xl bg-teal-400/15 border border-teal-400/30 flex items-center justify-center group-hover:bg-teal-400/20 transition">
              <span className="text-teal-300 text-base"></span>
            </div>
            <span className="font-bold text-zinc-300 group-hover:text-zinc-100 transition">AI Project Mentor</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">Welcome back</h1>
          <p className="text-zinc-500 mt-1 text-sm">Log in to continue building</p>
        </div>

        <div className="bg-zinc-900 border border-white/8 rounded-3xl p-8 shadow-xl">
          {error && (
            <div className="mb-5 text-sm text-rose-300 bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 text-zinc-100 border border-white/8 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/30 placeholder-zinc-600 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 text-zinc-100 border border-white/8 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/30 placeholder-zinc-600 transition"
                placeholder=""
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-zinc-900 font-bold rounded-xl px-4 py-2.5 text-sm transition shadow-lg shadow-teal-400/15 mt-2"
            >
              {loading ? "Logging in" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            No account?{" "}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium transition">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
