import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'
import { apiRequest } from '../../lib/api'

function statusTone(status) {
  if (status === 'Approved' || status === 'Settled') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Rejected') {
    return 'bg-rose-50 text-rose-700'
  }

  return 'bg-amber-50 text-amber-700'
}

function AdminFinancePage() {
  const [claims, setClaims] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [toast, setToast] = useState('')

  const loadClaims = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/admin/finance/claims')
      setClaims(response.items || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load finance claim queue.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClaims()
  }, [])

  const visibleClaims = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return claims.filter((item) => {
      return (
        item.startup.toLowerCase().includes(lowered) ||
        item.category.toLowerCase().includes(lowered) ||
        item.reference.toLowerCase().includes(lowered)
      )
    })
  }, [claims, searchText])

  const inReviewCount = useMemo(() => {
    return visibleClaims.filter((item) => item.status === 'In Review' || item.status === 'Pending').length
  }, [visibleClaims])

  const decideClaim = async (id, decision) => {
    try {
      const response = await apiRequest(`/admin/finance/claims/${id}/decision`, {
        method: 'POST',
        body: {
          decision,
        },
      })

      const updated = response.item
      setClaims((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setToast(`Claim ${updated.status.toLowerCase()}.`)
      setTimeout(() => setToast(''), 2000)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to apply claim decision.')
      setTimeout(() => setToast(''), 2000)
    }
  }

  return (
    <AdminShell
      activeKey="finance"
      title="Admin Finance"
      subtitle="Review claim requests and maintain disbursement controls"
      badge="Finance Approvals"
      headerAction={
        <button
          type="button"
          onClick={loadClaims}
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
            placeholder="Search by startup, category, or reference"
            className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Claims Visible</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{visibleClaims.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Pending Review</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{inReviewCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Approved</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">
              {visibleClaims.filter((item) => item.status === 'Approved').length}
            </p>
          </article>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Claim Approval Queue</h2>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : visibleClaims.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                    <th className="pb-3 pr-3">Startup</th>
                    <th className="pb-3 pr-3">Category</th>
                    <th className="pb-3 pr-3">Amount</th>
                    <th className="pb-3 pr-3">Submitted</th>
                    <th className="pb-3 pr-3">Reference</th>
                    <th className="pb-3 pr-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleClaims.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-3 font-semibold text-lp-navy">{item.startup}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.category}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.amount}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.submittedAt}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.reference}</td>
                      <td className="py-4 pr-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => decideClaim(item.id, 'approve')}
                            className="lp-focus rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => decideClaim(item.id, 'reject')}
                            className="lp-focus rounded-md bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700"
                          >
                            Reject
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
              No claims available.
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

export default AdminFinancePage
