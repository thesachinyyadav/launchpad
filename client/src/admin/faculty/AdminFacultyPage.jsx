import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'
import { apiRequest } from '../../lib/api'

function AdminFacultyPage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [toast, setToast] = useState('')

  const loadFaculty = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/admin/faculty')
      setItems(response.items || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load faculty directory.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFaculty()
  }, [])

  const visibleItems = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(lowered) ||
        item.specialization.toLowerCase().includes(lowered)
      )
    })
  }, [items, searchText])

  const rebalance = async (id) => {
    try {
      const response = await apiRequest(`/admin/faculty/${id}/rebalance`, {
        method: 'POST',
      })

      const updated = response.item
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )

      setToast(`Rebalanced load for ${updated.name}.`)
      setTimeout(() => setToast(''), 2000)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to rebalance faculty load.')
      setTimeout(() => setToast(''), 2000)
    }
  }

  return (
    <AdminShell
      activeKey="faculty"
      title="Admin Faculty"
      subtitle="Manage reviewer capacity and assignment balance"
      badge="Reviewer Operations"
      headerAction={
        <button
          type="button"
          onClick={loadFaculty}
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
            placeholder="Search faculty"
            className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Faculty Capacity Desk</h2>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-16 rounded bg-slate-100" />
              <div className="h-16 rounded bg-slate-100" />
            </div>
          ) : visibleItems.length ? (
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
              {visibleItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-lp-navy">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.role}</p>
                  <p className="mt-2 text-xs text-slate-600">{item.specialization}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Active Reviews: {item.activeReviews}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Capacity: {item.capacity}
                  </p>
                  <button
                    type="button"
                    onClick={() => rebalance(item.id)}
                    className="lp-focus mt-4 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Rebalance
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No faculty records found.
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

export default AdminFacultyPage
