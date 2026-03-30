import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

function statusTone(status) {
  if (status === 'Scheduled') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Pending') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function IncubateeFacultyPage() {
  const [facultyMembers, setFacultyMembers] = useState([])
  const [meetingRequests, setMeetingRequests] = useState([])
  const [feedbackTimeline, setFeedbackTimeline] = useState([])
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({ mentor: '', topic: '', date: '' })
  const [toast, setToast] = useState('')

  const loadFacultyDesk = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/faculty')
      const desk = response.data || {}

      setFacultyMembers(desk.facultyMembers || [])
      setMeetingRequests(desk.meetingRequests || [])
      setFeedbackTimeline(desk.feedbackTimeline || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load faculty desk.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFacultyDesk()
  }, [])

  const visibleFaculty = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return facultyMembers.filter((item) => {
      const name = String(item.name || '').toLowerCase()
      const expertise = String(item.expertise || '').toLowerCase()
      return name.includes(lowered) || expertise.includes(lowered)
    })
  }, [facultyMembers, searchText])

  const scheduledCount = useMemo(
    () => meetingRequests.filter((item) => item.status === 'Scheduled').length,
    [meetingRequests],
  )

  const submitRequest = async () => {
    if (!newRequest.mentor || !newRequest.topic || !newRequest.date) {
      setToast('Complete mentor, topic, and date before submitting.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    try {
      const response = await apiRequest('/incubatee/faculty/requests', {
        method: 'POST',
        body: newRequest,
      })

      if (response.item) {
        setMeetingRequests((current) => [response.item, ...current])
      }

      setNewRequest({ mentor: '', topic: '', date: '' })
      setIsRequestOpen(false)
      setToast('Meeting request submitted.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to submit meeting request.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  return (
    <IncubateeShell
      activeKey="faculty"
      title="Incubatee Faculty"
      subtitle="Coordinate mentor support and request faculty sessions"
      badge="Mentor Network"
      headerAction={
        <button
          type="button"
          onClick={() => setIsRequestOpen(true)}
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Request Meeting
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search faculty by name or expertise"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />

            <button
              type="button"
              onClick={loadFacultyDesk}
              className="lp-focus rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Active Mentors</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{facultyMembers.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Meeting Requests</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{meetingRequests.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Scheduled</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{scheduledCount}</p>
          </article>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Faculty Directory</h2>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : visibleFaculty.length ? (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleFaculty.map((member) => (
                <article key={member.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-bold text-lp-navy">{member.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{member.role}</p>
                  <p className="mt-3 text-sm text-slate-600">{member.expertise || 'No specialization set.'}</p>
                  <p className="mt-3 text-xs font-semibold text-lp-gold">{member.availability}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRequestOpen(true)
                      setNewRequest((current) => ({ ...current, mentor: member.name }))
                    }}
                    className="lp-focus mt-4 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Request Session
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No faculty profiles found.
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Meeting Requests</h2>
            {isLoading ? (
              <div className="mt-4 h-14 animate-pulse rounded bg-slate-100" />
            ) : meetingRequests.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                      <th className="pb-3 pr-3">Mentor</th>
                      <th className="pb-3 pr-3">Topic</th>
                      <th className="pb-3 pr-3">Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {meetingRequests.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 pr-3 font-semibold text-lp-navy">{item.mentor}</td>
                        <td className="py-4 pr-3 text-slate-600">{item.topic}</td>
                        <td className="py-4 pr-3 text-slate-600">{item.date}</td>
                        <td className="py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No meeting requests raised yet.
              </div>
            )}
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Feedback Timeline</h2>
            {isLoading ? (
              <div className="mt-4 h-14 animate-pulse rounded bg-slate-100" />
            ) : feedbackTimeline.length ? (
              <div className="mt-4 space-y-3">
                {feedbackTimeline.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-lp-navy">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.mentor} | {item.time}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No feedback timeline entries available.
              </div>
            )}
          </article>
        </section>
      </div>

      {isRequestOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Request Mentor Meeting</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <select
                value={newRequest.mentor}
                onChange={(event) =>
                  setNewRequest((current) => ({ ...current, mentor: event.target.value }))
                }
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="">Select mentor</option>
                {facultyMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>

              <input
                value={newRequest.topic}
                onChange={(event) =>
                  setNewRequest((current) => ({ ...current, topic: event.target.value }))
                }
                placeholder="Meeting topic"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />

              <input
                type="date"
                value={newRequest.date}
                onChange={(event) =>
                  setNewRequest((current) => ({ ...current, date: event.target.value }))
                }
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRequestOpen(false)}
                className="lp-focus rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRequest}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
              >
                Submit Request
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
    </IncubateeShell>
  )
}

export default IncubateeFacultyPage
