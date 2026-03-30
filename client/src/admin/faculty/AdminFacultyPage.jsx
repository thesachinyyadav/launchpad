import { useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const initialFaculty = [
  {
    id: 'af-1',
    name: 'Dr. Sarah Vance',
    role: 'Lead Mentor',
    specialization: 'Venture strategy',
    activeReviews: 5,
    capacity: 7,
  },
  {
    id: 'af-2',
    name: 'Marcus Chen',
    role: 'Venture Partner',
    specialization: 'Financial models',
    activeReviews: 4,
    capacity: 5,
  },
  {
    id: 'af-3',
    name: 'Elaine Park',
    role: 'Innovation Advisor',
    specialization: 'Pilot operations',
    activeReviews: 2,
    capacity: 6,
  },
]

function AdminFacultyPage() {
  const [viewState, setViewState] = useState('default')
  const [facultyMembers, setFacultyMembers] = useState(initialFaculty)
  const [searchText, setSearchText] = useState('')
  const [toast, setToast] = useState('')

  const visibleFaculty = useMemo(() => {
    const source = viewState === 'empty' ? [] : facultyMembers
    const lowered = searchText.trim().toLowerCase()

    return source.filter(
      (item) =>
        item.name.toLowerCase().includes(lowered) ||
        item.specialization.toLowerCase().includes(lowered),
    )
  }, [facultyMembers, searchText, viewState])

  const rebalanceLoad = (facultyId) => {
    setFacultyMembers((current) =>
      current.map((item) => {
        if (item.id !== facultyId) {
          return item
        }

        return { ...item, activeReviews: Math.max(0, item.activeReviews - 1) }
      }),
    )

    setToast('Workload rebalanced for selected faculty member.')
    setTimeout(() => setToast(''), 1700)
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
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Invite Faculty
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
              placeholder="Search faculty"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
          </div>
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Faculty registry unavailable.
          </section>
        ) : null}

        {viewState === 'loading' ? (
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="mt-4 h-14 rounded bg-slate-200" />
          </div>
        ) : (
          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Faculty Capacity Desk</h2>

            {viewState === 'empty' ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No faculty records found.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                {visibleFaculty.map((item) => (
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
                      onClick={() => rebalanceLoad(item.id)}
                      className="lp-focus mt-4 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Rebalance
                    </button>
                  </article>
                ))}
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

export default AdminFacultyPage
