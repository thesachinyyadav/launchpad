import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'

const navigationItems = [
  'Dashboard',
  'Projects',
  'Submissions',
  'Faculty',
  'Finance',
  'Support',
]

const incubationStages = [
  { id: 's1', label: 'Post Prototype', status: 'complete' },
  { id: 's2', label: 'Phase Alpha', status: 'complete' },
  { id: 's3', label: 'Beta Testing', status: 'active' },
  { id: 's4', label: 'Market Ready', status: 'upcoming' },
]

const baseStats = [
  {
    id: 'st-1',
    label: 'Pending Submissions',
    value: 3,
    color: 'bg-blue-50 text-blue-700',
  },
  {
    id: 'st-2',
    label: 'Intern Requests',
    value: 8,
    color: 'bg-purple-50 text-purple-700',
  },
  {
    id: 'st-3',
    label: 'Claims In Review',
    value: 2,
    color: 'bg-amber-50 text-amber-700',
  },
  {
    id: 'st-4',
    label: 'Documents Available',
    value: 14,
    color: 'bg-emerald-50 text-emerald-700',
  },
]

const baseDeadlines = [
  {
    id: 'd-1',
    title: 'Upload PPT',
    detail: 'Final Investor Pitch Deck',
    daysLeft: 2,
    cta: 'Submit Now',
  },
  {
    id: 'd-2',
    title: 'Submit Docs',
    detail: 'Tax Compliance Certificates',
    daysLeft: 4,
    cta: 'Upload Files',
  },
  {
    id: 'd-3',
    title: 'Intern Attendance Sync',
    detail: 'Weekly attendance closure',
    daysLeft: 1,
    cta: 'Review Attendance',
  },
]

const baseAnnouncements = [
  {
    id: 'a-1',
    source: 'Admin',
    title: 'New Intern Portal Live',
    message:
      'You can now request interns from partner universities via the quick actions menu.',
    date: 'Mar 29, 2026',
    read: false,
  },
  {
    id: 'a-2',
    source: 'Faculty',
    title: 'Workshop: IP Strategy',
    message:
      'Join the session on intellectual property management for deep-tech startups.',
    date: 'Mar 27, 2026',
    read: false,
  },
  {
    id: 'a-3',
    source: 'Admin',
    title: 'Cohort Demo Day Timeline',
    message:
      'Stage-2 incubatees must submit final deck and one-page summary before Apr 06.',
    date: 'Mar 25, 2026',
    read: true,
  },
]

const baseActivities = [
  {
    id: 'ac-1',
    type: 'submissions',
    title: 'Uploaded progress PPT',
    detail: 'Technical deck for Milestone 4: Database Scalability',
    time: '2h ago',
  },
  {
    id: 'ac-2',
    type: 'reviews',
    title: 'Faculty review comments',
    detail: 'Dr. Sarah Jenkins added comments on your financial audit',
    time: 'Yesterday',
  },
  {
    id: 'ac-3',
    type: 'stage',
    title: 'Stage status update',
    detail: "Project moved from 'Phase Alpha' to 'Beta Testing'",
    time: '3 days ago',
  },
  {
    id: 'ac-4',
    type: 'submissions',
    title: 'Claim supporting file added',
    detail: 'Invoice attachment uploaded for intern reimbursement claim',
    time: '4 days ago',
  },
]

const quickActions = [
  'Submit Presentation',
  'Upload Progress PPT',
  'Request Interns',
  'Raise Claim',
  'View Documents',
]

const activityFilterOptions = [
  { id: 'all', label: 'All' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'stage', label: 'Stage Updates' },
]

const previewModes = ['default', 'loading', 'empty', 'error']

function LoadingDashboard() {
  return (
    <div className="space-y-7">
      <div className="animate-pulse rounded-3xl bg-slate-200/70 p-8">
        <div className="h-4 w-28 rounded bg-slate-300" />
        <div className="mt-4 h-10 w-64 rounded bg-slate-300" />
        <div className="mt-4 h-4 w-96 rounded bg-slate-300" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="mt-8 h-10 rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`stat-loader-${index}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
                <div className="h-8 w-8 rounded bg-slate-200" />
                <div className="mt-4 h-7 w-14 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-24 rounded bg-slate-200" />
              </div>
            ))}
          </div>
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="mt-4 space-y-3">
              <div className="h-12 rounded bg-slate-200" />
              <div className="h-12 rounded bg-slate-200" />
              <div className="h-12 rounded bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="animate-pulse rounded-3xl bg-slate-300/90 p-8">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-28 rounded bg-slate-200/80" />
          </div>
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-5 w-36 rounded bg-slate-200" />
            <div className="mt-5 h-20 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

