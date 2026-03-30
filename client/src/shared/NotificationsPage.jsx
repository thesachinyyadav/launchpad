import { useMemo, useState } from 'react'
import BrandLogo from '../components/BrandLogo'

const initialNotifications = [
  {
    id: 'n-1',
    title: 'Emergency Backup Power Alert',
    message:
      'Rack B-12 switched to backup batteries. Review power transfer protocol immediately.',
    source: 'system',
    priority: 'high',
    category: 'system',
    read: false,
    timeLabel: '2 mins ago',
    hoursAgo: 0.03,
  },
  {
    id: 'n-2',
    title: 'Faculty Mentioned You In Stage-2 Review',
    message:
      'Dr. Raghavan requested your comments on the board presentation scorecard for Cohort 2026-02.',
    source: 'faculty',
    priority: 'medium',
    category: 'mention',
    read: false,
    timeLabel: '45 mins ago',
    hoursAgo: 0.75,
  },
  {
    id: 'n-3',
    title: 'Incubatee Uploaded Quarterly Progress PPT',
    message:
      'Startup NeuroGrid uploaded Q2 progress. Review is due in 48 hours.',
    source: 'incubatee',
    priority: 'medium',
    category: 'update',
    read: false,
    timeLabel: '3 hours ago',
    hoursAgo: 3,
  },
  {
    id: 'n-4',
    title: 'Claim Settlement Completed',
    message:
      'Intern expense claim for Team Vector has been approved and marked as settled by admin.',
    source: 'admin',
    priority: 'low',
    category: 'update',
    read: true,
    timeLabel: 'Yesterday, 04:20 PM',
    hoursAgo: 26,
  },
  {
    id: 'n-5',
    title: 'System Maintenance Window Scheduled',
    message:
      'Portal maintenance is planned for Sunday 02:00 AM to 03:00 AM. No action required.',
    source: 'system',
    priority: 'low',
    category: 'system',
    read: true,
    timeLabel: '2 days ago',
    hoursAgo: 52,
  },
  {
    id: 'n-6',
    title: 'Mentor Allocation Needs Confirmation',
    message:
      'You were tagged to confirm mentor assignment for AgriPulse before tomorrow noon.',
    source: 'admin',
    priority: 'high',
    category: 'mention',
    read: false,
    timeLabel: '5 hours ago',
    hoursAgo: 5,
  },
]

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'system', label: 'System' },
]

const navItems = ['Dashboard', 'Approvals', 'Deadlines', 'System Alerts', 'Settings']

const sourceLabels = {
  incubatee: 'Incubatee',
  faculty: 'Faculty',
  admin: 'Admin',
  system: 'System',
}

const sourceBadge = {
  incubatee: 'bg-emerald-50 text-emerald-700',
  faculty: 'bg-blue-50 text-blue-700',
  admin: 'bg-indigo-50 text-indigo-700',
  system: 'bg-slate-100 text-slate-700',
}

