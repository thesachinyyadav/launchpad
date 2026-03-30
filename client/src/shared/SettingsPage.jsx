import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { apiRequest, getActiveRole } from '../lib/api'

const sectionMeta = [
  {
    id: 'profile',
    label: 'Profile',
    subtitle: 'Identity and contact details',
  },
  {
    id: 'security',
    label: 'Security',
    subtitle: 'Password and access controls',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    subtitle: 'Email delivery and quiet hours',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    subtitle: 'Theme and accessibility',
  },
  {
    id: 'sessions',
    label: 'Sessions',
    subtitle: 'Devices and account controls',
  },
]

const defaultSettings = {
  fullName: 'Alexander Sterling',
  displayName: 'A.Sterling',
  email: 'alexander.sterling@launchpad-cicf.com',
  phone: '+91 98765 43210',
  organization: 'Lunar Logistics Group',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: true,
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

const defaultMobileOpen = {
  profile: true,
  security: false,
  notifications: false,
  appearance: false,
  sessions: false,
}

const initialSessions = [
  {
    id: 's-1',
    device: 'MacBook Pro 16"',
    location: 'Bangalore, India',
    lastActive: 'Just now',
    current: true,
  },
  {
    id: 's-2',
    device: 'iPhone 15 Pro',
    location: 'Bangalore, India',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: 's-3',
    device: 'Windows Workstation',
    location: 'Chennai, India',
    lastActive: 'Yesterday',
    current: false,
  },
]

const inputClassName =
  'lp-focus w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400'

function ToggleSwitch({ id, checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
      <div>
        <p className="text-sm font-semibold text-lp-navy">{label}</p>
        {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`lp-focus relative h-6 w-12 rounded-full transition ${
          checked ? 'bg-lp-gold' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? 'right-1' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

function SectionIntro({ title, body }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-bold text-lp-navy">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  )
}

function PasswordRule({ passed, text }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${passed ? 'text-emerald-700' : 'text-slate-500'}`}>
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
          passed
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-300 bg-white text-slate-400'
        }`}
        aria-hidden="true"
      >
        {passed ? 'Y' : '-'}
      </span>
      {text}
    </li>
  )
}

function SkeletonPanel() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="h-4 w-44 rounded bg-slate-100" />
      <div className="mt-3 h-3 w-72 rounded bg-slate-100" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-11 rounded-xl bg-slate-100" />
        <div className="h-11 rounded-xl bg-slate-100" />
        <div className="h-11 rounded-xl bg-slate-100 sm:col-span-2" />
      </div>
      <div className="mt-8 h-10 w-36 rounded-xl bg-slate-100" />
    </div>
  )
}

function SettingsPage() {
  const activeRole = getActiveRole()
  const baselineRef = useRef(defaultSettings)

  const [settings, setSettings] = useState(defaultSettings)
  const [activeSection, setActiveSection] = useState('profile')
  const [mobileOpen, setMobileOpen] = useState(defaultMobileOpen)
  const [sessions, setSessions] = useState(initialSessions)
  const [previewState, setPreviewState] = useState('default')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [banner, setBanner] = useState(null)
  const [lastSaveScope, setLastSaveScope] = useState('all')
  const [forceErrorNextSave, setForceErrorNextSave] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadInitialSettings = async () => {
      try {
        const settingsResponse = await apiRequest(`/settings?role=${activeRole}`)
        const sessionsResponse = await apiRequest(`/settings/sessions?role=${activeRole}`)

        if (cancelled) {
          return
        }

        const hydrated = {
          ...defaultSettings,
          ...settingsResponse.settings,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }

        setSettings(hydrated)
        baselineRef.current = hydrated
        setSessions(sessionsResponse.sessions || [])
      } catch (requestError) {
        if (!cancelled) {
          setBanner({
            type: 'error',
            message: requestError.message || 'Unable to load settings from backend.',
          })
        }
      }
    }

    loadInitialSettings()

    return () => {
      cancelled = true
    }
  }, [activeRole])

  const updateSetting = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(baselineRef.current),
    [settings],
  )

  const passwordRules = useMemo(
    () => ({
      minLength: settings.newPassword.length >= 12,
      uppercase: /[A-Z]/.test(settings.newPassword),
      lowercase: /[a-z]/.test(settings.newPassword),
      number: /\d/.test(settings.newPassword),
      special: /[^A-Za-z0-9]/.test(settings.newPassword),
    }),
    [settings.newPassword],
  )

  const passwordMismatch =
    settings.confirmPassword.length > 0 &&
    settings.confirmPassword !== settings.newPassword

  const passwordReady = Object.values(passwordRules).every(Boolean)

  const validateSave = (scope) => {
    if (scope === 'profile' || scope === 'all') {
      if (!settings.fullName.trim() || !settings.displayName.trim()) {
        return {
          ok: false,
          message: 'Please complete your full name and display name before saving.',
        }
      }
    }

    if (scope === 'security' || scope === 'all') {
      const touchingPassword =
        settings.currentPassword || settings.newPassword || settings.confirmPassword

      if (touchingPassword) {
        if (!settings.currentPassword.trim()) {
          return {
            ok: false,
            message: 'Current password is required to update security credentials.',
          }
        }

        if (!passwordReady || passwordMismatch) {
          return {
            ok: false,
            message:
              'Please satisfy all password requirements and ensure confirmation matches.',
          }
        }
      }
    }

    if (scope === 'notifications' || scope === 'all') {
      if (settings.quietStart === settings.quietEnd) {
        return {
          ok: false,
          message: 'Quiet hours start and end cannot be identical.',
        }
      }
    }

    return { ok: true, message: '' }
  }

  const discardChanges = () => {
    setSettings({ ...baselineRef.current })
    setBanner(null)
    setSaveStatus('idle')
  }

  const triggerSave = async (scope = 'all') => {
    setLastSaveScope(scope)
    const validation = validateSave(scope)

    if (!validation.ok) {
      setBanner({ type: 'error', message: validation.message })
      setSaveStatus('error')
      return
    }

    setSaveStatus('loading')
    setBanner(null)

    try {
      if (forceErrorNextSave) {
        setForceErrorNextSave(false)
        throw new Error('Sync failed due to a temporary network issue. Please retry.')
      }

      const payload = {
        ...settings,
      }

      const response = await apiRequest(`/settings?role=${activeRole}`, {
        method: 'PATCH',
        body: {
          role: activeRole,
          settings: payload,
        },
      })

      const normalized = {
        ...defaultSettings,
        ...response.settings,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }

      baselineRef.current = normalized
      setSettings(normalized)

      const sessionsResponse = await apiRequest(`/settings/sessions?role=${activeRole}`)
      setSessions(sessionsResponse.sessions || [])

      setSaveStatus('success')
      setBanner({
        type: 'success',
        message: 'Settings updated successfully. Your preferences are synchronized.',
      })
    } catch (requestError) {
      setSaveStatus('error')
      setBanner({
        type: 'error',
        message: requestError.message || 'Sync failed due to a temporary network issue. Please retry.',
      })
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
      setBanner({
        type: 'error',
        message: requestError.message || 'Unable to revoke session.',
      })
    }
  }

  const signOutOtherSessions = async () => {
    try {
      const response = await apiRequest('/settings/sessions/signout-others', {
        method: 'POST',
        body: { role: activeRole },
      })

      setSessions(response.sessions || [])
      setBanner({
        type: 'success',
        message: 'All other sessions have been signed out.',
      })
    } catch (requestError) {
      setSaveStatus('error')
      setBanner({
        type: 'error',
        message: requestError.message || 'Unable to sign out other sessions.',
      })
    }
  }

  const toggleMobileSection = (sectionId) => {
    setMobileOpen((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }))
  }

  const renderProfileSection = () => {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionIntro
          title="Profile Details"
          body="Manage your public identity and contact information."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Full Name
            </label>
            <input
              type="text"
              value={settings.fullName}
              onChange={(event) => updateSetting('fullName', event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Display Name
            </label>
            <input
              type="text"
              value={settings.displayName}
              onChange={(event) => updateSetting('displayName', event.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Email Address (Read-only)
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm italic text-slate-500">
              {settings.email}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(event) => updateSetting('phone', event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Department or Startup
            </label>
            <input
              type="text"
              value={settings.organization}
              onChange={(event) => updateSetting('organization', event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={() => triggerSave('profile')}
            disabled={saveStatus === 'loading'}
            className="lp-focus inline-flex items-center gap-2 rounded-xl bg-lp-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-lp-navy shadow-lg shadow-lp-gold/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveStatus === 'loading' ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>
    )
  }

  const renderSecuritySection = () => {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionIntro
          title="Password and Security"
          body="Protect your account with robust credentials and multi-factor authentication."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Current Password
            </label>
            <input
              type="password"
              value={settings.currentPassword}
              onChange={(event) => updateSetting('currentPassword', event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              New Password
            </label>
            <input
              type="password"
              value={settings.newPassword}
              onChange={(event) => updateSetting('newPassword', event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Confirm Password
            </label>
            <input
              type="password"
              value={settings.confirmPassword}
              onChange={(event) => updateSetting('confirmPassword', event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Password Rules
          </p>
          <ul className="space-y-1.5">
            <PasswordRule passed={passwordRules.minLength} text="Minimum 12 characters" />
            <PasswordRule passed={passwordRules.uppercase} text="At least one uppercase letter" />
            <PasswordRule passed={passwordRules.lowercase} text="At least one lowercase letter" />
            <PasswordRule passed={passwordRules.number} text="At least one numeric digit" />
            <PasswordRule passed={passwordRules.special} text="At least one special character" />
          </ul>
          {passwordMismatch ? (
            <p className="mt-3 text-xs font-medium text-rose-600">
              Password confirmation does not match.
            </p>
          ) : null}
        </div>

        <div className="mt-5">
          <ToggleSwitch
            id="toggle-2fa"
            checked={settings.twoFactor}
            onChange={(value) => updateSetting('twoFactor', value)}
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account."
          />
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={() => triggerSave('security')}
            disabled={saveStatus === 'loading'}
            className="lp-focus inline-flex items-center gap-2 rounded-xl bg-lp-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-lp-navy shadow-lg shadow-lp-gold/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveStatus === 'loading' ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </section>
    )
  }

  const renderNotificationsSection = () => {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionIntro
          title="Notification Preferences"
          body="Control your email update cadence and quiet-hour window. Notification delivery is currently email-only via Resend."
        />

        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Delivery channel is email only through Resend for this release.
        </div>

        <div className="space-y-3">
          <ToggleSwitch
            id="toggle-email"
            checked={settings.notifyEmail}
            onChange={(value) => updateSetting('notifyEmail', value)}
            label="Email Notifications"
            description="Receive summary updates via your primary email inbox."
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
            <p className="text-sm font-semibold text-lp-navy">In-App Notifications</p>
            <p className="mt-1 text-xs text-slate-500">
              Disabled for now. Email via Resend is the only active notification channel.
            </p>
          </div>
          <ToggleSwitch
            id="toggle-deadline"
            checked={settings.notifyDeadline}
            onChange={(value) => updateSetting('notifyDeadline', value)}
            label="Deadline Reminders"
            description="Notify 24 hours before assigned presentation and review deadlines."
          />
          <ToggleSwitch
            id="toggle-weekly"
            checked={settings.notifyWeekly}
            onChange={(value) => updateSetting('notifyWeekly', value)}
            label="Weekly Summary"
            description="Send a weekly digest of incubatee and review activity."
          />
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-lp-navy">Quiet Hours</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Start Time
              </label>
              <select
                value={settings.quietStart}
                onChange={(event) => updateSetting('quietStart', event.target.value)}
                className={inputClassName}
              >
                <option value="20:00">20:00</option>
                <option value="21:00">21:00</option>
                <option value="22:00">22:00</option>
                <option value="23:00">23:00</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                End Time
              </label>
              <select
                value={settings.quietEnd}
                onChange={(event) => updateSetting('quietEnd', event.target.value)}
                className={inputClassName}
              >
                <option value="06:00">06:00</option>
                <option value="07:00">07:00</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={() => triggerSave('notifications')}
            disabled={saveStatus === 'loading'}
            className="lp-focus inline-flex items-center gap-2 rounded-xl bg-lp-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-lp-navy shadow-lg shadow-lp-gold/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveStatus === 'loading' ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </section>
    )
  }

  const renderAppearanceSection = () => {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionIntro
          title="Appearance and Accessibility"
          body="Adjust visual settings to match your preferred working environment."
        />

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => updateSetting('theme', item.value)}
                className={`lp-focus rounded-lg py-2.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                  settings.theme === item.value
                    ? 'bg-white text-lp-navy shadow-sm'
                    : 'text-slate-500 hover:text-lp-navy'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Font Size
          </label>
          <select
            value={settings.fontSize}
            onChange={(event) => updateSetting('fontSize', event.target.value)}
            className={inputClassName}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          <ToggleSwitch
            id="toggle-motion"
            checked={settings.reducedMotion}
            onChange={(value) => updateSetting('reducedMotion', value)}
            label="Reduced Motion"
            description="Minimize animations and transition effects in the interface."
          />
          <ToggleSwitch
            id="toggle-contrast"
            checked={settings.highContrast}
            onChange={(value) => updateSetting('highContrast', value)}
            label="High Contrast"
            description="Increase contrast for improved readability and focus."
          />
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={() => triggerSave('appearance')}
            disabled={saveStatus === 'loading'}
            className="lp-focus inline-flex items-center gap-2 rounded-xl bg-lp-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-lp-navy shadow-lg shadow-lp-gold/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveStatus === 'loading' ? 'Saving...' : 'Save Appearance'}
          </button>
        </div>
      </section>
    )
  }

  const renderSessionsSection = () => {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionIntro
            title="Sessions and Account"
            body="Monitor your active sessions and control account access."
          />

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-lp-navy">Active Sessions</p>
              <button
                type="button"
                onClick={signOutOtherSessions}
                className="lp-focus text-xs font-semibold uppercase tracking-[0.1em] text-lp-navy underline decoration-lp-gold/70 underline-offset-4"
              >
                Sign Out Other Sessions
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Device</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-4 py-3 font-medium text-lp-navy">{session.device}</td>
                      <td className="px-4 py-3 text-slate-600">{session.location}</td>
                      <td className="px-4 py-3 text-slate-600">{session.lastActive}</td>
                      <td className="px-4 py-3">
                        {session.current ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                            Current
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => revokeSession(session.id)}
                            className="lp-focus text-xs font-semibold uppercase tracking-[0.1em] text-rose-600 underline decoration-rose-300 underline-offset-4"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm sm:p-8">
          <h3 className="font-display text-xl font-bold text-rose-700">Danger Zone</h3>
          <p className="mt-2 text-sm leading-6 text-rose-700/80">
            Deactivating your account will disable all access to startup records and portal data.
          </p>
          <button
            type="button"
            className="lp-focus mt-5 rounded-xl border border-rose-300 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-rose-700 hover:bg-rose-100"
          >
            Deactivate Account
          </button>
        </div>
      </section>
    )
  }

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'profile':
        return renderProfileSection()
      case 'security':
        return renderSecuritySection()
      case 'notifications':
        return renderNotificationsSection()
      case 'appearance':
        return renderAppearanceSection()
      case 'sessions':
        return renderSessionsSection()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-lp-navy">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <BrandLogo compact />
          <div className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
            <Link to="/notifications" className="lp-focus rounded-md px-2 py-1 hover:text-lp-navy">
              Notifications
            </Link>
            <Link to="/login" className="lp-focus rounded-md px-2 py-1 hover:text-lp-navy">
              Sign In
            </Link>
          </div>
          <button
            type="button"
            className="lp-focus rounded-lg bg-lp-navy px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white md:hidden"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        {banner ? (
          <section
            className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
              banner.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium">{banner.message}</p>
            {banner.type === 'error' ? (
              <button
                type="button"
                onClick={() => triggerSave(lastSaveScope)}
                className="lp-focus rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Retry
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="lp-focus rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em]"
              >
                Dismiss
              </button>
            )}
          </section>
        ) : null}

        <header className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-lp-navy sm:text-4xl">
              Account Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Configure profile, security, notifications, and accessibility preferences for your LaunchPad workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Preview
            </span>
            {['default', 'loading'].map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setPreviewState(state)}
                className={`lp-focus rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                  previewState === state
                    ? 'bg-lp-navy text-white'
                    : 'bg-white text-slate-600'
                }`}
              >
                {state}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setForceErrorNextSave((current) => !current)}
              className={`lp-focus rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                forceErrorNextSave
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-slate-600'
              }`}
            >
              {forceErrorNextSave ? 'Error Armed' : 'Simulate Error'}
            </button>
          </div>
        </header>

        {previewState === 'loading' ? (
          <section className="space-y-4">
            <SkeletonPanel />
            <SkeletonPanel />
            <SkeletonPanel />
          </section>
        ) : (
          <>
            <section className="space-y-4 md:hidden">
              {sectionMeta.map((section) => (
                <article key={section.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleMobileSection(section.id)}
                    className="lp-focus flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-lp-navy">{section.label}</span>
                      <span className="block text-xs text-slate-500">{section.subtitle}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {mobileOpen[section.id] ? 'Hide' : 'Show'}
                    </span>
                  </button>
                  {mobileOpen[section.id] ? (
                    <div className="border-t border-slate-200 p-4">{renderSection(section.id)}</div>
                  ) : null}
                </article>
              ))}
            </section>

            <section className="hidden gap-8 md:grid md:grid-cols-[240px,1fr]">
              <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                {sectionMeta.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`lp-focus mb-1 w-full rounded-xl px-3 py-3 text-left transition last:mb-0 ${
                      activeSection === section.id
                        ? 'bg-lp-navy text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-lp-navy'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{section.label}</span>
                    <span
                      className={`mt-1 block text-xs ${
                        activeSection === section.id ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {section.subtitle}
                    </span>
                  </button>
                ))}
              </aside>

              <div>{renderSection(activeSection)}</div>
            </section>
          </>
        )}
      </main>

      {hasUnsavedChanges ? (
        <div className="fixed bottom-20 left-1/2 z-40 flex w-[min(92%,720px)] -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-lp-navy">You have unsaved changes</p>
            <p className="text-xs text-slate-500">Save or discard edits before leaving this page.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={discardChanges}
              className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => triggerSave('all')}
              disabled={saveStatus === 'loading'}
              className="lp-focus rounded-lg bg-lp-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-lp-navy disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveStatus === 'loading' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-white/10 bg-lp-navy/95 backdrop-blur md:hidden">
        {['Home', 'Projects', 'Settings', 'Account'].map((item) => (
          <button
            key={item}
            type="button"
            className={`lp-focus rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
              item === 'Settings' ? 'text-lp-gold' : 'text-slate-300'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default SettingsPage