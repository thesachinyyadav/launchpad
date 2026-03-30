import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const vaultNotes = [
  {
    title: 'Encrypted Recovery',
    body: 'Reset links are short-lived and protected to keep account access secure.',
  },
  {
    title: 'Identity Verification',
    body: 'Password updates require token validation and policy-compliant credentials.',
  },
]

const spinner = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" className="opacity-25" stroke="currentColor" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 1-9 9" className="opacity-75" stroke="currentColor" strokeWidth="3" />
  </svg>
)

function RuleRow({ label, passed }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${passed ? 'text-emerald-700' : 'text-slate-500'}`}>
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
          passed
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-300 bg-white text-slate-400'
        }`}
        aria-hidden="true"
      >
        {passed ? '✓' : '•'}
      </span>
      {label}
    </li>
  )
}

function ForgotResetPage() {
  const [view, setView] = useState('forgot')

  const [email, setEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState('idle')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tokenMode, setTokenMode] = useState('valid')
  const [resetStatus, setResetStatus] = useState('idle')

  const passwordRules = useMemo(
    () => ({
      minLength: newPassword.length >= 12,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    }),
    [newPassword],
  )

  const passwordValid = Object.values(passwordRules).every(Boolean)
  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword

  const submitForgot = (event) => {
    event.preventDefault()
    setForgotStatus('loading')

    setTimeout(() => {
      if (!email.trim() || !email.includes('@')) {
        setForgotStatus('error')
        return
      }

      setForgotStatus('success')
    }, 900)
  }

  const submitReset = (event) => {
    event.preventDefault()

    if (!passwordValid || passwordMismatch) {
      return
    }

    setResetStatus('loading')

    setTimeout(() => {
      if (tokenMode === 'invalid') {
        setResetStatus('invalid')
        return
      }

      if (tokenMode === 'expired') {
        setResetStatus('expired')
        return
      }

      setResetStatus('success')
    }, 900)
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="relative overflow-hidden bg-lp-navy px-8 py-12 text-white md:w-5/12 md:px-12 lg:w-1/2 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.18),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.08),transparent_35%)]" aria-hidden="true" />
        <div className="absolute -left-14 top-6 h-60 w-60 rounded-[3rem] border border-white/10 bg-white/5" aria-hidden="true" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-[3.5rem] border border-white/10 bg-lp-gold/10" aria-hidden="true" />

        <div className="relative mx-auto flex h-full max-w-lg flex-col justify-center">
          <header className="animate-fade-left">
            <BrandLogo textClassName="text-white" />
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Security Terminal
            </h1>
            <p className="mt-3 text-sm leading-6 text-lp-muted sm:text-base">
              Where ideas take off. Recover access and return to your incubation dashboard.
            </p>
          </header>

          <div className="mt-10 space-y-5">
            {vaultNotes.map((note) => (
              <article key={note.title} className="animate-fade-left rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm [animation-delay:120ms]">
                <h2 className="font-display text-lg font-semibold text-white">{note.title}</h2>
                <p className="mt-1 text-sm leading-6 text-lp-muted">{note.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#F6F8FC] px-5 py-8 md:w-7/12 md:px-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-xl animate-fade-up">
          <div className="rounded-3xl bg-white p-7 shadow-panel sm:p-10">
            <div className="mb-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setView('forgot')}
                className={`lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  view === 'forgot'
                    ? 'bg-white text-lp-navy shadow-sm'
                    : 'text-slate-500 hover:text-lp-navy'
                }`}
              >
                Forgot
              </button>
              <button
                type="button"
                onClick={() => setView('reset')}
                className={`lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  view === 'reset'
                    ? 'bg-white text-lp-navy shadow-sm'
                    : 'text-slate-500 hover:text-lp-navy'
                }`}
              >
                Reset
              </button>
            </div>

            {view === 'forgot' ? (
              <div>
                {forgotStatus === 'success' ? (
                  <div className="text-center">
                    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      ✓
                    </div>
                    <h2 className="font-display text-2xl font-bold text-lp-navy">Recovery Link Sent</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Check your inbox and spam folder for the secure password reset link.
                    </p>
                    <button
                      type="button"
                      onClick={() => setForgotStatus('idle')}
                      className="lp-focus mt-6 inline-flex rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-lp-navy hover:border-lp-gold"
                    >
                      Send Again
                    </button>
                  </div>
                ) : (
                  <>
                    <header>
                      <h2 className="font-display text-3xl font-bold text-lp-navy">Security Recovery</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Enter your registered email to receive a secure password reset link.
                      </p>
                    </header>

                    <form className="mt-6 space-y-5" onSubmit={submitForgot} noValidate>
                      <div>
                        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Corporate Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="name@company.com"
                          className="lp-focus w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                          disabled={forgotStatus === 'loading'}
                        />
                      </div>

                      {forgotStatus === 'error' ? (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert" aria-live="polite">
                          Please enter a valid email address.
                        </p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={forgotStatus === 'loading'}
                        className="lp-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lp-gold px-4 py-3.5 font-semibold text-lp-navy shadow-lg shadow-lp-gold/30 transition hover:-translate-y-0.5 hover:bg-[#d8b764] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {forgotStatus === 'loading' ? (
                          <>
                            {spinner}
                            Sending Link...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div>
                {resetStatus === 'success' ? (
                  <div className="text-center">
                    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      ✓
                    </div>
                    <h2 className="font-display text-2xl font-bold text-lp-navy">Password Updated</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Your credentials are updated successfully. You can sign in now.
                    </p>
                    <Link
                      to="/login"
                      className="lp-focus mt-6 inline-flex rounded-xl bg-lp-gold px-4 py-2.5 text-sm font-semibold text-lp-navy"
                    >
                      Go To Sign In
                    </Link>
                  </div>
                ) : (
                  <>
                    <header>
                      <h2 className="font-display text-3xl font-bold text-lp-navy">Update Credentials</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Set a new secure password for your terminal access.
                      </p>
                    </header>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Token Simulation
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['valid', 'invalid', 'expired'].map((tokenValue) => (
                          <button
                            key={tokenValue}
                            type="button"
                            onClick={() => setTokenMode(tokenValue)}
                            className={`lp-focus rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                              tokenMode === tokenValue
                                ? 'bg-lp-navy text-white'
                                : 'bg-white text-slate-600 hover:text-lp-navy'
                            }`}
                          >
                            {tokenValue}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form className="mt-5 space-y-5" onSubmit={submitReset} noValidate>
                      <div>
                        <label htmlFor="new-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          New Password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          className="lp-focus w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                          disabled={resetStatus === 'loading'}
                        />
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Complexity Requirements
                        </p>
                        <ul className="space-y-1.5">
                          <RuleRow label="Minimum 12 characters" passed={passwordRules.minLength} />
                          <RuleRow label="At least one uppercase letter" passed={passwordRules.uppercase} />
                          <RuleRow label="At least one lowercase letter" passed={passwordRules.lowercase} />
                          <RuleRow label="At least one numeric digit" passed={passwordRules.number} />
                          <RuleRow label="At least one special character" passed={passwordRules.special} />
                        </ul>
                      </div>

                      <div>
                        <label htmlFor="confirm-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Confirm Password
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          className="lp-focus w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                          disabled={resetStatus === 'loading'}
                        />
                        {passwordMismatch ? (
                          <p className="mt-2 text-sm text-rose-600">Password confirmation does not match.</p>
                        ) : null}
                      </div>

                      {resetStatus === 'invalid' ? (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert" aria-live="polite">
                          Invalid reset token. Please request a new recovery link.
                        </p>
                      ) : null}

                      {resetStatus === 'expired' ? (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700" role="alert" aria-live="polite">
                          Reset token expired. Please generate a fresh link from the Forgot view.
                        </p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={resetStatus === 'loading' || !passwordValid || passwordMismatch}
                        className="lp-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lp-gold px-4 py-3.5 font-semibold text-lp-navy shadow-lg shadow-lp-gold/30 transition hover:-translate-y-0.5 hover:bg-[#d8b764] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {resetStatus === 'loading' ? (
                          <>
                            {spinner}
                            Updating Password...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            <div className="mt-8 border-t border-slate-200 pt-5 text-center">
              <Link
                to="/login"
                className="lp-focus inline-flex items-center gap-2 rounded-md text-sm font-semibold text-lp-navy underline decoration-lp-gold/60 underline-offset-4 hover:text-lp-gold"
              >
                ← Back to Sign In
              </Link>
              <p className="mt-3 text-xs text-slate-500">Need help? support@launchpadcicf.in</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ForgotResetPage