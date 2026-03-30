import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'
import { apiRequest } from '../../lib/api'

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [activity, setActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/admin/bundle')
      const bundle = response.data || {}

      setDashboard(bundle.dashboard || null)
      setActivity(bundle.emailLog || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load admin dashboard.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const cards = useMemo(() => {
    return [
      {
        id: 'active-incubatees',
        label: 'Active Incubatees',
        value: dashboard?.activeIncubatees ?? 0,
      },
      {
        id: 'faculty-reviewers',
        label: 'Faculty Reviewers',
        value: dashboard?.facultyReviewers ?? 0,
      },
      {
        id: 'open-claims',
        label: 'Open Claims',
        value: dashboard?.openClaims ?? 0,
      },
      {
        id: 'email-delivery-rate',
        label: 'Email Delivery Rate',
        value: dashboard?.emailDeliveryRate ?? '0%',
      },
    ]
  }, [dashboard])

  return (
    <AdminShell
      activeKey="dashboard"
      title="Admin Dashboard"
      subtitle="Platform-wide visibility across incubatees, faculty, and operations"
      badge="Control Center"
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

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <article key={card.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-black text-lp-navy">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Recent Email Delivery Activity</h2>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : activity.length ? (
            <div className="mt-4 space-y-3">
              {activity.slice(0, 8).map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-lp-navy">{item.emailType}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Role: {item.audienceRole} | Recipients: {item.recipients} | Result: {item.result}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.sentAt}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No activity to display.
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

export default AdminDashboardPage
