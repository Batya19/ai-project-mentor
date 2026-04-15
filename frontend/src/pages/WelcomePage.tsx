import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import BrandLogo from "../components/BrandLogo"
import { useAuthStore } from "../store/authStore"
import { statsApi } from "../lib/api"

/* Scroll-triggered typewriter paragraph */
function TypewriterText({ text, className, delay = 0 }: { text: string; className: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setStarted(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  useEffect(() => {
    if (!started || displayed.length >= text.length) return
    const id = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), 26)
    return () => clearTimeout(id)
  }, [started, displayed, text])

  const isDone = displayed.length >= text.length

  return (
    <p ref={ref} className={`${className} relative`}>
      {/* invisible placeholder — reserves the full height so layout never shifts */}
      <span className="invisible select-none" aria-hidden="true">{text}</span>
      {/* typed text overlaid on top */}
      <span className="absolute inset-0">
        {displayed}
        {!isDone && (
          <span className="inline-block w-[2px] h-[1em] bg-violet-400 ml-[2px] align-middle animate-pulse" />
        )}
      </span>
    </p>
  )
}

/* Scroll-triggered fade-in paragraph */
function FadeInText({ text, className, delay = 0 }: { text: string; className: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <p
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {text}
    </p>
  )
}

/* Scroll-triggered scale-in element */
function ScaleInText({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <p
      ref={ref}
      className={className}
      style={{
        transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease",
        transitionDelay: `${delay}ms`,
        transform: visible ? "scale(1.35)" : "scale(0.35)",
        opacity: visible ? 1 : 0,
        transformOrigin: "left center",
        display: "inline-block",
      }}
    >
      {children}
    </p>
  )
}

/* Scroll-triggered slide-up div wrapper */
function SlideUpDiv({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease",
        transitionDelay: `${delay}ms`,
        transform: visible ? "translateY(0px)" : "translateY(32px)",
        opacity: visible ? 1 : 0,
      }}
    >
      {children}
    </div>
  )
}

/* Scroll-triggered bounce-scale div wrapper */
function BounceInDiv({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease",
        transitionDelay: `${delay}ms`,
        transform: visible ? "scale(1)" : "scale(0.6)",
        opacity: visible ? 1 : 0,
      }}
    >
      {children}
    </div>
  )
}

/*  Terminal typing animation  */
const OUTPUT_LINES = [
  { t: "    Calling Groq llama-3.3-70b-versatile", c: "text-violet-500" },
  { t: "", c: "" },
  { t: '    Project: "Task Manager SaaS"', c: "text-slate-900" },
  { t: '     stack: ["React", "FastAPI", "PostgreSQL"]', c: "text-sky-600" },
  { t: "      Phase 1  Setup & Auth         ~8h", c: "text-slate-500" },
  { t: "      Phase 2  Core API & Models   ~14h", c: "text-slate-500" },
  { t: "      Phase 3  React Frontend      ~12h", c: "text-slate-500" },
  { t: "      Phase 4  Deploy & Polish      ~6h", c: "text-slate-500" },
  { t: "", c: "" },
  { t: "    24 tasks created. Let's build! ", c: "text-emerald-600" },
]

