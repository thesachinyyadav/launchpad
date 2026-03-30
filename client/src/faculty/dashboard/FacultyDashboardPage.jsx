import { useMemo, useState } from 'react'
import FacultyShell from '../common/FacultyShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const reviewQueue = [
  {
    id: 'rq-1',
    startup: 'NeuroGrid Labs',
    submission: 'Quarterly Progress PPT',
    deadline: 'Apr 02, 2026',
    priority: 'High',
  },
  {
    id: 'rq-2',
    startup: 'AgriPulse',
    submission: 'Financial Readiness Brief',
    deadline: 'Apr 04, 2026',
    priority: 'Medium',
  },
  {
    id: 'rq-3',
    startup: 'AstraFlow',
    submission: 'Market Validation Deck',
    deadline: 'Apr 06, 2026',
    priority: 'Low',
  },
]

const sessions = [
  {
    id: 's-1',
    startup: 'NeuroGrid Labs',
    topic: 'Projection assumptions review',
    time: '11:00 AM - 11:45 AM',
  },
  {
    id: 's-2',
    startup: 'AgriPulse',
    topic: 'Pilot conversion strategy',
    time: '02:30 PM - 03:15 PM',
  },
]

const alerts = [
  {
    id: 'a-1',
    tone: 'amber',
    message: '2 reviews are due in the next 48 hours.',
  },
  {
    id: 'a-2',
    tone: 'rose',
    message: '1 incubatee has an overdue revision request.',
  },
]

function priorityTone(priority) {
  if (priority === 'High') {
    return 'bg-rose-50 text-rose-700'
  }

  if (priority === 'Medium') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`faculty-kpi-${index}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="mt-4 h-16 rounded bg-slate-200" />
          <div className="mt-3 h-16 rounded bg-slate-200" />
        </div>
        <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="mt-4 h-16 rounded bg-slate-200" />
          <div className="mt-3 h-16 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

function FacultyDashboardPage() {
  const [viewState, setViewState] = useState('default')

  const queue = viewState === 'empty' ? [] : reviewQueue
  const todaySessions = viewState === 'empty' ? [] : sessions

  const totalDue = queue.length

  const highPriority = useMemo(
    () => queue.filter((item) => item.priority === 'High').length,
    [queue],
  )

  return (
    <FacultyShell
      activeKey="dashboard"
      title="Faculty Dashboard"
      subtitle="Track review load, mentoring sessions, and submission quality"
      badge="Review Week 14"
      headerAction={
        <button
          type="button"
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Start Review Batch
        </button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Failed to sync faculty queue from backend. This is a front-end fallback state.
          </section>
        ) : null}

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Reviews Due</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{totalDue}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">High Priority</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{highPriority}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Mentoring Sessions</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{todaySessions.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Response SLA</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">96%</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <>
            {viewState !== 'empty' ? (
              <section className="space-y-2">
                {alerts.map((alert) => (
                  <article
                    key={alert.id}
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      alert.tone === 'rose'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {alert.message}
                  </article>
                ))}
              </section>
            ) : null}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Review Queue</h2>

                {viewState === 'empty' ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-600">No reviews assigned right now.</p>
                    <p className="mt-2 text-sm text-slate-500">You are all caught up for this cycle.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {queue.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-lp-navy">{item.startup}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.submission}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityTone(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Due {item.deadline}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Today Sessions</h2>
                <div className="mt-4 space-y-3">
                  {todaySessions.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-lp-navy">{item.startup}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.topic}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {item.time}
                      </p>
                    </div>
                  ))}
                  {!todaySessions.length ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                      No sessions on your calendar today.
                    </div>
                  ) : null}
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </FacultyShell>
  )
}

export default FacultyDashboardPage
