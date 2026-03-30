import { useEffect, useMemo, useState } from 'react'
import { apiRequest, getActiveRole } from '../lib/api'
import RolePageShell from './RolePageShell'

const defaultSettings = {
  fullName: '',
  displayName: '',
  email: '',
  phone: '',
  organization: '',
  twoFactor: false,
  notifyEmail: true,
  notifyInApp: false,
  notifyDeadline: true,
  notifyWeekly: false,
  quietStart: '22:00',
  quietEnd: '07:00',
  theme: 'light',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
}

function toggleClass(value) {
  return value ? 'bg-lp-navy text-white' : 'bg-slate-100 text-slate-600'
}

function SettingsPage() {
  const activeRole = getActiveRole() || 'incubatee'
  const [settings, setSettings] = useState(defaultSettings)
  const [sessions, setSessions] = useState([])
  const [channel, setChannel] = useState({ mode: 'email_only', provider: 'resend' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const hasCurrentSession = useMemo(
    () => sessions.some((item) => item.current),
    [sessions],
  )

  const loadSettings = async () => {
    setIsLoading(true)
    setError('')

    try {
      const settingsResponse = await apiRequest(`/settings?role=${activeRole}`)
      const sessionsResponse = await apiRequest(`/settings/sessions?role=${activeRole}`)

      setSettings({ ...defaultSettings, ...(settingsResponse.settings || {}) })
      setChannel(settingsResponse.channel || { mode: 'email_only', provider: 'resend' })
      setSessions(sessionsResponse.sessions || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load settings.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [activeRole])

  const updateField = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  const saveSettings = async () => {
    if (!settings.fullName.trim() || !settings.displayName.trim()) {
      setToast('Full name and display name are required.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    if (settings.quietStart === settings.quietEnd) {
      setToast('Quiet start and end times cannot be the same.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    setIsSaving(true)

    try {
      const response = await apiRequest(`/settings?role=${activeRole}`, {
        method: 'PATCH',
        body: {
          role: activeRole,
          settings,
        },
      })

      setSettings({ ...defaultSettings, ...(response.settings || {}) })
      setToast('Settings saved successfully.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to save settings.')
      setTimeout(() => setToast(''), 1800)
    } finally {
      setIsSaving(false)
    }
  }

  const revokeSession = async (sessionId) => {
    try {
      const response = await apiRequest(`/settings/sessions/${sessionId}?role=${activeRole}`, {
        method: 'DELETE',
        body: { role: activeRole },
      })

      setSessions(response.sessions || [])
    } catch (requestError) {
      setToast(requestError.message || 'Unable to revoke session.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  const signOutOtherSessions = async () => {
    try {
      const response = await apiRequest('/settings/sessions/signout-others', {
        method: 'POST',
        body: { role: activeRole },
      })

      setSessions(response.sessions || [])
      setToast('Other sessions signed out.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to sign out other sessions.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  return (
    <RolePageShell
      title="Settings"
      subtitle="Role-aware account, notification, and session controls"
      badge={activeRole}
      headerAction={
        <button
          type="button"
          onClick={loadSettings}
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

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Profile</h2>
            {isLoading ? (
              <div className="mt-4 h-20 animate-pulse rounded bg-slate-100" />
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <input
                  value={settings.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  placeholder="Full name"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <input
                  value={settings.displayName}
                  onChange={(event) => updateField('displayName', event.target.value)}
                  placeholder="Display name"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <input
                  value={settings.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="Phone number"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <input
                  value={settings.organization}
                  onChange={(event) => updateField('organization', event.target.value)}
                  placeholder="Organization"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  {settings.email || 'Email from account profile'}
                </div>
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Notifications</h2>
            {isLoading ? (
              <div className="mt-4 h-20 animate-pulse rounded bg-slate-100" />
            ) : (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('notifyEmail', !settings.notifyEmail)}
                    className={`lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${toggleClass(settings.notifyEmail)}`}
                  >
                    Email Alerts
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('notifyDeadline', !settings.notifyDeadline)}
                    className={`lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${toggleClass(settings.notifyDeadline)}`}
                  >
                    Deadlines
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('notifyWeekly', !settings.notifyWeekly)}
                    className={`lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${toggleClass(settings.notifyWeekly)}`}
                  >
                    Weekly Digest
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('twoFactor', !settings.twoFactor)}
                    className={`lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${toggleClass(settings.twoFactor)}`}
                  >
                    Two Factor
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Quiet Start
                    <input
                      type="time"
                      value={settings.quietStart}
                      onChange={(event) => updateField('quietStart', event.target.value)}
                      className="lp-focus mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </label>

                  <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Quiet End
                    <input
                      type="time"
                      value={settings.quietEnd}
                      onChange={(event) => updateField('quietEnd', event.target.value)}
                      className="lp-focus mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </label>
                </div>

                <p className="text-xs text-slate-500">
                  Delivery channel: {channel.mode} via {channel.provider}
                </p>
              </div>
            )}
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Active Sessions</h2>
            <button
              type="button"
              onClick={signOutOtherSessions}
              disabled={!hasCurrentSession}
              className="lp-focus rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sign Out Others
            </button>
          </div>

          {isLoading ? (
            <div className="mt-4 h-16 animate-pulse rounded bg-slate-100" />
          ) : sessions.length ? (
            <div className="mt-4 space-y-2">
              {sessions.map((session) => (
                <article key={session.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-lp-navy">{session.device}</p>
                      <p className="text-xs text-slate-500">
                        {session.location} | {session.lastActive}
                      </p>
                    </div>

                    {session.current ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        Current
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => revokeSession(session.id)}
                        className="lp-focus rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No active sessions found.
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveSettings}
            disabled={isSaving}
            className="lp-focus rounded-lg bg-lp-navy px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </RolePageShell>
  )
}

export default SettingsPage