import { useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const initialClaims = [
  {
    id: 'cl-1',
    category: 'Intern Reimbursement',
    amount: 'INR 28,400',
    submittedAt: 'Mar 25, 2026',
    status: 'In Review',
    reference: 'EXP-2840',
  },
  {
    id: 'cl-2',
    category: 'Prototype Components',
    amount: 'INR 1,12,000',
    submittedAt: 'Mar 20, 2026',
    status: 'Approved',
    reference: 'HW-1102',
  },
  {
    id: 'cl-3',
    category: 'Cloud Credits Adjustment',
    amount: 'INR 32,000',
    submittedAt: 'Mar 18, 2026',
    status: 'Settled',
    reference: 'CC-309',
  },
]

const payoutSchedule = [
  {
    id: 'ps-1',
    date: 'Apr 02, 2026',
    title: 'Intern stipend cycle - Week 1',
    amount: 'INR 54,000',
  },
  {
    id: 'ps-2',
    date: 'Apr 06, 2026',
    title: 'Prototype procurement disbursement',
    amount: 'INR 80,000',
  },
]

const budgetBands = [
  {
    id: 'bb-1',
    name: 'R&D Budget',
    used: 62,
  },
  {
    id: 'bb-2',
    name: 'Operations Budget',
    used: 49,
  },
  {
    id: 'bb-3',
    name: 'Marketing Budget',
    used: 71,
  },
]

function statusTone(status) {
  if (status === 'Approved' || status === 'Settled') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'In Review') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={`finance-kpi-${idx}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="mt-4 h-14 rounded bg-slate-200" />
      </div>
    </div>
  )
}

function IncubateeFinancePage() {
  const [viewState, setViewState] = useState('default')
  const [claims, setClaims] = useState(initialClaims)
  const [searchText, setSearchText] = useState('')
  const [isRaiseClaimOpen, setIsRaiseClaimOpen] = useState(false)
  const [newClaim, setNewClaim] = useState({ category: '', amount: '', reference: '' })
  const [toast, setToast] = useState('')

  const visibleClaims = useMemo(() => {
    const source = viewState === 'empty' ? [] : claims
    const lowered = searchText.trim().toLowerCase()

    return source.filter(
      (item) =>
        item.category.toLowerCase().includes(lowered) ||
        item.reference.toLowerCase().includes(lowered),
    )
  }, [claims, searchText, viewState])

  const reviewCount = visibleClaims.filter((item) => item.status === 'In Review').length
  const settledCount = visibleClaims.filter((item) => item.status === 'Settled').length

  const raiseClaim = () => {
    if (!newClaim.category || !newClaim.amount || !newClaim.reference) {
      setToast('Fill all claim details before submitting.')
      setTimeout(() => setToast(''), 1600)
      return
    }

    setClaims((current) => [
      {
        id: `cl-${Date.now()}`,
        category: newClaim.category,
        amount: newClaim.amount,
        submittedAt: new Date().toLocaleDateString('en-IN'),
        status: 'In Review',
        reference: newClaim.reference,
      },
      ...current,
    ])

    setNewClaim({ category: '', amount: '', reference: '' })
    setIsRaiseClaimOpen(false)
    setToast('Claim raised successfully.')
    setTimeout(() => setToast(''), 1700)
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
              placeholder="Search by category or reference"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
          </div>
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Finance ledger failed to load. This state is intentionally provided for UI QA.
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Claims Total</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : visibleClaims.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">In Review</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : reviewCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Settled</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : settledCount}</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <>
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Claims Ledger</h2>

                {viewState === 'empty' ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-600">No claims submitted yet.</p>
                    <p className="mt-2 text-sm text-slate-500">Use Raise Claim to start reimbursement workflow.</p>
                  </div>
                ) : (
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
                )}
              </article>

              <article className="space-y-6">
                <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                  <h2 className="font-display text-xl font-extrabold text-lp-navy">Upcoming Disbursements</h2>
                  <div className="mt-4 space-y-3">
                    {(viewState === 'empty' ? [] : payoutSchedule).map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">{item.date}</p>
                        <p className="mt-1 text-sm font-semibold text-lp-navy">{item.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{item.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                  <h2 className="font-display text-xl font-extrabold text-lp-navy">Budget Bands</h2>
                  <div className="mt-4 space-y-3">
                    {(viewState === 'empty' ? [] : budgetBands).map((item) => (
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
                </div>
              </article>
            </section>
          </>
        )}
      </div>

      {isRaiseClaimOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Raise Claim</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={newClaim.category}
                onChange={(event) =>
                  setNewClaim((current) => ({ ...current, category: event.target.value }))
                }
                placeholder="Category"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newClaim.amount}
                onChange={(event) =>
                  setNewClaim((current) => ({ ...current, amount: event.target.value }))
                }
                placeholder="Amount"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newClaim.reference}
                onChange={(event) =>
                  setNewClaim((current) => ({ ...current, reference: event.target.value }))
                }
                placeholder="Reference"
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
