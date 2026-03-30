import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

function statusTone(status) {
  if (status === 'Approved' || status === 'Settled') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'In Review') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function IncubateeFinancePage() {
  const [finance, setFinance] = useState({ claims: [], payoutSchedule: [], budgetBands: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [isRaiseClaimOpen, setIsRaiseClaimOpen] = useState(false)
  const [newClaim, setNewClaim] = useState({ category: '', amount: '', reference: '' })
  const [toast, setToast] = useState('')

  const loadFinance = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/finance')
      setFinance({
        claims: response.claims || [],
        payoutSchedule: response.payoutSchedule || [],
        budgetBands: response.budgetBands || [],
      })
    } catch (requestError) {
      setError(requestError.message || 'Unable to load finance data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFinance()
  }, [])

  const visibleClaims = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return finance.claims.filter((item) => {
      return (
        item.category.toLowerCase().includes(lowered) ||
        item.reference.toLowerCase().includes(lowered)
      )
    })
  }, [finance.claims, searchText])

  const raiseClaim = async () => {
    if (!newClaim.category || !newClaim.amount) {
      setToast('Fill category and amount before submitting.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    try {
      const response = await apiRequest('/incubatee/finance/claims', {
        method: 'POST',
        body: {
          category: newClaim.category,
          amount: newClaim.amount,
          reference: newClaim.reference,
        },
      })

      if (response.item) {
        setFinance((current) => ({
          ...current,
          claims: [response.item, ...current.claims],
        }))
      }

      setNewClaim({ category: '', amount: '', reference: '' })
      setIsRaiseClaimOpen(false)
      setToast('Claim raised successfully.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to raise claim.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  return (
    <IncubateeShell
      activeKey="finance"
      title="Incubatee Finance"
      subtitle="Track claims, disbursements, and budget utilization"
      badge="Finance Desk"
      headerAction={
        <button
          type="button"
          onClick={() => setIsRaiseClaimOpen(true)}
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Raise Claim
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
              placeholder="Search by category or reference"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
            <button
              type="button"
              onClick={loadFinance}
              className="lp-focus rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Claims Ledger</h2>

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
                      <th className="pb-3 pr-3">Category</th>
                      <th className="pb-3 pr-3">Amount</th>
                      <th className="pb-3 pr-3">Submitted</th>
                      <th className="pb-3 pr-3">Reference</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleClaims.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 pr-3 font-semibold text-lp-navy">{item.category}</td>
                        <td className="py-4 pr-3 text-slate-600">{item.amount}</td>
                        <td className="py-4 pr-3 text-slate-600">{item.submittedAt}</td>
                        <td className="py-4 pr-3 text-slate-600">{item.reference}</td>
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
                No claims submitted yet.
              </div>
            )}
          </article>

          <article className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Upcoming Disbursements</h2>
              {isLoading ? (
                <div className="mt-4 h-14 animate-pulse rounded bg-slate-100" />
              ) : finance.payoutSchedule.length ? (
                <div className="mt-4 space-y-3">
                  {finance.payoutSchedule.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">{item.date}</p>
                      <p className="mt-1 text-sm font-semibold text-lp-navy">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-600">{item.amount}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No scheduled disbursements.
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Budget Bands</h2>
              {isLoading ? (
                <div className="mt-4 h-14 animate-pulse rounded bg-slate-100" />
              ) : finance.budgetBands.length ? (
                <div className="mt-4 space-y-3">
                  {finance.budgetBands.map((item) => (
                    <div key={item.id}>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        <span>{item.name}</span>
                        <span>{item.used}% used</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-lp-gold to-[#f0cf76]"
                          style={{ width: `${item.used}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No budget data available.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>

      {isRaiseClaimOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Raise Claim</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={newClaim.category}
                onChange={(event) => setNewClaim((current) => ({ ...current, category: event.target.value }))}
                placeholder="Category"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newClaim.amount}
                onChange={(event) => setNewClaim((current) => ({ ...current, amount: event.target.value }))}
                placeholder="Amount"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newClaim.reference}
                onChange={(event) => setNewClaim((current) => ({ ...current, reference: event.target.value }))}
                placeholder="Reference (optional)"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRaiseClaimOpen(false)}
                className="lp-focus rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={raiseClaim}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
              >
                Submit Claim
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

export default IncubateeFinancePage
