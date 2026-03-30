import { useMemo, useState } from 'react'
import FacultyShell from '../common/FacultyShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const menteesSeed = [
  {
    id: 'm-1',
    startup: 'NeuroGrid Labs',
    founder: 'Aanya Sen',
    focus: 'Financial projection clarity',
    progress: 72,
    nextSession: 'Apr 02, 2026',
  },
  {
    id: 'm-2',
    startup: 'AgriPulse',
    founder: 'Rahul Menon',
    focus: 'Pilot conversion playbook',
    progress: 56,
    nextSession: 'Apr 03, 2026',
  },
  {
    id: 'm-3',
    startup: 'AstraFlow',
    founder: 'Ira Jain',
    focus: 'Go-to-market experiment quality',
    progress: 64,
    nextSession: 'Apr 06, 2026',
  },
]

const sessionLogSeed = [
  {
    id: 'sl-1',
    startup: 'NeuroGrid Labs',
    title: 'Projection assumptions walkthrough',
    date: 'Mar 29, 2026',
    action: 'Upload revised CAC model by Apr 01',
  },
  {
    id: 'sl-2',
    startup: 'AgriPulse',
    title: 'Pilot funnel diagnostics',
    date: 'Mar 27, 2026',
    action: 'Run two pricing tests with SME cohort',
  },
]

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="h-6 w-44 rounded bg-slate-200" />
        <div className="mt-4 h-16 rounded bg-slate-200" />
        <div className="mt-3 h-16 rounded bg-slate-200" />
      </div>
      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-16 rounded bg-slate-200" />
      </div>
    </div>
  )
}

function FacultyMentorshipPage() {
  const [viewState, setViewState] = useState('default')
  const [mentees, setMentees] = useState(menteesSeed)
  const [sessionLogs, setSessionLogs] = useState(sessionLogSeed)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [logDraft, setLogDraft] = useState({ startup: '', title: '', action: '' })
  const [toast, setToast] = useState('')

  const visibleMentees = viewState === 'empty' ? [] : mentees
  const visibleLogs = viewState === 'empty' ? [] : sessionLogs

  const averageProgress = useMemo(() => {
    if (!visibleMentees.length) {
      return 0
    }

    const sum = visibleMentees.reduce((total, item) => total + item.progress, 0)
    return Math.round(sum / visibleMentees.length)
  }, [visibleMentees])

  const logSession = () => {
    if (!logDraft.startup || !logDraft.title || !logDraft.action) {
      setToast('Complete all session log fields.')
      setTimeout(() => setToast(''), 1600)
      return
    }

    setSessionLogs((current) => [
      {
        id: `sl-${Date.now()}`,
        startup: logDraft.startup,
        title: logDraft.title,
        date: new Date().toLocaleDateString('en-IN'),
        action: logDraft.action,
      },
      ...current,
    ])

    setLogDraft({ startup: '', title: '', action: '' })
    setIsLogOpen(false)
    setToast('Session log recorded.')
    setTimeout(() => setToast(''), 1700)
  }

  return (
    <FacultyShell
      activeKey="mentorship"
      title="Faculty Mentorship"
      subtitle="Manage startup mentorship progress and guidance continuity"
      badge="Mentor Track"
      headerAction={
        <button
          type="button"
          onClick={() => setIsLogOpen(true)}
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Log Session
        </button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Preview State
              </span>
              {previewModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewState(mode)}
                  className={`lp-focus rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] ${
                    viewState === mode ? 'bg-lp-navy text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Average Progress: <span className="text-lp-navy">{averageProgress}%</span>
            </div>
          </div>
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Mentorship workspace failed to load. Please retry.
          </section>
        ) : null}

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <>
            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Active Mentees</h2>

              {viewState === 'empty' ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">No mentees assigned.</p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleMentees.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-lp-navy">{item.startup}</p>
                      <p className="mt-1 text-xs text-slate-500">Founder: {item.founder}</p>
                      <p className="mt-2 text-xs text-slate-600">Focus: {item.focus}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Next session: {item.nextSession}
                      </p>
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-lp-gold to-[#f0cf76]"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Session History</h2>
              <div className="mt-4 space-y-3">
                {visibleLogs.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-lp-navy">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.startup} | {item.date}</p>
                    <p className="mt-2 text-sm text-slate-600">Action: {item.action}</p>
                  </article>
                ))}
                {!visibleLogs.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                    No session logs recorded yet.
                  </div>
                ) : null}
              </div>
            </section>
          </>
        )}
      </div>

      {isLogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Log Mentorship Session</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={logDraft.startup}
                onChange={(event) =>
                  setLogDraft((current) => ({ ...current, startup: event.target.value }))
                }
                placeholder="Startup"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={logDraft.title}
                onChange={(event) =>
                  setLogDraft((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Session title"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <textarea
                value={logDraft.action}
                onChange={(event) =>
                  setLogDraft((current) => ({ ...current, action: event.target.value }))
                }
                placeholder="Key action items"
                className="lp-focus min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLogOpen(false)}
                className="lp-focus rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={logSession}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </FacultyShell>
  )
}

export default FacultyMentorshipPage
