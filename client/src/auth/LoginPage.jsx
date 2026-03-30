import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const features = [
  {
    title: 'Streamlined Incubation',
    description:
      'Accelerate from concept to market using one unified workflow for submissions, reviews, and approvals.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: 'Faculty Mentorship',
    description:
      'Bring faculty, evaluators, and incubatees into a shared decision flow with clear progress signals.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 11v5c0 1 3 3 7 3s7-2 7-3v-5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: 'Seamless Admin Control',
    description:
      'Track presentations, stages, and governance actions with role-specific visibility and accountability.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 2l8 4v6c0 5-3.5 8.3-8 10-4.5-1.7-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
]

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const roleRouteByEmail = {
    'admin@launchpadcicf.in': '/admin/dashboard',
    'faculty@launchpadcicf.in': '/faculty/dashboard',
    'incubatee@launchpadcicf.in': '/incubatee/dashboard',
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    setTimeout(() => {
      setIsLoading(false)
      const normalizedEmail = email.trim().toLowerCase()
      const destinationRoute = roleRouteByEmail[normalizedEmail]

      if (!destinationRoute || password !== 'LaunchPad@123') {
        setError('Invalid credentials. Please check your email or password.')
        return
      }

      navigate(destinationRoute)
    }, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="relative overflow-hidden bg-lp-navy px-8 py-14 text-white md:w-5/12 md:px-12 lg:w-1/2 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.22),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.08),transparent_35%)]" aria-hidden="true" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-[3.5rem] border border-white/10 bg-white/5" aria-hidden="true" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-[3rem] border border-white/10 bg-lp-gold/10" aria-hidden="true" />

        <div className="relative mx-auto flex max-w-lg flex-col justify-center md:h-full md:py-10">
          <header className="animate-fade-left">
            <BrandLogo textClassName="text-white" />
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              LaunchPad <span className="text-lp-gold">CICF</span>
            </h1>
            <p className="mt-3 text-base text-lp-muted sm:text-lg">Where ideas take off</p>
          </header>

          <div className="mt-10 space-y-6 md:mt-12">
            {features.map((feature) => (
              <article key={feature.title} className="animate-fade-left rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm [animation-delay:120ms]">
                <div className="flex gap-4">
                  <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lp-gold/15 text-lp-gold">
                    {feature.icon}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-white">{feature.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-lp-muted">{feature.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#F6F8FC] px-5 py-8 md:w-7/12 md:px-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-xl animate-fade-up">
          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert" aria-live="polite">
              {error}
            </div>
          ) : null}

          <div className="rounded-3xl bg-white p-7 shadow-panel sm:p-10">
            <header>
              <BrandLogo compact className="mb-4" />
              <h2 className="font-display text-3xl font-bold text-lp-navy">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-600">
                Sign in to access your incubation workspace.
              </p>
            </header>

            <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                <p className="font-semibold uppercase tracking-[0.1em] text-slate-500">Demo Accounts</p>
                <p className="mt-1">admin@launchpadcicf.in, faculty@launchpadcicf.in, incubatee@launchpadcicf.in</p>
                <p className="mt-1">Password: LaunchPad@123</p>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="lp-focus w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                  placeholder="name@cicf.org"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="lp-focus w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-20 text-slate-900 placeholder:text-slate-400"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="lp-focus absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-lp-navy"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-lp-gold focus:ring-lp-gold"
                    disabled={isLoading}
                  />
                  Remember for 30 days
                </label>
                <Link
                  to="/forgot-password"
                  className="lp-focus rounded-md text-sm font-semibold text-lp-navy underline decoration-lp-gold/60 underline-offset-4 hover:text-lp-gold"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="lp-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lp-gold px-4 py-3.5 font-semibold text-lp-navy shadow-lg shadow-lp-gold/30 transition hover:-translate-y-0.5 hover:bg-[#d8b764] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" className="opacity-25" stroke="currentColor" strokeWidth="3" />
                      <path d="M21 12a9 9 0 0 1-9 9" className="opacity-75" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs leading-6 text-slate-500">
              Need technical assistance or system access?
              <br />
              Contact the support team at support@launchpadcicf.in
            </div>
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.16em] text-slate-500">
            <BrandLogo compact className="opacity-80" />
            <div className="flex items-center gap-5">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookies</span>
            </div>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default LoginPage