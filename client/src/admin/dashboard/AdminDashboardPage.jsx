import { useState } from 'react'
import AdminShell from '../common/AdminShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const alerts = [
  {
    id: 'ad-1',
    tone: 'rose',
    message: '3 submissions breached SLA and need escalation.',
  },
  {
    id: 'ad-2',
    tone: 'amber',
    message: '2 new incubatee onboarding requests are waiting for approval.',
  },
]

const activityFeed = [
  {
    id: 'ac-1',
    actor: 'Finance Admin',
    event: 'Approved prototype claim for NeuroGrid Labs',
    time: '35 mins ago',
  },
  {
    id: 'ac-2',
    actor: 'Faculty Ops',
    event: 'Assigned Dr. Sarah Vance to AgriPulse review panel',
    time: '1 hour ago',
  },
  {
    id: 'ac-3',
    actor: 'System',
    event: 'Delivered 48 digest emails via Resend successfully',
    time: '2 hours ago',
  },
]

function AdminDashboardPage() {
  const [viewState, setViewState] = useState('default')

  const showData = viewState !== 'empty'

  return (
    <AdminShell
      activeKey="dashboard"
      title="Admin Dashboard"
      subtitle="Platform-wide visibility across incubatees, faculty, and operations"
      badge="Control Center"
      headerAction={
        <button
          type="button"
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Open Audit Log
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
            Admin data sync unavailable. This fallback screen is for frontend validation.
          </section>
        ) : null}

        {viewState === 'loading' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`ad-kpi-${idx}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                  <div className="mt-3 h-8 w-14 rounded bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
              <div className="h-6 w-40 rounded bg-slate-200" />
              <div className="mt-4 h-14 rounded bg-slate-200" />
            </div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <article className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Active Incubatees</p>
                <p className="mt-3 text-3xl font-black text-lp-navy">{showData ? 24 : 0}</p>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Faculty Reviewers</p>
                <p className="mt-3 text-3xl font-black text-lp-navy">{showData ? 11 : 0}</p>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Open Claims</p>
                <p className="mt-3 text-3xl font-black text-lp-navy">{showData ? 9 : 0}</p>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Email Delivery</p>
                <p className="mt-3 text-3xl font-black text-lp-navy">{showData ? '99.2%' : '0%'}</p>
              </article>
            </section>

            {showData ? (
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

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Operational Activity</h2>
              {showData ? (
                <div className="mt-4 space-y-3">
                  {activityFeed.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-lp-navy">{item.event}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.actor} | {item.time}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No activity to display.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminShell>
  )
}

export default AdminDashboardPage
