import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import BrandLogo from "../components/BrandLogo"
import { authApi } from "../lib/api"

export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get("email") ?? ""
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await authApi.verifyOtp(emailParam, code)
      // Auto-login after verification — prompt for password
      navigate(`/login?verified=1&email=${encodeURIComponent(emailParam)}`)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      const msg = typeof detail === "string" ? detail : "Invalid or expired code. Try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResendMsg("")
    setError("")
    try {
      await authApi.resendOtp(emailParam)
      setResendMsg("New code sent! Check your inbox.")
    } catch {
      setError("Could not resend code. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center px-4 py-16 relative overflow-hidden text-slate-900">
      <div className="glow-orb w-[38rem] h-[38rem] bg-violet-300/55 -top-28 -left-28" />
      <div className="glow-orb w-[30rem] h-[30rem] bg-sky-300/50 -bottom-20 -right-20" />
      <div className="glow-orb w-[20rem] h-[20rem] bg-emerald-200/35 top-1/2 right-1/3" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <BrandLogo size="md" theme="light" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Verify your email</h1>
          <p className="text-slate-400 text-sm">
            We sent a 6-digit code to <span className="font-semibold text-slate-600">{emailParam}</span>
          </p>
        </div>

        {error && (
          <p className="mb-6 text-sm text-rose-500 text-center font-medium">{error}</p>
        )}
        {resendMsg && (
          <p className="mb-6 text-sm text-emerald-500 text-center font-medium">{resendMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="verify-code" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Verification Code</label>
            <input
              id="verify-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full bg-white/60 backdrop-blur-sm text-slate-900 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-transparent placeholder:text-slate-300 transition"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 hover:from-violet-500 hover:via-sky-400 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-2xl px-4 py-4 text-sm transition-all shadow-lg shadow-violet-500/25 mt-2"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
          >
            {loading ? "Verifying…" : "Verify email →"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={handleResend}
            className="text-sm text-violet-600 font-semibold hover:text-violet-700 transition"
          >
            Didn't get a code? Resend →
          </button>
        </div>
      </div>
    </div>
  )
}
