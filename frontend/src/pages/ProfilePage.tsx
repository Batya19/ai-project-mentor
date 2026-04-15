import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import BrandLogo from "../components/BrandLogo"
import { authApi } from "../lib/api"
import { useAuthStore } from "../store/authStore"

export default function ProfilePage() {
  const fullName = useAuthStore((s) => s.fullName)
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)
  const email = useAuthStore((s) => s.email)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [name, setName] = useState(fullName ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword && !currentPassword) {
      setError("Enter your current password to set a new one.")
      return
    }

    setLoading(true)
    try {
      const data: { full_name?: string; new_password?: string; current_password?: string } = {}
      if (name !== fullName) data.full_name = name
      if (newPassword) {
        data.new_password = newPassword
        data.current_password = currentPassword
      }

      if (Object.keys(data).length === 0) {
        setSuccess("Nothing to update.")
        setLoading(false)
        return
      }

      const result = await authApi.updateProfile(data)
      // Update store with new name
      if (token && email) setAuth(token, email, result.full_name)
      setCurrentPassword("")
      setNewPassword("")
      setSuccess("Profile updated!")
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail ?? "Update failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] relative overflow-hidden text-slate-900">
      <div className="pointer-events-none">
        <div className="glow-orb w-[34rem] h-[34rem] bg-violet-300/70 -top-36 -right-36" />
        <div className="glow-orb w-[28rem] h-[28rem] bg-sky-300/60 bottom-0 -left-24" />
        <div className="glow-orb w-[18rem] h-[18rem] bg-rose-300/35 top-1/2 right-1/3" />
      </div>

      <nav className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/80 px-6 py-4 flex items-center justify-between sticky top-0">
        <Link to="/" className="inline-flex items-center">
          <BrandLogo size="sm" theme="light" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 hidden sm:block font-medium">Hi, {fullName || email}</span>
          <button onClick={() => { logout(); navigate("/login") }} className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition">Log out</button>
        </div>
      </nav>

      <main className="relative z-10 max-w-md mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-violet-600 font-semibold hover:text-violet-700 transition mb-6 inline-block">
          ← Back to dashboard
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Edit profile</h1>
        <p className="text-slate-400 text-sm mb-8">Update your name or password</p>

        {success && (
          <p className="mb-6 text-sm text-emerald-500 text-center font-medium">{success}</p>
        )}
        {error && (
          <p className="mb-6 text-sm text-rose-500 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-sm text-slate-900 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-transparent placeholder:text-slate-300 transition"
              placeholder="Your full name"
            />
          </div>

          <div className="pt-4 border-t border-slate-200/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Change Password</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="profile-current-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
                <input
                  id="profile-current-password"
                  name="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/60 backdrop-blur-sm text-slate-900 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-transparent placeholder:text-slate-300 transition"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label htmlFor="profile-new-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <input
                  id="profile-new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/60 backdrop-blur-sm text-slate-900 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-transparent placeholder:text-slate-300 transition"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 hover:from-violet-500 hover:via-sky-400 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-2xl px-4 py-4 text-sm transition-all shadow-lg shadow-violet-500/25 mt-2"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
          >
            {loading ? "Saving…" : "Save changes →"}
          </button>
        </form>
      </main>
    </div>
  )
}
