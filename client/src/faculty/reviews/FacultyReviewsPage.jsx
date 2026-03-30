import { useMemo, useState } from 'react'
import FacultyShell from '../common/FacultyShell'

const previewModes = ['default', 'loading', 'empty', 'error']
const statusFilters = ['All', 'Pending', 'Approved', 'Rework Requested']

const initialItems = [
  {
    id: 'rv-1',
    startup: 'NeuroGrid Labs',
    artifact: 'Quarterly Progress PPT',
    stage: 'Stage 2',
    submittedAt: 'Mar 29, 2026',
    status: 'Pending',
  },
  {
    id: 'rv-2',
    startup: 'AgriPulse',
    artifact: 'Financial Readiness Brief',
    stage: 'Stage 2',
    submittedAt: 'Mar 28, 2026',
    status: 'Pending',
  },
  {
    id: 'rv-3',
    startup: 'AstraFlow',
    artifact: 'Market Validation Deck',
    stage: 'Stage 3',
    submittedAt: 'Mar 26, 2026',
    status: 'Rework Requested',
  },
]

function statusTone(status) {
  if (status === 'Approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Rework Requested') {
    return 'bg-rose-50 text-rose-700'
  }

  return 'bg-amber-50 text-amber-700'
}

function LoadingState() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
      <div className="h-6 w-40 rounded bg-slate-200" />
      <div className="mt-4 h-14 rounded bg-slate-200" />
      <div className="mt-3 h-14 rounded bg-slate-200" />
      <div className="mt-3 h-14 rounded bg-slate-200" />
    </div>
  )
}

function FacultyReviewsPage() {
  const [viewState, setViewState] = useState('default')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchText, setSearchText] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [items, setItems] = useState(initialItems)
  const [selectedId, setSelectedId] = useState(initialItems[0].id)
  const [toast, setToast] = useState('')

  const visibleItems = useMemo(() => {
    const source = viewState === 'empty' ? [] : items
    const lowered = searchText.trim().toLowerCase()

    return source.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      const matchesText =
        item.startup.toLowerCase().includes(lowered) ||
        item.artifact.toLowerCase().includes(lowered)

      return matchesStatus && matchesText
    })
  }, [items, searchText, statusFilter, viewState])

  const selectedItem = visibleItems.find((item) => item.id === selectedId) || null

  const applyDecision = (status) => {
    if (!selectedItem) {
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id ? { ...item, status } : item,
      ),
    )

    setToast(`Submission marked as ${status}.`)
    setTimeout(() => setToast(''), 1700)
  }

  return (
    <FacultyShell
      activeKey="reviews"
      title="Faculty Reviews"
      subtitle="Evaluate submissions, record decisions, and maintain review quality"
      badge="Queue Active"
      headerAction={
        <button
          type="button"
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Export Review Log
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
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`lp-focus rounded-full px-3 py-1.5 text-xs font-semibold ${
                    statusFilter === filter
                      ? 'bg-lp-gold text-lp-navy'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search by startup or artifact"
            className="lp-focus mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Review queue failed to load from service.
          </section>
        ) : null}

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7 xl:col-span-2">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Submission Queue</h2>

              {viewState === 'empty' ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">No submissions in queue.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {visibleItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`lp-focus w-full rounded-2xl border p-4 text-left ${
                        selectedId === item.id
                          ? 'border-lp-gold bg-lp-gold/10'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-lp-navy">{item.startup}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.artifact}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {item.stage} | {item.submittedAt}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7 xl:col-span-3">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Review Workspace</h2>

              {!selectedItem ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Select an item from queue.
                </div>
              ) : (
                <>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-lp-navy">{selectedItem.startup}</p>
                    <p className="mt-1 text-xs text-slate-500">{selectedItem.artifact}</p>
                    <p className="mt-1 text-xs text-slate-500">Submitted {selectedItem.submittedAt}</p>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Faculty Feedback
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(event) => setFeedbackText(event.target.value)}
                      placeholder="Write reviewer comments for incubatee team"
                      className="lp-focus min-h-36 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => applyDecision('Rework Requested')}
                      className="lp-focus rounded-lg bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700"
                    >
                      Request Rework
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDecision('Approved')}
                      className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
                    >
                      Approve Submission
                    </button>
                  </div>
                </>
              )}
            </article>
          </section>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </FacultyShell>
  )
}

export default FacultyReviewsPage
