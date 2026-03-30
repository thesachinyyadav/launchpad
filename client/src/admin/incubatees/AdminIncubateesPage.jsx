import { useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'

const previewModes = ['default', 'loading', 'empty', 'error']
const stageOptions = ['All', 'Post Prototype', 'Phase Alpha', 'Beta Testing', 'Market Ready']

const initialIncubatees = [
  {
    id: 'in-1',
    startup: 'NeuroGrid Labs',
    founder: 'Aanya Sen',
    stage: 'Beta Testing',
    compliance: 'Good',
    status: 'Active',
  },
  {
    id: 'in-2',
    startup: 'AgriPulse',
    founder: 'Rahul Menon',
    stage: 'Phase Alpha',
    compliance: 'Watch',
    status: 'Active',
  },
  {
    id: 'in-3',
    startup: 'AstraFlow',
    founder: 'Ira Jain',
    stage: 'Market Ready',
    compliance: 'Good',
    status: 'Graduating',
  },
]

function complianceTone(compliance) {
  if (compliance === 'Good') {
    return 'bg-emerald-50 text-emerald-700'
  }

  return 'bg-amber-50 text-amber-700'
}

function AdminIncubateesPage() {
  const [viewState, setViewState] = useState('default')
  const [stageFilter, setStageFilter] = useState('All')
  const [searchText, setSearchText] = useState('')
  const [incubatees, setIncubatees] = useState(initialIncubatees)
  const [toast, setToast] = useState('')

  const visibleIncubatees = useMemo(() => {
    const source = viewState === 'empty' ? [] : incubatees
    const lowered = searchText.trim().toLowerCase()

    return source.filter((item) => {
      const matchesStage = stageFilter === 'All' || item.stage === stageFilter
      const matchesText =
        item.startup.toLowerCase().includes(lowered) ||
        item.founder.toLowerCase().includes(lowered)

      return matchesStage && matchesText
    })
  }, [incubatees, searchText, stageFilter, viewState])

  const progressStage = (incubateeId) => {
    const stageOrder = ['Post Prototype', 'Phase Alpha', 'Beta Testing', 'Market Ready']

    setIncubatees((current) =>
      current.map((item) => {
        if (item.id !== incubateeId) {
          return item
        }

        const currentIndex = stageOrder.findIndex((stage) => stage === item.stage)
        const nextStage = stageOrder[Math.min(currentIndex + 1, stageOrder.length - 1)]

        return { ...item, stage: nextStage }
      }),
    )

    setToast('Incubatee advanced to next stage.')
    setTimeout(() => setToast(''), 1700)
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
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Add Incubatee
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
          </div>

          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search startup or founder"
            className="lp-focus mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Cohort list service unavailable.
          </section>
        ) : null}

        {viewState === 'loading' ? (
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-48 rounded bg-slate-200" />
            <div className="mt-4 h-14 rounded bg-slate-200" />
            <div className="mt-3 h-14 rounded bg-slate-200" />
          </div>
        ) : (
          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Incubatee Registry</h2>

            {viewState === 'empty' ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No incubatees found.
              </div>
            ) : (
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
                    {visibleIncubatees.map((item) => (
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

export default AdminIncubateesPage
