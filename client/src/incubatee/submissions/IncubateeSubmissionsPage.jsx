import { useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const statusOptions = ['All', 'Draft', 'Submitted', 'Rework Requested', 'Approved']

const initialSubmissions = [
  {
    id: 'sb-1',
    asset: 'Quarterly Progress PPT',
    stage: 'Stage 2',
    owner: 'Felix Alpha Team',
    dueDate: 'Apr 04, 2026',
    status: 'Rework Requested',
    attempt: 3,
  },
  {
    id: 'sb-2',
    asset: 'Financial Briefing',
    stage: 'Stage 2',
    owner: 'Finance Pod',
    dueDate: 'Apr 06, 2026',
    status: 'Submitted',
    attempt: 2,
  },
  {
    id: 'sb-3',
    asset: 'Internship Compliance Pack',
    stage: 'Operations',
    owner: 'Ops Pod',
    dueDate: 'Apr 09, 2026',
    status: 'Draft',
    attempt: 1,
  },
  {
    id: 'sb-4',
    asset: 'Milestone Evidence Log',
    stage: 'Stage 3',
    owner: 'Engineering Pod',
    dueDate: 'Apr 11, 2026',
    status: 'Approved',
    attempt: 2,
  },
]

const deadlineCards = [
  {
    id: 'dl-1',
    label: 'Due in 2 days',
    title: 'Quarterly Progress PPT resubmission',
    tone: 'amber',
  },
  {
    id: 'dl-2',
    label: 'Due in 5 days',
    title: 'Internship compliance checklist package',
    tone: 'slate',
  },
]

const reviewFeed = [
  {
    id: 'rv-1',
    reviewer: 'Dr. Sarah Vance',
    asset: 'Quarterly Progress PPT',
    comment:
      'Slide 14 and 15 need revenue segment split and updated CAC assumptions before approval.',
    date: 'Mar 29, 2026',
  },
  {
    id: 'rv-2',
    reviewer: 'Marcus Chen',
    asset: 'Financial Briefing',
    comment: 'Solid narrative. Add one sensitivity case in appendix.',
    date: 'Mar 28, 2026',
  },
]

function statusTone(status) {
  if (status === 'Approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Rework Requested') {
    return 'bg-rose-50 text-rose-700'
  }

  if (status === 'Submitted') {
    return 'bg-lp-gold/20 text-lp-navy'
  }

  return 'bg-slate-100 text-slate-600'
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`sub-kpi-${index}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="mt-3 h-8 w-14 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="h-6 w-44 rounded bg-slate-200" />
        <div className="mt-4 h-14 rounded bg-slate-200" />
        <div className="mt-3 h-14 rounded bg-slate-200" />
      </div>
    </div>
  )
}

function IncubateeSubmissionsPage() {
  const [viewState, setViewState] = useState('default')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [toast, setToast] = useState('')

  const visibleSubmissions = useMemo(() => {
    const source = viewState === 'empty' ? [] : submissions
    const lowered = searchText.trim().toLowerCase()

    return source.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      const matchesText =
        item.asset.toLowerCase().includes(lowered) || item.owner.toLowerCase().includes(lowered)

      return matchesStatus && matchesText
    })
  }, [searchText, statusFilter, submissions, viewState])

  const draftCount = submissions.filter((item) => item.status === 'Draft').length
  const submittedCount = submissions.filter((item) => item.status === 'Submitted').length
  const reworkCount = submissions.filter((item) => item.status === 'Rework Requested').length
  const approvedCount = submissions.filter((item) => item.status === 'Approved').length

  const submitDraft = (submissionId) => {
    setSubmissions((current) =>
      current.map((item) =>
        item.id === submissionId ? { ...item, status: 'Submitted', attempt: item.attempt + 1 } : item,
      ),
    )

    setToast('Draft moved to submitted state.')
    setTimeout(() => setToast(''), 1700)
  }

  return (
    <IncubateeShell
      activeKey="submissions"
      title="Incubatee Submissions"
      subtitle="Control delivery schedules, attempts, and reviewer feedback"
      badge="Review Window Open"
      headerAction={
        <button
          type="button"
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          New Submission Bundle
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

            <div className="flex flex-wrap items-center gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={`lp-focus rounded-full px-3 py-1.5 text-xs font-semibold ${
                    statusFilter === option
                      ? 'bg-lp-gold text-lp-navy'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search submission by asset or owner"
            className="lp-focus mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Review status could not be loaded. The UI remains interactive for front-end flow validation.
          </section>
        ) : null}

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Draft</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : draftCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Submitted</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : submittedCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Rework</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : reworkCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Approved</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : approvedCount}</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {(viewState === 'empty' ? [] : deadlineCards).map((card) => (
                <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{card.label}</p>
                  <p className="mt-1 text-sm font-semibold text-lp-navy">{card.title}</p>
                  <span
                    className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      card.tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Upcoming
                  </span>
                </article>
              ))}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Submission Queue</h2>

              {viewState === 'empty' ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">No submissions in queue.</p>
                  <p className="mt-2 text-sm text-slate-500">Use the new bundle action to start your first workflow.</p>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                        <th className="pb-3 pr-3">Asset</th>
                        <th className="pb-3 pr-3">Stage</th>
                        <th className="pb-3 pr-3">Owner</th>
                        <th className="pb-3 pr-3">Due Date</th>
                        <th className="pb-3 pr-3">Attempt</th>
                        <th className="pb-3 pr-3">Status</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleSubmissions.map((item) => (
                        <tr key={item.id}>
                          <td className="py-4 pr-3 font-semibold text-lp-navy">{item.asset}</td>
                          <td className="py-4 pr-3 text-slate-600">{item.stage}</td>
                          <td className="py-4 pr-3 text-slate-600">{item.owner}</td>
                          <td className="py-4 pr-3 text-slate-600">{item.dueDate}</td>
                          <td className="py-4 pr-3 text-slate-600">{item.attempt}</td>
                          <td className="py-4 pr-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4">
                            {item.status === 'Draft' ? (
                              <button
                                type="button"
                                onClick={() => submitDraft(item.id)}
                                className="lp-focus rounded-md bg-lp-navy px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white"
                              >
                                Submit
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="lp-focus rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Latest Reviewer Notes</h2>
              <div className="mt-4 space-y-3">
                {(viewState === 'empty' ? [] : reviewFeed).map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-lp-navy">{item.asset}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.reviewer} | {item.date}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </IncubateeShell>
  )
}

export default IncubateeSubmissionsPage