function Terminal() {
  const CMD = '$ generate --stack "React, FastAPI" --level junior'
  const [ti, setTi] = useState(0)
  const [oi, setOi] = useState(0)
  const done = ti >= CMD.length

  useEffect(() => {
    if (ti >= CMD.length) return
    const id = setTimeout(() => setTi((v) => v + 1), 38)
    return () => clearTimeout(id)
  }, [ti])

  useEffect(() => {
    if (!done || oi >= OUTPUT_LINES.length) return
    const id = setTimeout(() => setOi((v) => v + 1), oi === 0 ? 700 : 210)
    return () => clearTimeout(id)
  }, [done, oi])

  return (
    <div className="relative group">
      <div className="absolute -inset-3 bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-200 opacity-60 blur-3xl rounded-3xl group-hover:opacity-80 transition duration-500" />
      <div className="relative bg-white/80 border border-white/90 rounded-2xl overflow-hidden shadow-2xl shadow-violet-100/80 backdrop-blur-2xl font-mono text-xs sm:text-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 via-sky-50 to-emerald-50 border-b border-white/80">
          <span className="w-3 h-3 rounded-full bg-rose-300" />
          <span className="w-3 h-3 rounded-full bg-amber-300" />
          <span className="w-3 h-3 rounded-full bg-emerald-300" />
          <span className="ml-2 text-slate-400 text-[11px] tracking-widest uppercase">ai-mentor terminal</span>
        </div>
        <div className="p-5 min-h-[240px] leading-6 space-y-0.5">
          <div className="text-emerald-600">
            {CMD.slice(0, ti)}
            {!done && (
              <span className="inline-block w-2 h-[1em] bg-violet-400/80 ml-0.5 align-middle animate-pulse rounded-sm" />
            )}
          </div>
          {OUTPUT_LINES.slice(0, oi).map((l, i) => (
            <div key={i} className={l.c || "text-transparent select-none"}>{l.t || "\u00a0"}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

/*  Feature cards with code snippets  */
const FEATURES = [
  {
    id: "01",
    grad: "from-violet-500 to-purple-600",
    title: "Know exactly what to build",
    snippet: `const roadmap = await ai.generate({\n  stack: ["React","FastAPI"],\n  level: "junior",\n  goals: "SaaS app"\n})`,
    desc: "Describe your level and stack  get a full phased project plan in seconds.",
  },
  {
    id: "02",
    grad: "from-sky-500 to-cyan-500",
    title: "Always know what to do next",
    snippet: `tasks\n  .filter(t => !t.completed)\n  .length\n//  14 remaining`,
    desc: "Phase-by-phase tasks with live progress. Watch your bar fill as you ship.",
  },
  {
    id: "03",
    grad: "from-rose-500 to-pink-500",
    title: "Projects tailored to your real skill level",
    snippet: `if (user.level === "junior")\n  depth = "guided"\nelse\n  depth = "architectural"`,
    desc: "Junior, mid, or advanced  complexity and architecture tailored for you.",
  },
]

/*  Page  */
export default function WelcomePage() {
  const token = useAuthStore((s) => s.token)
  const [totalProjects, setTotalProjects] = useState<number | null>(null)

  useEffect(() => {
    statsApi.get().then((d) => setTotalProjects(d.total_projects)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#faf9ff] overflow-hidden relative text-slate-900">
      <div className="pointer-events-none select-none" aria-hidden>
        <div style={{position:"fixed",top:"-10%",left:"-10%",width:"700px",height:"700px", background:"radial-gradient(circle,rgba(167,139,250,0.42) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",top:"15%",right:"-12%",width:"600px",height:"600px", background:"radial-gradient(circle,rgba(125,211,252,0.42) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",bottom:"-5%",left:"15%",width:"650px",height:"650px", background:"radial-gradient(circle,rgba(251,182,206,0.4) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",bottom:"8%",right:"8%",width:"450px",height:"450px", background:"radial-gradient(circle,rgba(167,243,208,0.34) 0%,transparent 70%)",zIndex:0}} />
        <div style={{position:"fixed",top:"50%",left:"42%",width:"350px",height:"350px", background:"radial-gradient(circle,rgba(253,230,138,0.32) 0%,transparent 70%)",zIndex:0}} />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <BrandLogo size="md" theme="light" />
        <div className="flex items-center gap-3">
          {token ? (
            <Link to="/dashboard" className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-500/30 transition">
              My dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 font-semibold transition px-3 py-2">
                Log in
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-500/30 transition">
                Get started free →
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur border border-white/60 text-slate-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8 shadow-sm shadow-violet-100/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by AI
          </div>

          <p className="text-violet-500 text-xs uppercase tracking-[0.28em] font-semibold mb-4">For developers who want to build real projects</p>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.07] mb-6">
            Stop wondering<br />what to build.<br />
            <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Start building — with a plan.
            </span>
          </h1>

          <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-md">
            Your next project — planned, structured, and ready to build in seconds.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link to={token ? "/dashboard" : "/register"} className="bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-violet-500/30 transition" style={{textShadow:"0 1px 3px rgba(0,0,0,0.25)"}}>
              {token ? "Open dashboard →" : "Start building →"}
            </Link>
            {!token && (
              <Link to="/login" className="bg-white/70 hover:bg-white border border-white/80 text-slate-600 hover:text-slate-900 font-semibold px-6 py-3.5 rounded-2xl text-sm transition shadow-sm shadow-violet-100/80">
                Log in →
              </Link>
            )}
          </div>
        </div>

        <div>
          <Terminal />
          <p className="mt-5 text-center text-sm text-slate-500 font-medium tracking-wide">
            Real projects.&nbsp; Real structure.&nbsp; No guesswork.
          </p>
        </div>
      </section>

      {/* ── Live stats section ── */}
      <section className="relative z-10 py-14 px-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-200/50 to-transparent" />
        <div className="absolute left-[12%] top-10 h-52 w-52 rounded-full bg-violet-200/45 blur-3xl" />
        <div className="absolute right-[10%] top-16 h-60 w-60 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute left-1/2 bottom-8 h-44 w-44 -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">

          <SlideUpDiv>
            <div className="relative grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
              <div className="mb-2 flex items-center gap-4 md:mb-0 md:justify-self-start">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <span className="absolute h-16 w-16 rounded-full bg-emerald-300/18" />
                  <span className="absolute h-11 w-11 rounded-full border border-emerald-300/45" />
                  <span className="absolute h-6 w-6 rounded-full border border-emerald-400/60" />
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_26px_rgba(16,185,129,0.65)] animate-pulse" />
                </div>
                <div className="text-left max-w-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-600/85 mb-1">Verified live data</p>
                  <p className="text-slate-400 text-sm font-medium">Pulled directly from generated roadmaps</p>
                </div>
              </div>

              <div className="text-center md:text-right md:justify-self-end">
                <p className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent tabular-nums leading-none">
                  {totalProjects === null ? "--" : totalProjects}
                </p>
                <p className="mt-3 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-xl md:max-w-sm md:ml-auto">
                  {totalProjects === null
                    ? "Loading live roadmap count…"
                    : totalProjects === 0
                    ? "Be the first to generate a roadmap"
                    : `roadmap${totalProjects === 1 ? "" : "s"} generated so far`}
                </p>
              </div>
            </div>
          </SlideUpDiv>


        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-14 max-w-2xl">
          <SlideUpDiv>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-violet-500 mb-3">What You Get</p>
          </SlideUpDiv>
          <SlideUpDiv delay={100}>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              This isn't another idea generator.<br />
              <span className="bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                It's your execution system.
              </span>
            </h2>
          </SlideUpDiv>
          <TypewriterText
            text="The plan, the tasks, and the level guidance should feel like part of the atmosphere — not boxed widgets dropped into a template."
            className="text-slate-500 text-base sm:text-lg leading-relaxed"
          />
        </div>

        <div className="relative">
          <div className="absolute left-[8%] top-10 h-40 w-40 rounded-full bg-violet-200/55 blur-3xl" />
          <div className="absolute right-[16%] top-24 h-44 w-44 rounded-full bg-sky-200/45 blur-3xl" />
          <div className="absolute left-1/2 bottom-0 h-48 w-48 -translate-x-1/2 rounded-full bg-rose-200/40 blur-3xl" />

          <div className="relative grid grid-cols-1 md:grid-cols-[1.05fr_0.85fr_1.1fr] gap-10 md:gap-4">
            {FEATURES.map((f, index) => (
              <div key={f.title} className={`group relative min-h-[22rem] flex flex-col justify-start ${index === 0 ? "md:pt-10" : index === 1 ? "md:-mt-8" : "md:pt-20"}`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`h-1.5 w-14 rounded-full bg-gradient-to-r ${f.grad} shadow-[0_0_26px_rgba(139,92,246,0.28)]`} />
                  <span className="text-[11px] font-bold tracking-[0.24em] text-slate-400">{f.id}</span>
                </div>

                <div className={`absolute ${index === 1 ? "right-4 top-16" : "left-0 top-14"} h-32 w-32 rounded-full bg-gradient-to-br ${f.grad} opacity-12 blur-3xl transition duration-500 group-hover:opacity-20`} />

                <SlideUpDiv delay={index * 100}>
                  <h3 className="relative text-slate-900 font-extrabold text-2xl leading-tight max-w-[14rem] mb-6">
                    {f.title}
                  </h3>
                </SlideUpDiv>

                <SlideUpDiv delay={index * 100 + 80}>
                  <div className={`relative mb-7 ${index === 1 ? "ml-6" : index === 2 ? "ml-10" : "ml-1"}`}>
                    <div className={`absolute ${index === 1 ? "-left-6 top-6 rotate-[-8deg]" : index === 2 ? "right-10 -top-4 rotate-[7deg]" : "left-8 -top-5 rotate-[8deg]"} h-24 w-36 rounded-[1.6rem] bg-slate-900/8 backdrop-blur-sm`} />
                    <div className={`absolute -inset-3 rounded-[2rem] bg-gradient-to-r ${f.grad} opacity-20 blur-2xl`} />
                    <pre className={`relative ${index === 0 ? "float-snippet-a max-w-[18rem] rotate-[-3deg]" : index === 1 ? "float-snippet-b max-w-[16.25rem] rotate-[3deg]" : "float-snippet-c max-w-[17.5rem] rotate-[-4deg]"} text-xs sm:text-[13px] leading-8 font-mono text-slate-50 bg-slate-950/96 rounded-[1.75rem] px-5 py-4 whitespace-pre-wrap overflow-x-auto shadow-[0_24px_60px_rgba(15,23,42,0.32)]`}>
                      {f.snippet}
                    </pre>
                  </div>
                </SlideUpDiv>

                <FadeInText
                  text={f.desc}
                  className="relative text-slate-500 text-base leading-relaxed max-w-[16rem]"
                  delay={index * 120}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-6xl mx-auto relative">
          <div className="absolute left-[6%] top-8 h-40 w-40 rounded-full bg-violet-200/70 blur-3xl" />
          <div className="absolute right-[12%] top-24 h-44 w-44 rounded-full bg-sky-200/65 blur-3xl" />
          <div className="absolute left-[32%] bottom-2 h-36 w-36 rounded-full bg-emerald-200/55 blur-3xl" />

          <div className="relative grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="relative max-w-3xl">
              <ScaleInText className="text-violet-500 text-xs uppercase tracking-[0.28em] font-semibold mb-5">Ready to build?</ScaleInText>
              <SlideUpDiv delay={150}>
                <h2 className="text-slate-900 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.02] mb-5">
                  Your next project is already planned.
                  <br />
                  <span className="bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                    All that's left is to build it.
                  </span>
                </h2>
              </SlideUpDiv>
              <p className="text-slate-400 text-sm mb-6 mt-1">No more unfinished projects.</p>
              <TypewriterText
                text="Go from a rough idea to a structured build path with phases, tasks, and clear momentum from day one."
                className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl"
              />
            </div>

            <BounceInDiv className="flex items-center justify-center" delay={300}>
              <Link to={token ? "/dashboard" : "/register"} className="inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-violet-500/30 transition" style={{textShadow:"0 1px 3px rgba(0,0,0,0.25)"}}>
                {token ? "Go to dashboard →" : "Get my project plan →"}
              </Link>
            </BounceInDiv>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/70 text-center py-6 text-slate-400 text-xs">
        AI Project Mentor · Built with FastAPI + React + Groq AI
      </footer>
    </div>
  )
}
