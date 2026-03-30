import { useEffect, useMemo, useState } from 'react'
import { apiRequest, getActiveRole } from '../lib/api'
import RolePageShell from './RolePageShell'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'system', label: 'System' },
]

function priorityTone(priority) {
  if (priority === 'high') {
    return 'bg-rose-50 text-rose-700'
  }

  if (priority === 'medium') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function sourceTone(source) {
  if (source === 'faculty') {
    return 'bg-blue-50 text-blue-700'
  }

  if (source === 'incubatee') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (source === 'admin') {
    return 'bg-indigo-50 text-indigo-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function NotificationsPage() {
  const activeRole = getActiveRole() || 'incubatee'
  const [items, setItems] = useState([])
  const [stats, setStats] = useState({ total: 0, unread: 0, highPriority: 0 })
  const [channel, setChannel] = useState({ mode: 'email_only', provider: 'resend' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [toast, setToast] = useState('')

  const loadNotifications = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest(`/notifications?role=${activeRole}`)
      setItems(response.items || [])
      setStats(response.stats || { total: 0, unread: 0, highPriority: 0 })
      setChannel(response.channel || { mode: 'email_only', provider: 'resend' })
    } catch (requestError) {
      setError(requestError.message || 'Unable to load notifications.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [activeRole])

  const visibleItems = useMemo(() => {
    const input = search.trim().toLowerCase()

    return items
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
        if (!input) {
          return true
        }

        return (
          item.title.toLowerCase().includes(input) ||
          item.message.toLowerCase().includes(input)
        )
      })
  }, [activeTab, items, search])

  const updateNotificationState = async (id, read) => {
    try {
      const response = await apiRequest(`/notifications/${id}/read`, {
        method: 'PATCH',
        body: { role: activeRole, read },
      })

      setItems((current) =>
        current.map((item) => (item.id === id ? response.item : item)),
      )
      setStats(response.stats || stats)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to update notification state.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  const dismissNotification = async (id) => {
    try {
      const response = await apiRequest(`/notifications/${id}?role=${activeRole}`, {
        method: 'DELETE',
        body: { role: activeRole },
      })

      setItems(response.items || [])
      setStats(response.stats || stats)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to dismiss notification.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  const markAllRead = async () => {
    try {
      const response = await apiRequest('/notifications/mark-all-read', {
        method: 'POST',
        body: { role: activeRole },
      })

      setItems(response.items || [])
      setStats(response.stats || stats)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to mark all as read.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  const clearRead = async () => {
    try {
      const response = await apiRequest('/notifications/clear-read', {
        method: 'POST',
        body: { role: activeRole },
      })

      setItems(response.items || [])
      setStats(response.stats || stats)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to clear read notifications.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  return (
    <RolePageShell
      title="Notifications"
      subtitle="Role-scoped alerts delivered through backend workflows"
      badge={`${stats.unread} unread`}
      headerAction={
        <button
          type="button"
          onClick={loadNotifications}
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
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={markAllRead}
                className="lp-focus rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-slate-700"
              >
                Mark All Read
              </button>
              <button
                type="button"
                onClick={clearRead}
                className="lp-focus rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-slate-700"
              >
                Clear Read
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`lp-focus rounded-full px-3 py-1.5 text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-lp-navy text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-black text-lp-navy">{stats.total}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Unread</p>
            <p className="mt-2 text-2xl font-black text-lp-navy">{stats.unread}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">High Priority</p>
            <p className="mt-2 text-2xl font-black text-lp-navy">{stats.highPriority}</p>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Delivery</p>
            <p className="mt-2 text-sm font-semibold text-lp-navy">
              {channel.mode} / {channel.provider}
            </p>
          </article>
        </section>

        <section className="space-y-3">
          {isLoading ? (
            <>
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </>
          ) : visibleItems.length ? (
            visibleItems.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${priorityTone(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${sourceTone(item.source)}`}>
                      {item.source}
                    </span>
                    {!item.read ? (
                      <span className="rounded-full bg-lp-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase text-lp-navy">
                        Unread
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-slate-500">{item.timeLabel}</span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-lp-navy">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateNotificationState(item.id, !item.read)}
                    className="lp-focus rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700"
                  >
                    {item.read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissNotification(item.id)}
                    className="lp-focus rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Dismiss
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No notifications match the current filters.
            </article>
          )}
        </section>
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </RolePageShell>
  )
}

export default NotificationsPage