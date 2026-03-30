import { useEffect, useMemo, useState } from 'react'
import FacultyShell from '../common/FacultyShell'
import { apiRequest } from '../../lib/api'

function FacultyMentorshipPage() {
  const [mentees, setMentees] = useState([])
  const [sessionLogs, setSessionLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [logDraft, setLogDraft] = useState({ startup: '', title: '', action: '' })
  const [toast, setToast] = useState('')

  const loadMentorship = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/faculty/mentorship')
      setMentees(response.data?.mentees || [])
      setSessionLogs(response.data?.logs || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load mentorship data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMentorship()
  }, [])

  const averageProgress = useMemo(() => {
    if (!mentees.length) {
      return 0
    }

    const sum = mentees.reduce((total, item) => total + Number(item.progress || 0), 0)
    return Math.round(sum / mentees.length)
  }, [mentees])

  const submitLog = async () => {
    if (!logDraft.startup || !logDraft.title || !logDraft.action) {
      setToast('Complete all session log fields.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    try {
      const response = await apiRequest('/faculty/mentorship/log', {
        method: 'POST',
        body: logDraft,
      })

      if (response.item) {
        setSessionLogs((current) => [response.item, ...current])
      }

      setLogDraft({ startup: '', title: '', action: '' })
      setIsLogOpen(false)
      setToast('Session log recorded.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to save session log.')
      setTimeout(() => setToast(''), 1800)
    }
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
        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">
            Average Progress: <span className="text-lp-navy">{averageProgress}%</span>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Active Mentees</h2>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-16 rounded bg-slate-100" />
              <div className="h-16 rounded bg-slate-100" />
            </div>
          ) : mentees.length ? (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {mentees.map((item) => (
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
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No mentees assigned.
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Session History</h2>
          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : sessionLogs.length ? (
            <div className="mt-4 space-y-3">
              {sessionLogs.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-lp-navy">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.startup} | {item.date}</p>
                  <p className="mt-2 text-sm text-slate-600">Action: {item.action}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No session logs recorded yet.
            </div>
          )}
        </section>
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
                onClick={submitLog}
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
