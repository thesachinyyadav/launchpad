import { useEffect, useMemo, useState } from 'react'
import FacultyShell from '../common/FacultyShell'
import { apiRequest } from '../../lib/api'

function statusTone(status) {
  if (status === 'On Track') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Needs Attention') {
    return 'bg-rose-50 text-rose-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function FacultyInternsPage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [toast, setToast] = useState('')

  const loadInterns = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/faculty/interns')
      setItems(response.items || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load intern records.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInterns()
  }, [])

  const visibleItems = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(lowered) ||
        item.startup.toLowerCase().includes(lowered)
      )
    })
  }, [items, searchText])

  const updateStatus = async (id, status) => {
    try {
      const response = await apiRequest(`/faculty/interns/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })

      const updated = response.item
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setToast(`Status changed to ${updated.status}.`)
      setTimeout(() => setToast(''), 2000)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to update intern status.')
      setTimeout(() => setToast(''), 2000)
    }
  }

  return (
    <FacultyShell
      activeKey="interns"
      title="Faculty Interns"
      subtitle="Evaluate intern performance and mentorship outcomes"
      badge="Intern Cohort"
      headerAction={
        <button
          type="button"
          onClick={loadInterns}
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
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search intern or startup"
            className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Intern Evaluation Desk</h2>

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
                    <th className="pb-3 pr-3">Intern</th>
                    <th className="pb-3 pr-3">Startup</th>
                    <th className="pb-3 pr-3">Mentor</th>
                    <th className="pb-3 pr-3">Attendance</th>
                    <th className="pb-3 pr-3">Score</th>
                    <th className="pb-3 pr-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-3 font-semibold text-lp-navy">{item.name}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.startup}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.mentor}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.attendance}%</td>
                      <td className="py-4 pr-3 text-slate-600">{item.score}</td>
                      <td className="py-4 pr-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, 'On Track')}
                            className="lp-focus rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700"
                          >
                            On Track
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, 'Needs Attention')}
                            className="lp-focus rounded-md bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700"
                          >
                            Flag
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No intern records available.
            </div>
          )}
        </section>
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </FacultyShell>
  )
}

export default FacultyInternsPage
