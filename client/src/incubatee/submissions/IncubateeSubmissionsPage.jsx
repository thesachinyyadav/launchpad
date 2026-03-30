import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

const statusOptions = ['All', 'Draft', 'Submitted', 'Rework Requested', 'Approved']

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

function IncubateeSubmissionsPage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toast, setToast] = useState('')

  const loadSubmissions = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/submissions')
      setItems(response.items || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load submissions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const visibleItems = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return items.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      const matchesText =
        item.asset.toLowerCase().includes(lowered) ||
        item.owner.toLowerCase().includes(lowered)

      return matchesStatus && matchesText
    })
  }, [items, searchText, statusFilter])

  const submitItem = async (id) => {
    try {
      const response = await apiRequest(`/incubatee/submissions/${id}/submit`, {
        method: 'POST',
      })

      const updated = response.item
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setToast('Submission sent to review queue.')
      setTimeout(() => setToast(''), 2000)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to submit this item.')
      setTimeout(() => setToast(''), 2000)
    }
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
          onClick={loadSubmissions}
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

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
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

            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search submission by asset or owner"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Submission Queue</h2>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : visibleItems.length ? (
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
                  {visibleItems.map((item) => (
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
                        <button
                          type="button"
                          disabled={item.status !== 'Draft'}
                          onClick={() => submitItem(item.id)}
                          className="lp-focus rounded-md bg-lp-navy px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No submissions in queue.
            </div>
          )}
        </section>
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
