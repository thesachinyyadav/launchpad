import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

function cardTone(index) {
  const tones = [
    'bg-blue-50 text-blue-700',
    'bg-amber-50 text-amber-700',
    'bg-emerald-50 text-emerald-700',
    'bg-slate-100 text-slate-700',
  ]

  return tones[index % tones.length]
}

function IncubateeDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/dashboard')
      setDashboard(response.data || null)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load incubatee dashboard.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const stats = dashboard?.stats || []
  const quickActions = dashboard?.quickActions || []
  const stageLabel = dashboard?.stageLabel || 'Not Set'
  const progressPercent = Number(dashboard?.stageProgressPercent || 0)

  return (
    <IncubateeShell
      activeKey="dashboard"
      title="Incubatee Dashboard"
      subtitle="Live workspace status from backend data"
      badge={stageLabel}
      headerAction={
        <button
          type="button"
          onClick={loadDashboard}
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Refresh
        </button>
      }
    >
      <div className="space-y-6">
        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current Stage</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-lp-navy">{stageLabel}</h2>
            </div>
            <Link
              to="/incubatee/submissions"
              className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
            >
              Open Submissions
            </Link>
          </div>

          <div className="mt-6">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
              <span>Lifecycle Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-lp-gold to-[#f0cf76]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading ? (
            <>
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            </>
          ) : stats.length ? (
            stats.map((item, index) => (
              <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${cardTone(index)}`}>
                  {item.value}
                </span>
                <p className="mt-3 font-display text-3xl font-extrabold text-lp-navy">{item.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
              </article>
            ))
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 md:col-span-4">
              No dashboard metrics available.
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Quick Actions</h2>
          {isLoading ? (
            <div className="mt-4 h-14 animate-pulse rounded bg-slate-100" />
          ) : quickActions.length ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="lp-focus rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-lp-navy"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No quick actions configured.
            </div>
          )}
        </section>
      </div>
    </IncubateeShell>
  )
}

export default IncubateeDashboardPage
