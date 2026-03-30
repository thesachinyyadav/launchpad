import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'
import { apiRequest } from '../../lib/api'

function complianceTone(compliance) {
  if (compliance === 'Good') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (compliance === 'Watch') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-rose-50 text-rose-700'
}

function AdminIncubateesPage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [toast, setToast] = useState('')

  const loadIncubatees = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/admin/incubatees')
      setItems(response.items || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load incubatee records.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadIncubatees()
  }, [])

  const stageOptions = useMemo(() => {
    const unique = [...new Set(items.map((item) => item.stage).filter(Boolean))]
    return ['All', ...unique]
  }, [items])

  const visibleItems = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return items.filter((item) => {
      const matchesStage = stageFilter === 'All' || item.stage === stageFilter
      const matchesText =
        item.startup.toLowerCase().includes(lowered) ||
        item.founder.toLowerCase().includes(lowered)

      return matchesStage && matchesText
    })
  }, [items, searchText, stageFilter])

  const progressStage = async (id) => {
    try {
      const response = await apiRequest(`/admin/incubatees/${id}/stage`, {
        method: 'PATCH',
      })

      const updated = response.item
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )

      setToast(`${updated.startup} moved to ${updated.stage}.`)
      setTimeout(() => setToast(''), 2000)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to move incubatee stage.')
      setTimeout(() => setToast(''), 2000)
    }
  }

  return (
    <AdminShell
      activeKey="incubatees"
      title="Admin Incubatees"
      subtitle="Manage lifecycle stages, compliance posture, and cohort health"
      badge="Cohort Management"
      headerAction={
        <button
          type="button"
          onClick={loadIncubatees}
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
              {stageOptions.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={`lp-focus rounded-full px-3 py-1.5 text-xs font-semibold ${
                    stageFilter === stage
                      ? 'bg-lp-gold text-lp-navy'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>

            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search startup or founder"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Incubatee Registry</h2>

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
                    <th className="pb-3 pr-3">Startup</th>
                    <th className="pb-3 pr-3">Founder</th>
                    <th className="pb-3 pr-3">Stage</th>
                    <th className="pb-3 pr-3">Compliance</th>
                    <th className="pb-3 pr-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-3 font-semibold text-lp-navy">{item.startup}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.founder}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.stage}</td>
                      <td className="py-4 pr-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${complianceTone(item.compliance)}`}>
                          {item.compliance}
                        </span>
                      </td>
                      <td className="py-4 pr-3 text-slate-600">{item.status}</td>
                      <td className="py-4">
                        <button
                          type="button"
                          onClick={() => progressStage(item.id)}
                          className="lp-focus rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                        >
                          Move Stage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No incubatees found.
            </div>
          )}
        </section>
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </AdminShell>
  )
}

export default AdminIncubateesPage
