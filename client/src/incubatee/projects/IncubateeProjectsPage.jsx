import { useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const healthOptions = ['All', 'Healthy', 'Watch', 'At Risk']

const initialProjects = [
  {
    id: 'pj-1',
    name: 'Predictive Diagnostics Engine',
    owner: 'Felix Alpha Team',
    stage: 'Beta Testing',
    health: 'Healthy',
    budgetUsed: 72,
    progress: 68,
    nextMilestone: 'Clinical pilot batch-2',
  },
  {
    id: 'pj-2',
    name: 'Low-Power Device Firmware',
    owner: 'Embedded Pod',
    stage: 'Phase Alpha',
    health: 'Watch',
    budgetUsed: 54,
    progress: 49,
    nextMilestone: 'Integration test report',
  },
  {
    id: 'pj-3',
    name: 'B2B Market Expansion Program',
    owner: 'Growth Pod',
    stage: 'Market Ready',
    health: 'At Risk',
    budgetUsed: 85,
    progress: 58,
    nextMilestone: 'Channel partner onboarding',
  },
]

const milestoneItems = [
  {
    id: 'ms-1',
    title: 'Milestone M4 Review',
    date: 'Apr 04, 2026',
    team: 'Predictive Diagnostics Engine',
    status: 'Due Soon',
  },
  {
    id: 'ms-2',
    title: 'Pilot User Interviews',
    date: 'Apr 08, 2026',
    team: 'B2B Market Expansion Program',
    status: 'Planned',
  },
  {
    id: 'ms-3',
    title: 'Firmware Regression Pack',
    date: 'Apr 12, 2026',
    team: 'Low-Power Device Firmware',
    status: 'Blocked',
  },
]

const riskItems = [
  {
    id: 'r-1',
    risk: 'Hardware vendor lead time increases',
    owner: 'Embedded Pod',
    impact: 'High',
    mitigation: 'Secondary supplier evaluation in progress',
  },
  {
    id: 'r-2',
    risk: 'Pilot conversion below target',
    owner: 'Growth Pod',
    impact: 'Medium',
    mitigation: 'Pricing experiment with two enterprise cohorts',
  },
]

function statusTone(status) {
  if (status === 'Blocked') {
    return 'bg-rose-50 text-rose-700'
  }

  if (status === 'Due Soon') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function healthTone(health) {
  if (health === 'Healthy') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (health === 'Watch') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-rose-50 text-rose-700'
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={`projects-kpi-${idx}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="mt-3 h-8 w-14 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-14 rounded-xl bg-slate-200" />
        <div className="mt-3 h-14 rounded-xl bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
          <div className="h-6 w-44 rounded bg-slate-200" />
          <div className="mt-4 h-28 rounded-xl bg-slate-200" />
        </div>
        <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
          <div className="h-6 w-36 rounded bg-slate-200" />
          <div className="mt-4 h-28 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

function IncubateeProjectsPage() {
  const [viewState, setViewState] = useState('default')
  const [searchText, setSearchText] = useState('')
  const [healthFilter, setHealthFilter] = useState('All')

  const projects = viewState === 'empty' ? [] : initialProjects

  const visibleProjects = useMemo(() => {
    const lowerText = searchText.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesText =
        project.name.toLowerCase().includes(lowerText) ||
        project.owner.toLowerCase().includes(lowerText)

      const matchesHealth = healthFilter === 'All' || project.health === healthFilter

      return matchesText && matchesHealth
    })
  }, [healthFilter, projects, searchText])

  const healthyCount = projects.filter((project) => project.health === 'Healthy').length
  const atRiskCount = projects.filter((project) => project.health === 'At Risk').length

  return (
    <IncubateeShell
      activeKey="projects"
      title="Incubatee Projects"
      subtitle="Track active workstreams, milestones, and execution risk"
      badge="Portfolio Pulse"
      headerAction={
        <button
          type="button"
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          New Project
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
              {healthOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHealthFilter(option)}
                  className={`lp-focus rounded-full px-3 py-1.5 text-xs font-semibold ${
                    healthFilter === option
                      ? 'bg-lp-gold text-lp-navy'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search project name or owner"
            className="lp-focus mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Unable to fetch project status right now. Keep this page as a UI preview until backend sync is enabled.
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Active Projects</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{projects.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Healthy Programs</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{healthyCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">At Risk</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{atRiskCount}</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <>
            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Project Board</h2>

              {viewState === 'empty' ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">No active projects found.</p>
                  <p className="mt-2 text-sm text-slate-500">Start a new project to begin milestone tracking.</p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  {visibleProjects.map((project) => (
                    <article key={project.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-lp-navy">{project.name}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${healthTone(project.health)}`}>
                          {project.health}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">Owner: {project.owner}</p>
                      <p className="mt-1 text-xs text-slate-500">Stage: {project.stage}</p>
                      <p className="mt-1 text-xs text-slate-500">Next: {project.nextMilestone}</p>

                      <div className="mt-3 space-y-2">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-lp-gold to-[#f0cf76]"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            <span>Budget Used</span>
                            <span>{project.budgetUsed}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-lp-navy"
                              style={{ width: `${project.budgetUsed}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Upcoming Milestones</h2>
                <div className="mt-4 space-y-3">
                  {(viewState === 'empty' ? [] : milestoneItems).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-lp-navy">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.team}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Due {item.date}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Risk Register</h2>
                <div className="mt-4 space-y-3">
                  {(viewState === 'empty' ? [] : riskItems).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-lp-navy">{item.risk}</p>
                      <p className="mt-1 text-xs text-slate-500">Owner: {item.owner}</p>
                      <p className="mt-1 text-xs text-slate-500">Mitigation: {item.mitigation}</p>
                      <span
                        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.impact === 'High'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        Impact: {item.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </IncubateeShell>
  )
}

export default IncubateeProjectsPage