function IncubateeDashboardPage() {
  const [previewMode, setPreviewMode] = useState('default')
  const [announcementItems, setAnnouncementItems] = useState(baseAnnouncements)
  const [activityFilter, setActivityFilter] = useState('all')
  const [mobileDeadlinesOpen, setMobileDeadlinesOpen] = useState(true)
  const [toast, setToast] = useState('')

  const progressPercent = useMemo(() => {
    const activeIndex = incubationStages.findIndex((stage) => stage.status === 'active')
    if (activeIndex < 0) {
      return 0
    }

    return Math.round(((activeIndex + 1) / incubationStages.length) * 100)
  }, [])

  const filteredActivities = useMemo(() => {
    if (previewMode === 'empty') {
      return []
    }

    if (activityFilter === 'all') {
      return baseActivities
    }

    return baseActivities.filter((item) => item.type === activityFilter)
  }, [activityFilter, previewMode])

  const visibleAnnouncements =
    previewMode === 'empty' ? [] : announcementItems

  const unreadAnnouncements = visibleAnnouncements.filter(
    (item) => !item.read,
  ).length

  const showErrorBanner = previewMode === 'error'

  const markAnnouncementRead = (announcementId) => {
    setAnnouncementItems((current) =>
      current.map((item) =>
        item.id === announcementId ? { ...item, read: true } : item,
      ),
    )
  }

  const runQuickAction = (actionLabel) => {
    setToast(`${actionLabel} action is ready for backend wiring.`)
    setTimeout(() => setToast(''), 2000)
  }

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-lp-navy">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/10 bg-lp-navy px-4 py-8 shadow-2xl lg:flex">
        <div className="mb-10 px-2">
          <BrandLogo textClassName="text-white" />
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-lp-gold">
            CICF Incubator
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navigationItems.map((item) => {
            const isActive = item === 'Dashboard'
            return (
              <button
                key={item}
                type="button"
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-white/10 text-lp-gold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          className="lp-focus mt-6 rounded-xl bg-lp-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-lp-navy"
        >
          New Project
        </button>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:ml-64">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 md:flex">
              Week of {todayLabel}
            </div>
            <div className="rounded-full bg-lp-gold/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-lp-navy">
              Stage: Beta Testing
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/notifications"
              className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 hover:text-lp-navy"
            >
              Notifications
            </Link>
            <Link
              to="/settings"
              className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 hover:text-lp-navy"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-8 lg:pb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-lp-navy sm:text-4xl">
            Incubatee Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Preview
            </span>
            {previewModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                className={`lp-focus rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                  previewMode === mode
                    ? 'bg-lp-navy text-white'
                    : 'bg-white text-slate-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {showErrorBanner ? (
          <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-medium text-rose-700">
              Unable to sync live dashboard widgets. Showing last known values.
            </p>
            <button
              type="button"
              onClick={() => setPreviewMode('default')}
              className="lp-focus rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white"
            >
              Retry
            </button>
          </section>
        ) : null}

        {previewMode === 'loading' ? (
          <LoadingDashboard />
        ) : (
          <>
            <section className="mb-8 rounded-3xl bg-gradient-to-br from-lp-navy to-[#13243d] p-7 shadow-2xl sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-lp-gold">
                    Welcome Back
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
                    Alexander Sterling
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                    Driving innovation with Lunar Logistics Group. Your technical roadmap is on track for Q4 milestones.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs">
                      <p className="uppercase tracking-[0.12em] text-slate-300">CICF ID</p>
                      <p className="mt-1 font-semibold text-white">LP-2026-LLG</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs">
                      <p className="uppercase tracking-[0.12em] text-slate-300">Current Stage</p>
                      <p className="mt-1 font-semibold text-lp-gold">Beta Testing</p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 md:w-auto">
                  <button
                    type="button"
                    onClick={() => runQuickAction('Launch Review Session')}
                    className="lp-focus rounded-xl bg-lp-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-lp-navy"
                  >
                    Launch Review Session
                  </button>
                  <button
                    type="button"
                    onClick={() => runQuickAction('View Technical Roadmap')}
                    className="lp-focus rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-white/10"
                  >
                    View Technical Roadmap
                  </button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-8 lg:col-span-8">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-lp-navy">
                      Incubation Progress
                    </h3>
                    <span className="rounded-full bg-lp-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-lp-navy">
                      {progressPercent}% Complete
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-200" />
                    <div
                      className="absolute left-0 top-5 h-1 rounded-full bg-lp-gold"
                      style={{ width: `${progressPercent}%` }}
                    />

                    <div className="relative grid grid-cols-4 gap-3">
                      {incubationStages.map((stage) => {
                        const isComplete = stage.status === 'complete'
                        const isActive = stage.status === 'active'

                        return (
                          <div key={stage.id} className="flex flex-col items-center text-center">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold ${
                                isActive
                                  ? 'h-12 w-12 border-white bg-lp-gold text-white shadow-lg ring-4 ring-lp-gold/20'
                                  : isComplete
                                    ? 'border-lp-gold bg-lp-gold text-white'
                                    : 'border-slate-300 bg-white text-slate-400'
                              }`}
                            >
                              {isComplete ? 'Y' : isActive ? 'A' : 'N'}
                            </div>
                            <p
                              className={`mt-3 text-[11px] font-bold uppercase tracking-[0.1em] ${
                                isActive
                                  ? 'text-[#755b00]'
                                  : isComplete
                                    ? 'text-lp-navy'
                                    : 'text-slate-400'
                              }`}
                            >
                              {stage.label}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {baseStats.map((card) => (
                    <article
                      key={card.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${card.color}`}>
                        {card.value}
                      </div>
                      <p className="mt-3 font-display text-3xl font-extrabold text-lp-navy">
                        {String(card.value).padStart(2, '0')}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {card.label}
                      </p>
                    </article>
                  ))}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-lp-navy">Recent Activity</h3>
                    <div className="flex flex-wrap gap-2">
                      {activityFilterOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setActivityFilter(option.id)}
                          className={`lp-focus rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                            activityFilter === option.id
                              ? 'bg-lp-navy text-white'
                              : 'bg-slate-100 text-slate-600 hover:text-lp-navy'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredActivities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                      <p className="text-sm font-semibold text-lp-navy">No activity available</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Activity entries will appear once new submissions or reviews happen.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredActivities.map((item, index) => (
                        <article
                          key={item.id}
                          className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="mt-1 flex flex-col items-center">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                item.type === 'submissions'
                                  ? 'bg-lp-gold'
                                  : item.type === 'reviews'
                                    ? 'bg-blue-500'
                                    : 'bg-emerald-500'
                              }`}
                            />
                            {index < filteredActivities.length - 1 ? (
                              <span className="mt-2 h-full w-px bg-slate-300" aria-hidden="true" />
                            ) : null}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-lp-navy">{item.title}</p>
                              <span className="text-xs text-slate-500">{item.time}</span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-8 lg:col-span-4">
                <section className="rounded-3xl bg-lp-navy p-6 text-white shadow-xl sm:p-8">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold">Upcoming Deadlines</h3>
                    <button
                      type="button"
                      onClick={() => setMobileDeadlinesOpen((current) => !current)}
                      className="lp-focus rounded-lg border border-white/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white lg:hidden"
                    >
                      {mobileDeadlinesOpen ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  <div className={`${mobileDeadlinesOpen ? 'space-y-4' : 'hidden lg:block lg:space-y-4'}`}>
                    {baseDeadlines.map((deadline) => (
                      <article
                        key={deadline.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{deadline.title}</p>
                            <p className="mt-1 text-[11px] text-slate-300">{deadline.detail}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-extrabold text-lp-gold">{deadline.daysLeft}d</p>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Left</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => runQuickAction(deadline.cta)}
                          className="lp-focus w-full rounded-lg bg-lp-gold px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-lp-navy"
                        >
                          {deadline.cta}
                        </button>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-lp-navy">Announcements</h3>
                    <span className="rounded-full bg-lp-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-lp-navy">
                      {unreadAnnouncements} unread
                    </span>
                  </div>

                  {visibleAnnouncements.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-lp-navy">No announcements</p>
                      <p className="mt-1 text-xs text-slate-500">You are all caught up for now.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visibleAnnouncements.map((announcement) => (
                        <article
                          key={announcement.id}
                          className={`rounded-xl border px-4 py-3 ${
                            announcement.read
                              ? 'border-slate-200 bg-slate-50'
                              : 'border-lp-gold/35 bg-lp-gold/5'
                          }`}
                        >
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                                announcement.source === 'Admin'
                                  ? 'bg-lp-gold/20 text-[#755b00]'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {announcement.source}
                            </span>
                            <span className="text-[10px] text-slate-500">{announcement.date}</span>
                          </div>

                          <p className="text-sm font-semibold text-lp-navy">{announcement.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{announcement.message}</p>

                          {!announcement.read ? (
                            <button
                              type="button"
                              onClick={() => markAnnouncementRead(announcement.id)}
                              className="lp-focus mt-3 rounded-lg border border-lp-gold/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-lp-navy"
                            >
                              Mark Read
                            </button>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-100 p-6 shadow-sm sm:p-8">
                  <h3 className="mb-5 font-display text-xl font-bold text-lp-navy">Quick Actions</h3>
                  <div className="space-y-3">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => runQuickAction(action)}
                        className="lp-focus w-full rounded-xl bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-lp-navy transition hover:bg-lp-gold hover:text-lp-navy"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-lp-navy/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {['Submit', 'PPT', 'Interns', 'Claims'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => runQuickAction(item)}
              className="lp-focus rounded-lg bg-white/10 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-lp-navy px-4 py-2 text-sm text-white shadow-xl lg:bottom-6">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export default IncubateeDashboardPage