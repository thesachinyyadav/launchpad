import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

function openingTone(status) {
  if (status === 'Open') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Closed') {
    return 'bg-slate-100 text-slate-700'
  }

  return 'bg-amber-50 text-amber-700'
}

function internTone(status) {
  if (status === 'On Track') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Needs Attention') {
    return 'bg-rose-50 text-rose-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function IncubateeInternsPage() {
  const [internData, setInternData] = useState({
    openings: [],
    interns: [],
    pipeline: {},
    mentorAssignments: [],
    complianceChecklist: [],
  })
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newOpening, setNewOpening] = useState({
    role: '',
    department: '',
    duration: '',
    stipend: '',
  })
  const [toast, setToast] = useState('')

  const loadInternData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/interns')
      setInternData({
        openings: response.data?.openings || [],
        interns: response.data?.interns || [],
        pipeline: response.data?.pipeline || {},
        mentorAssignments: response.data?.mentorAssignments || [],
        complianceChecklist: response.data?.complianceChecklist || [],
      })
    } catch (requestError) {
      setError(requestError.message || 'Unable to load internship data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInternData()
  }, [])

  const visibleOpenings = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return internData.openings.filter((opening) => {
      const role = String(opening.role || '').toLowerCase()
      const department = String(opening.department || '').toLowerCase()
      return role.includes(lowered) || department.includes(lowered)
    })
  }, [internData.openings, searchText])

  const pipelineCounts = useMemo(() => {
    return Object.entries(internData.pipeline || {}).map(([stage, items]) => ({
      stage,
      count: Array.isArray(items) ? items.length : 0,
    }))
  }, [internData.pipeline])

  const createOpening = async () => {
    if (!newOpening.role || !newOpening.department || !newOpening.duration || !newOpening.stipend) {
      setToast('Fill role, department, duration, and stipend before creating opening.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    try {
      const response = await apiRequest('/incubatee/interns/openings', {
        method: 'POST',
        body: newOpening,
      })

      if (response.item) {
        setInternData((current) => ({
          ...current,
          openings: [response.item, ...current.openings],
        }))
      }

      setNewOpening({ role: '', department: '', duration: '', stipend: '' })
      setIsCreateOpen(false)
      setToast('Intern opening created.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to create opening.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  const closeOpening = async (id) => {
    try {
      const response = await apiRequest(`/incubatee/interns/openings/${id}/close`, {
        method: 'PATCH',
      })

      const updated = response.item
      setInternData((current) => ({
        ...current,
        openings: current.openings.map((item) => (item.id === updated.id ? updated : item)),
      }))
      setToast('Opening closed.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to close opening.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  return (
    <IncubateeShell
      activeKey="interns"
      title="Incubatee Interns"
      subtitle="Manage intern openings, cohort progress, and pipeline stages"
      badge="Internship Desk"
      headerAction={
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          New Opening
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
              placeholder="Search openings by role or department"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
            <button
              type="button"
              onClick={loadInternData}
              className="lp-focus rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Openings</p>
            <p className="mt-3 text-2xl font-black text-lp-navy">{internData.openings.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Interns</p>
            <p className="mt-3 text-2xl font-black text-lp-navy">{internData.interns.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Mentors</p>
            <p className="mt-3 text-2xl font-black text-lp-navy">{internData.mentorAssignments.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Compliance Items</p>
            <p className="mt-3 text-2xl font-black text-lp-navy">{internData.complianceChecklist.length}</p>
          </article>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Openings</h2>
          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : visibleOpenings.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                    <th className="pb-3 pr-3">Role</th>
                    <th className="pb-3 pr-3">Department</th>
                    <th className="pb-3 pr-3">Duration</th>
                    <th className="pb-3 pr-3">Stipend</th>
                    <th className="pb-3 pr-3">Status</th>
                    <th className="pb-3 pr-3">Applicants</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleOpenings.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-3 font-semibold text-lp-navy">{item.role}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.department}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.duration}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.stipend}</td>
                      <td className="py-4 pr-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${openingTone(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 pr-3 text-slate-600">{item.applicants}</td>
                      <td className="py-4">
                        <button
                          type="button"
                          disabled={item.status === 'Closed'}
                          onClick={() => closeOpening(item.id)}
                          className="lp-focus rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No openings found.
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Intern Cohort</h2>
            {isLoading ? (
              <div className="mt-4 h-14 animate-pulse rounded bg-slate-100" />
            ) : internData.interns.length ? (
              <div className="mt-4 space-y-3">
                {internData.interns.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-lp-navy">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.university} | {item.startup}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${internTone(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Mentor: {item.mentor} | Attendance: {item.attendance}% | Score: {item.score}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No interns assigned yet.
              </div>
            )}
          </article>

          <article className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Pipeline</h2>
              {isLoading ? (
                <div className="mt-4 h-14 animate-pulse rounded bg-slate-100" />
              ) : pipelineCounts.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {pipelineCounts.map((item) => (
                    <article key={item.stage} className="rounded-2xl border border-slate-200 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{item.stage}</p>
                      <p className="mt-2 text-2xl font-black text-lp-navy">{item.count}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No pipeline data available.
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Compliance Checklist</h2>
              {isLoading ? (
                <div className="mt-4 h-14 animate-pulse rounded bg-slate-100" />
              ) : internData.complianceChecklist.length ? (
                <div className="mt-4 space-y-2">
                  {internData.complianceChecklist.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                      <input type="checkbox" checked={Boolean(item.complete)} readOnly className="h-4 w-4" />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No compliance items available.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Create Intern Opening</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={newOpening.role}
                onChange={(event) => setNewOpening((current) => ({ ...current, role: event.target.value }))}
                placeholder="Role"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newOpening.department}
                onChange={(event) => setNewOpening((current) => ({ ...current, department: event.target.value }))}
                placeholder="Department"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newOpening.duration}
                onChange={(event) => setNewOpening((current) => ({ ...current, duration: event.target.value }))}
                placeholder="Duration (e.g. 12 weeks)"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newOpening.stipend}
                onChange={(event) => setNewOpening((current) => ({ ...current, stipend: event.target.value }))}
                placeholder="Stipend"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="lp-focus rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createOpening}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
              >
                Create Opening
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

export default IncubateeInternsPage
