import { useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const initialClaims = [
  {
    id: 'cf-1',
    startup: 'NeuroGrid Labs',
    category: 'Prototype Components',
    amount: 'INR 1,12,000',
    submittedAt: 'Mar 25, 2026',
    status: 'Pending',
  },
  {
    id: 'cf-2',
    startup: 'AgriPulse',
    category: 'Intern Reimbursement',
    amount: 'INR 28,400',
    submittedAt: 'Mar 24, 2026',
    status: 'Pending',
  },
  {
    id: 'cf-3',
    startup: 'AstraFlow',
    category: 'Cloud Credits',
    amount: 'INR 32,000',
    submittedAt: 'Mar 23, 2026',
    status: 'Approved',
  },
]

function statusTone(status) {
  if (status === 'Approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Rejected') {
    return 'bg-rose-50 text-rose-700'
  }

  return 'bg-amber-50 text-amber-700'
}

function AdminFinancePage() {
  const [viewState, setViewState] = useState('default')
  const [claims, setClaims] = useState(initialClaims)
  const [searchText, setSearchText] = useState('')
  const [toast, setToast] = useState('')

  const visibleClaims = useMemo(() => {
    const source = viewState === 'empty' ? [] : claims
    const lowered = searchText.trim().toLowerCase()

    return source.filter(
      (item) =>
        item.startup.toLowerCase().includes(lowered) ||
        item.category.toLowerCase().includes(lowered),
    )
  }, [claims, searchText, viewState])

  const decide = (claimId, status) => {
    setClaims((current) =>
      current.map((item) => (item.id === claimId ? { ...item, status } : item)),
    )

    setToast(`Claim ${status.toLowerCase()}.`)
    setTimeout(() => setToast(''), 1700)
  }

  const pendingCount = visibleClaims.filter((item) => item.status === 'Pending').length

  return (
    <AdminShell
      activeKey="finance"
      title="Admin Finance"
      subtitle="Review claim requests and maintain disbursement controls"
      badge="Finance Approvals"
      headerAction={
        <button
          type="button"
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Export Ledger
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
              placeholder="Search by startup or category"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
          </div>
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Finance approval queue unavailable.
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Claims Visible</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{visibleClaims.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Pending</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{pendingCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Approval SLA</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">94%</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="mt-4 h-14 rounded bg-slate-200" />
            <div className="mt-3 h-14 rounded bg-slate-200" />
          </div>
        ) : (
          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Claim Approval Queue</h2>

            {viewState === 'empty' ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No claims available.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                      <th className="pb-3 pr-3">Startup</th>
                      <th className="pb-3 pr-3">Category</th>
                      <th className="pb-3 pr-3">Amount</th>
                      <th className="pb-3 pr-3">Submitted</th>
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
                        <td className="py-4 pr-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => decide(item.id, 'Approved')}
                              className="lp-focus rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => decide(item.id, 'Rejected')}
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
            )}
          </section>
        )}
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
