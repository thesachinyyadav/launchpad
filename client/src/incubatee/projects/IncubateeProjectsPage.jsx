import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

const healthOptions = ['All', 'Healthy', 'Watch', 'At Risk']

function healthTone(health) {
  if (health === 'Healthy') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (health === 'Watch') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-rose-50 text-rose-700'
}

function IncubateeProjectsPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [healthFilter, setHealthFilter] = useState('All')

  const loadProjects = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/projects')
      setProjects(response.items || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load projects.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const visibleProjects = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesText =
        project.name.toLowerCase().includes(lowered) ||
        project.owner.toLowerCase().includes(lowered)

      const matchesHealth = healthFilter === 'All' || project.health === healthFilter

      return matchesText && matchesHealth
    })
  }, [healthFilter, projects, searchText])

  return (
    <IncubateeShell
      activeKey="projects"
      title="Incubatee Projects"
      subtitle="Track active workstreams, milestones, and execution risk"
      badge="Portfolio Pulse"
      headerAction={
        <button
          type="button"
          onClick={loadProjects}
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

            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search project name or owner"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Project Board</h2>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : visibleProjects.length ? (
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
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No active projects found.
            </div>
          )}
        </section>
      </div>
    </IncubateeShell>
  )
}

export default IncubateeProjectsPage