const priorityBadge = {
  high: 'bg-rose-50 text-rose-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

const borderByPriority = {
  high: 'border-l-rose-500',
  medium: 'border-l-lp-gold',
  low: 'border-l-slate-300',
}

function timeMatches(range, hoursAgo) {
  if (range === 'today') {
    return hoursAgo <= 24
  }

  if (range === 'week') {
    return hoursAgo <= 24 * 7
  }

  return hoursAgo <= 24 * 30
}

function NotificationCard({ notification, onToggleRead, onDismiss, index }) {
  return (
    <article
      className={`animate-fade-up rounded-2xl border border-slate-200 border-l-4 p-5 shadow-sm transition hover:shadow-md sm:p-6 ${
        notification.read
          ? 'bg-slate-100/70 opacity-85'
          : 'bg-white'
      } ${borderByPriority[notification.priority]}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${priorityBadge[notification.priority]}`}>
          <span className="text-lg font-bold" aria-hidden="true">
            {notification.priority === 'high'
              ? '!'
              : notification.source === 'faculty'
                ? 'F'
                : notification.source === 'admin'
                  ? 'A'
                  : notification.source === 'incubatee'
                    ? 'I'
                    : 'S'}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${priorityBadge[notification.priority]}`}>
                {notification.priority}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${sourceBadge[notification.source]}`}>
                {sourceLabels[notification.source]}
              </span>
              {!notification.read ? (
                <span className="rounded-full bg-lp-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-lp-navy">
                  Unread
                </span>
              ) : null}
            </div>
            <span className="text-xs font-medium text-slate-500">{notification.timeLabel}</span>
          </div>

          <h3 className="font-display text-xl font-bold leading-tight text-lp-navy">
            {notification.title}
          </h3>

          <p className="text-sm leading-6 text-slate-600">{notification.message}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#13243d]"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => onToggleRead(notification.id)}
              className="lp-focus rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 hover:border-lp-gold"
            >
              {notification.read ? 'Mark Unread' : 'Mark Read'}
            </button>
            <button
              type="button"
              onClick={() => onDismiss(notification.id)}
              className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 hover:text-lp-navy"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('today')
  const [viewState, setViewState] = useState('default')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [toast, setToast] = useState('')

  const stats = useMemo(() => {
    const unread = notifications.filter((item) => !item.read).length
    const highPriority = notifications.filter(
      (item) => item.priority === 'high' && !item.read,
    ).length

    return {
      total: notifications.length,
      unread,
      highPriority,
    }
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        if (activeTab === 'unread') {
          return !item.read
        }

        if (activeTab === 'mentions') {
          return item.category === 'mention'
        }

        if (activeTab === 'system') {
          return item.category === 'system'
        }

        return true
      })
      .filter((item) => {
        if (sourceFilter === 'all') {
          return true
        }

        return item.source === sourceFilter
      })
      .filter((item) => {
        if (priorityFilter === 'all') {
          return true
        }

        return item.priority === priorityFilter
      })
      .filter((item) => timeMatches(timeFilter, item.hoursAgo))
      .filter((item) => {
        if (!search.trim()) {
          return true
        }

        const input = search.toLowerCase()
        return (
          item.title.toLowerCase().includes(input) ||
          item.message.toLowerCase().includes(input)
        )
      })
  }, [notifications, activeTab, sourceFilter, priorityFilter, timeFilter, search])

  const toggleRead = (id) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: !item.read } : item,
      ),
    )
  }

  const dismissNotification = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    )
  }

  const clearRead = () => {
    setNotifications((current) => current.filter((item) => !item.read))
  }

  const exportLog = () => {
    setToast('Export action is a UI placeholder for now.')
    setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-lp-navy lg:flex">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-gradient-to-r from-lp-navy to-[#13243d] px-4 shadow-lg lg:hidden">
        <BrandLogo compact className="[&>img]:h-9" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-lp-gold"
          >
            Alerts
          </button>
        </div>
      </header>

      <nav className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-white/10 bg-lp-navy shadow-2xl lg:flex">
        <div className="px-8 pb-8 pt-7">
          <BrandLogo textClassName="text-lp-gold" />
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            CICF Authority
          </p>
        </div>

        <div className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = item === 'Approvals'
            return (
              <button
                key={item}
                type="button"
                className={`w-full rounded-xl px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  active
                    ? 'bg-white/10 text-lp-gold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        <div className="border-t border-white/10 px-6 py-5">
          <button
            type="button"
            className="lp-focus w-full rounded-xl bg-lp-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-lp-navy"
          >
            New Request
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-6 sm:px-6 lg:ml-72 lg:px-10 lg:pb-10 lg:pt-10">
        <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-lp-navy sm:text-4xl lg:text-5xl">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Updates are currently sent by email only through Resend. This page mirrors that activity timeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              className="lp-focus rounded-xl bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 shadow-sm hover:text-lp-navy"
            >
              Mark All Read
            </button>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((current) => !current)}
              className="lp-focus rounded-xl bg-lp-navy px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-white lg:hidden"
            >
              Filters
            </button>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Delivery channel: email only via Resend. In-app cards are UI mirrors for status visibility.
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total</p>
            <p className="mt-3 font-display text-3xl font-extrabold text-lp-navy">{stats.total}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Unread</p>
            <p className="mt-3 font-display text-3xl font-extrabold text-lp-gold">{stats.unread}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">High Priority</p>
            <p className="mt-3 font-display text-3xl font-extrabold text-rose-600">{stats.highPriority}</p>
          </article>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`lp-focus rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                  activeTab === tab.id
                    ? 'bg-lp-navy text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-lp-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} space-y-3 lg:block`}>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications"
                className="lp-focus rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
                aria-label="Search notifications"
              />

              <select
                value={sourceFilter}
                onChange={(event) => setSourceFilter(event.target.value)}
                className="lp-focus rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                aria-label="Filter by source"
              >
                <option value="all">Source: All</option>
                <option value="incubatee">Incubatee</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
                <option value="system">System</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="lp-focus rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                aria-label="Filter by priority"
              >
                <option value="all">Priority: All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={timeFilter}
                onChange={(event) => setTimeFilter(event.target.value)}
                className="lp-focus rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                aria-label="Filter by time range"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">State Preview</span>
              {['default', 'loading', 'empty', 'error'].map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setViewState(state)}
                  className={`lp-focus rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                    viewState === state
                      ? 'bg-lp-navy text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-lp-navy'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </section>

        {viewState === 'error' ? (
          <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-medium text-rose-700">
              Unable to sync latest email activity. Last updated 5 minutes ago.
            </p>
            <button
              type="button"
              onClick={() => setViewState('default')}
              className="lp-focus rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white"
            >
              Retry
            </button>
          </section>
        ) : null}

        <section className="space-y-4">
          {viewState === 'loading' ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`loader-${index}`}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3.5 w-1/4 rounded bg-slate-100" />
                    <div className="h-5 w-2/3 rounded bg-slate-100" />
                    <div className="h-3.5 w-full rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))
          ) : null}

          {viewState === 'empty' || (viewState === 'default' && filteredNotifications.length === 0) ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <p className="font-display text-2xl font-bold text-lp-navy">No notifications found</p>
              <p className="mt-2 text-sm text-slate-600">
                Try changing filters or check again later for updates.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all')
                  setSourceFilter('all')
                  setPriorityFilter('all')
                  setTimeFilter('month')
                  setSearch('')
                  setViewState('default')
                }}
                className="lp-focus mt-6 rounded-xl bg-lp-navy px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : null}

          {viewState === 'default'
            ? filteredNotifications.map((notification, index) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onToggleRead={toggleRead}
                onDismiss={dismissNotification}
                index={index}
              />
            ))
            : null}
        </section>
      </main>

      <div className="fixed bottom-24 right-4 z-30 rounded-full bg-lp-navy p-2 shadow-xl sm:right-8 lg:bottom-8">
        <div className="flex items-center gap-2 rounded-full bg-lp-navy px-2 py-1 text-white">
          <button
            type="button"
            onClick={clearRead}
            className="lp-focus rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] hover:text-lp-gold"
          >
            Clear Read
          </button>
          <span className="h-4 w-px bg-white/20" aria-hidden="true" />
          <button
            type="button"
            onClick={exportLog}
            className="lp-focus rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] hover:text-lp-gold"
          >
            Export
          </button>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-lp-navy px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-white/10 bg-lp-navy/95 backdrop-blur lg:hidden">
        {['Home', 'Alerts', 'Tasks', 'Profile'].map((item) => (
          <button
            key={item}
            type="button"
            className={`lp-focus rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] ${
              item === 'Alerts' ? 'text-lp-gold' : 'text-slate-300'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default NotificationsPage