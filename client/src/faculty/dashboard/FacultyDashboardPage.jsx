import { useEffect, useMemo, useState } from 'react'
import FacultyShell from '../common/FacultyShell'
import { apiRequest } from '../../lib/api'

function priorityTone(priority) {
  if (priority === 'High') {
    return 'bg-rose-50 text-rose-700'
  }

  if (priority === 'Medium') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function FacultyDashboardPage() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/faculty/dashboard')
      setData(response.data || null)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load faculty dashboard.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const reviewQueue = data?.reviewQueue || []
  const sessions = data?.sessions || []
  const stats = useMemo(() => {
    return {
      reviewsDue: data?.stats?.reviewsDue ?? reviewQueue.length,
      highPriority: data?.stats?.highPriority ?? reviewQueue.filter((item) => item.status === 'Pending').length,
      mentorshipSessions: data?.stats?.mentorshipSessions ?? sessions.length,
    }
  }, [data, reviewQueue, sessions])

  return (
    <FacultyShell
      activeKey="dashboard"
      title="Faculty Dashboard"
      subtitle="Track review load, mentoring sessions, and submission quality"
      badge="Review Desk"
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
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Reviews Due</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{stats.reviewsDue}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">High Priority</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{stats.highPriority}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Mentoring Sessions</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{stats.mentorshipSessions}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Response SLA</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">
              {stats.reviewsDue ? Math.max(0, 100 - Math.round((stats.highPriority / stats.reviewsDue) * 100)) : 100}%
            </p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Review Queue</h2>
            {isLoading ? (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-14 rounded bg-slate-100" />
                <div className="h-14 rounded bg-slate-100" />
              </div>
            ) : reviewQueue.length ? (
              <div className="mt-4 space-y-3">
                {reviewQueue.map((item) => {
                  const priority = item.status === 'Pending' ? 'High' : 'Low'

                  return (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-lp-navy">{item.startup}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.artifact}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityTone(priority)}`}>
                          {priority}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {item.stage} | {item.submittedAt}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No reviews assigned right now.
              </div>
            )}
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Today Sessions</h2>
            {isLoading ? (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-14 rounded bg-slate-100" />
                <div className="h-14 rounded bg-slate-100" />
              </div>
            ) : sessions.length ? (
              <div className="mt-4 space-y-3">
                {sessions.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-lp-navy">{item.startup}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.topic}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No sessions on your calendar today.
              </div>
            )}
          </article>
        </section>
      </div>
    </FacultyShell>
  )
}

export default FacultyDashboardPage
