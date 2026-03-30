import { useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const facultyMembers = [
  {
    id: 'fc-1',
    name: 'Dr. Sarah Vance',
    role: 'Lead Mentor',
    expertise: 'Venture strategy, biotech scaleups',
    availability: 'Open Slots: 2',
  },
  {
    id: 'fc-2',
    name: 'Marcus Chen',
    role: 'Venture Partner',
    expertise: 'Financial models, GTM readiness',
    availability: 'Open Slots: 1',
  },
  {
    id: 'fc-3',
    name: 'Elaine Park',
    role: 'Innovation Advisor',
    expertise: 'Pilot execution, enterprise onboarding',
    availability: 'Open Slots: 3',
  },
]

const meetingRequestsSeed = [
  {
    id: 'mr-1',
    mentor: 'Dr. Sarah Vance',
    topic: 'Q3 projection rework review',
    date: 'Apr 03, 2026',
    status: 'Scheduled',
  },
  {
    id: 'mr-2',
    mentor: 'Marcus Chen',
    topic: 'Board narrative for investor panel',
    date: 'Apr 05, 2026',
    status: 'Pending',
  },
]

const feedbackTimeline = [
  {
    id: 'fb-1',
    mentor: 'Dr. Sarah Vance',
    title: 'Progress Deck Review',
    summary: 'Requested stronger unit-economics breakdown in section 4.',
    time: 'Mar 29, 2026',
  },
  {
    id: 'fb-2',
    mentor: 'Marcus Chen',
    title: 'Financial Briefing Review',
    summary: 'Suggested a downside sensitivity scenario in appendix.',
    time: 'Mar 28, 2026',
  },
]

function statusTone(status) {
  if (status === 'Scheduled') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Pending') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={`faculty-card-${idx}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-40 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-28 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="h-6 w-44 rounded bg-slate-200" />
        <div className="mt-4 h-14 rounded bg-slate-200" />
      </div>
    </div>
  )
}

function IncubateeFacultyPage() {
  const [viewState, setViewState] = useState('default')
  const [searchText, setSearchText] = useState('')
  const [meetingRequests, setMeetingRequests] = useState(meetingRequestsSeed)
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({ mentor: '', topic: '', date: '' })
  const [toast, setToast] = useState('')

  const visibleFaculty = useMemo(() => {
    const source = viewState === 'empty' ? [] : facultyMembers
    const lowered = searchText.trim().toLowerCase()

    return source.filter(
      (item) =>
        item.name.toLowerCase().includes(lowered) ||
        item.expertise.toLowerCase().includes(lowered),
    )
  }, [searchText, viewState])

  const visibleRequests = viewState === 'empty' ? [] : meetingRequests

  const submitRequest = () => {
    if (!newRequest.mentor || !newRequest.topic || !newRequest.date) {
      setToast('Complete all request fields.')
      setTimeout(() => setToast(''), 1600)
      return
    }

    setMeetingRequests((current) => [
      {
        id: `mr-${Date.now()}`,
        mentor: newRequest.mentor,
        topic: newRequest.topic,
        date: newRequest.date,
        status: 'Pending',
      },
      ...current,
    ])

    setNewRequest({ mentor: '', topic: '', date: '' })
    setIsRequestOpen(false)
    setToast('Meeting request submitted.')
    setTimeout(() => setToast(''), 1700)
  }

  const scheduledCount = visibleRequests.filter((item) => item.status === 'Scheduled').length

  return (
    <IncubateeShell
      activeKey="faculty"
      title="Incubatee Faculty"
      subtitle="Coordinate mentor support, review loops, and meeting cadence"
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

            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search faculty by name or expertise"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
          </div>
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Faculty schedule could not be loaded. This is a UI-only preview state for now.
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Active Mentors</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : visibleFaculty.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Meeting Requests</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : visibleRequests.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Scheduled</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : scheduledCount}</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <>
            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Faculty Directory</h2>

              {viewState === 'empty' ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">No faculty profiles found.</p>
                  <p className="mt-2 text-sm text-slate-500">Faculty records will appear once synced from backend.</p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleFaculty.map((member) => (
                    <article key={member.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-bold text-lp-navy">{member.name}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{member.role}</p>
                      <p className="mt-3 text-sm text-slate-600">{member.expertise}</p>
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
              )}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Meeting Requests</h2>
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
                      {visibleRequests.map((item) => (
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
              </article>

              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Feedback Timeline</h2>
                <div className="mt-4 space-y-3">
                  {(viewState === 'empty' ? [] : feedbackTimeline).map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-lp-navy">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.mentor} | {item.time}</p>
                      <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
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
