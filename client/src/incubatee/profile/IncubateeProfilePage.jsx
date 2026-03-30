import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'

const initialProfile = {
  startupName: 'AlphaStream AI',
  tagline: 'Democratizing data intelligence for modern logistics.',
  sector: 'Artificial Intelligence',
  cicfId: 'LP-2024-LLG',
  website: 'https://alphastream.ai',
  linkedIn: 'https://www.linkedin.com/company/alphastream-ai',
  founderName: 'Marcus Sterling',
  founderRole: 'CEO and Chief Architect',
  founderEmail: 'm.sterling@alphastream.ai',
  founderPhone: '+91 98765 12345',
  alternateContact: 'Sarah Lohan | +91 90123 45678',
  problemStatement:
    'Legacy logistics chains lose efficiency due to fragmented systems and delayed visibility.',
  solutionSummary:
    'AlphaStream AI provides predictive orchestration that identifies bottlenecks before disruptions occur.',
  targetMarket:
    'Mid-to-large logistics and supply chain operators across India, SEA, and MENA.',
  arrTarget: '$2.4M',
  pilotClients: '12',
  joinedDate: '2024-04-12',
  mentor: 'Dr. Elena Ross',
  lastReviewDate: '2026-03-12',
  nextMilestoneDate: '2026-04-20',
  progressPercent: 75,
}

const initialTeam = [
  {
    id: 'tm-1',
    name: 'Sarah Lohan',
    role: 'Head of Data',
    email: 'sarah@alphastream.ai',
  },
  {
    id: 'tm-2',
    name: 'James Kaan',
    role: 'Lead Engineer',
    email: 'james@alphastream.ai',
  },
  {
    id: 'tm-3',
    name: 'Priya Venkatesh',
    role: 'Product Manager',
    email: 'priya@alphastream.ai',
  },
]

const initialDocuments = [
  {
    id: 'doc-1',
    name: 'Certificate of Incorporation',
    meta: 'PDF • 2.4 MB',
    status: 'Uploaded',
  },
  {
    id: 'doc-2',
    name: 'Series A Pitch Deck',
    meta: 'PDF • 18.1 MB',
    status: 'Uploaded',
  },
  {
    id: 'doc-3',
    name: 'CICF Compliance NDA',
    meta: 'Awaiting signature',
    status: 'Pending',
  },
  {
    id: 'doc-4',
    name: 'Tax Registration',
    meta: 'Expired 12 days ago',
    status: 'Expired',
  },
]

const previewModes = ['default', 'loading', 'empty-team']

const inputClassName =
  'lp-focus w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400'

const navItems = [
  'Startup Identity',
  'Founder Details',
  'Team Management',
  'Incubation Metadata',
  'Documents',
]

function statusClass(status) {
  if (status === 'Uploaded') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Pending') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-rose-50 text-rose-700'
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-2xl bg-slate-200/70 p-8">
        <div className="h-4 w-40 rounded bg-slate-300" />
        <div className="mt-4 h-10 w-72 rounded bg-slate-300" />
        <div className="mt-4 h-4 w-full max-w-xl rounded bg-slate-300" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-5">
          <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-10 rounded bg-slate-200" />
            <div className="mt-3 h-10 rounded bg-slate-200" />
            <div className="mt-3 h-10 rounded bg-slate-200" />
          </div>
          <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm">
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="mt-4 h-10 rounded bg-slate-200" />
            <div className="mt-3 h-10 rounded bg-slate-200" />
          </div>
        </div>

        <div className="space-y-6 xl:col-span-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm">
              <div className="h-6 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-20 rounded bg-slate-200" />
            </div>
            <div className="animate-pulse rounded-2xl bg-slate-300 p-8">
              <div className="h-6 w-32 rounded bg-slate-200" />
              <div className="mt-4 h-20 rounded bg-slate-200" />
            </div>
          </div>

          <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-24 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

function IncubateeProfilePage() {
  const baselineRef = useRef({
    profile: initialProfile,
    team: initialTeam,
  })

  const [profile, setProfile] = useState(initialProfile)
  const [teamMembers, setTeamMembers] = useState(initialTeam)
  const [previewMode, setPreviewMode] = useState('default')
  const [saveState, setSaveState] = useState('idle')
  const [banner, setBanner] = useState(null)
  const [forceErrorNextSave, setForceErrorNextSave] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' })

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const workingTeam = previewMode === 'empty-team' ? [] : teamMembers

  const currentSnapshot = useMemo(
    () => ({ profile, team: teamMembers }),
    [profile, teamMembers],
  )

  const hasUnsavedChanges =
    JSON.stringify(currentSnapshot) !== JSON.stringify(baselineRef.current)

  const saveChanges = () => {
    if (!profile.startupName.trim() || !profile.founderName.trim()) {
      setBanner({
        type: 'error',
        message: 'Startup name and founder name are required before saving.',
      })
      setSaveState('error')
      return
    }

    setSaveState('loading')
    setBanner(null)

    setTimeout(() => {
      if (forceErrorNextSave) {
        setSaveState('error')
        setBanner({
          type: 'error',
          message: 'Unable to sync profile right now. Please retry.',
        })
        setForceErrorNextSave(false)
        return
      }

      baselineRef.current = {
        profile,
        team: teamMembers,
      }

      setSaveState('success')
      setBanner({
        type: 'success',
        message: 'Profile updated successfully. All changes are synced.',
      })
    }, 900)
  }

  const discardChanges = () => {
    setProfile({ ...baselineRef.current.profile })
    setTeamMembers([...baselineRef.current.team])
    setBanner(null)
    setSaveState('idle')
    setShowAddMember(false)
    setEditingMemberId(null)
    setNewMember({ name: '', role: '', email: '' })
  }

  const addMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim() || !newMember.email.trim()) {
      setBanner({
        type: 'error',
        message: 'Please complete all fields before adding a team member.',
      })
      return
    }

    const nextMember = {
      id: `tm-${Date.now()}`,
      name: newMember.name.trim(),
      role: newMember.role.trim(),
      email: newMember.email.trim(),
    }

    setTeamMembers((current) => [...current, nextMember])
    setNewMember({ name: '', role: '', email: '' })
    setShowAddMember(false)
  }

  const removeMember = (id) => {
    setTeamMembers((current) => current.filter((member) => member.id !== id))
  }

  const saveMemberEdits = (memberId, field, value) => {
    setTeamMembers((current) =>
      current.map((member) =>
        member.id === memberId ? { ...member, [field]: value } : member,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-lp-navy">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:h-20 sm:px-8">
          <div className="flex items-center gap-4">
            <BrandLogo compact />
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="hidden items-center gap-3 sm:flex">
              <span className="rounded-lg bg-lp-navy p-2 text-white">
                <img src="/logo.svg" alt="Startup logo" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold leading-tight text-lp-navy">
                  {profile.startupName}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-lp-gold">
                  Status: Growth
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/incubatee/dashboard"
              className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 hover:text-lp-navy"
            >
              Dashboard
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

      <div className="mx-auto flex max-w-[1920px]">
        <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-slate-50 pt-24 md:block">
          <div className="px-8 pb-8">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Batch 2024
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Series A • {profile.cicfId}
              </p>
            </div>
          </div>

          <nav className="space-y-1 px-6 text-sm font-medium">
            {navItems.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`w-full rounded-lg px-4 py-3 text-left transition ${
                  index === 0
                    ? 'border-r-2 border-lp-gold bg-slate-200 text-lp-navy'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-lp-navy'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 pb-28 pt-6 md:ml-72 md:px-8 md:pb-10 md:pt-10">
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
                  onClick={saveChanges}
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

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-lp-gold">
                CICF Certified Incubatee
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-lp-navy sm:text-5xl">
                Incubatee Profile
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Manage your startup identity, team members, and compliance profile for the current incubation track.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
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
          </div>

          {previewMode === 'loading' ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
              <div className="space-y-8 xl:col-span-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-bold text-lp-navy">Startup Identity</h2>
                    <span className="rounded-full bg-lp-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#755b00]">
                      Growth
                    </span>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Startup Name
                      </label>
                      <input
                        type="text"
                        value={profile.startupName}
                        onChange={(event) => updateProfile('startupName', event.target.value)}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={profile.tagline}
                        onChange={(event) => updateProfile('tagline', event.target.value)}
                        className={inputClassName}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Sector
                        </label>
                        <select
                          value={profile.sector}
                          onChange={(event) => updateProfile('sector', event.target.value)}
                          className={inputClassName}
                        >
                          <option value="Artificial Intelligence">Artificial Intelligence</option>
                          <option value="Logistics">Logistics</option>
                          <option value="Deep Tech">Deep Tech</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          CICF ID
                        </label>
                        <input
                          type="text"
                          value={profile.cicfId}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs font-mono text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(event) => updateProfile('website', event.target.value)}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={profile.linkedIn}
                        onChange={(event) => updateProfile('linkedIn', event.target.value)}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="mb-6 font-display text-xl font-bold text-lp-navy">
                    Founder and Primary Contact
                  </h2>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile.founderName}
                          onChange={(event) => updateProfile('founderName', event.target.value)}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Role and Title
                        </label>
                        <input
                          type="text"
                          value={profile.founderRole}
                          onChange={(event) => updateProfile('founderRole', event.target.value)}
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.founderEmail}
                        onChange={(event) => updateProfile('founderEmail', event.target.value)}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.founderPhone}
                        onChange={(event) => updateProfile('founderPhone', event.target.value)}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Alternate Contact
                      </label>
                      <input
                        type="text"
                        value={profile.alternateContact}
                        onChange={(event) => updateProfile('alternateContact', event.target.value)}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-8 xl:col-span-7">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h2 className="font-display text-xl font-bold text-lp-navy">Team Members</h2>
                      <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
                        {workingTeam.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddMember((current) => !current)}
                      className="lp-focus mb-4 rounded-lg border border-lp-gold/30 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-lp-navy"
                    >
                      {showAddMember ? 'Close Add Form' : 'Add Member'}
                    </button>

                    {showAddMember ? (
                      <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <input
                          type="text"
                          placeholder="Member name"
                          value={newMember.name}
                          onChange={(event) =>
                            setNewMember((current) => ({ ...current, name: event.target.value }))
                          }
                          className={inputClassName}
                        />
                        <input
                          type="text"
                          placeholder="Role"
                          value={newMember.role}
                          onChange={(event) =>
                            setNewMember((current) => ({ ...current, role: event.target.value }))
                          }
                          className={inputClassName}
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newMember.email}
                          onChange={(event) =>
                            setNewMember((current) => ({ ...current, email: event.target.value }))
                          }
                          className={inputClassName}
                        />

                        <button
                          type="button"
                          onClick={addMember}
                          className="lp-focus w-full rounded-lg bg-lp-navy px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
                        >
                          Add To Team
                        </button>
                      </div>
                    ) : null}

                    {workingTeam.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                        <p className="text-sm font-semibold text-lp-navy">No team members yet</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Add your core team to complete your incubatee profile.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {workingTeam.map((member) => {
                          const initials = member.name
                            .split(' ')
                            .map((segment) => segment[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()

                          const isEditing = editingMemberId === member.id

                          return (
                            <article
                              key={member.id}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-lp-navy">{member.name}</p>
                                    <p className="text-[11px] text-slate-500">{member.role}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingMemberId((current) =>
                                        current === member.id ? null : member.id,
                                      )
                                    }
                                    className="lp-focus rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600"
                                  >
                                    {isEditing ? 'Done' : 'Edit'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeMember(member.id)}
                                    className="lp-focus rounded-lg border border-rose-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-rose-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>

                              {isEditing ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={member.name}
                                    onChange={(event) =>
                                      saveMemberEdits(member.id, 'name', event.target.value)
                                    }
                                    className={inputClassName}
                                  />
                                  <input
                                    type="text"
                                    value={member.role}
                                    onChange={(event) =>
                                      saveMemberEdits(member.id, 'role', event.target.value)
                                    }
                                    className={inputClassName}
                                  />
                                  <input
                                    type="email"
                                    value={member.email}
                                    onChange={(event) =>
                                      saveMemberEdits(member.id, 'email', event.target.value)
                                    }
                                    className={inputClassName}
                                  />
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-500">{member.email}</p>
                              )}
                            </article>
                          )
                        })}
                      </div>
                    )}
                  </section>

                  <section className="relative overflow-hidden rounded-2xl bg-lp-navy p-6 text-white shadow-xl sm:p-8">
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-lp-gold/20 blur-2xl" />
                    <h2 className="mb-5 font-display text-xl font-bold">Incubation Metadata</h2>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                        Progress Completion
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                          <div
                            className="h-full rounded-full bg-lp-gold"
                            style={{ width: `${profile.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{profile.progressPercent}%</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-xs">
                      <div>
                        <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">
                          Joined CICF
                        </p>
                        <p className="mt-1 font-medium">{profile.joinedDate}</p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">
                          Assigned Mentor
                        </p>
                        <p className="mt-1 font-medium">{profile.mentor}</p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">
                          Last Review
                        </p>
                        <p className="mt-1 font-medium">{profile.lastReviewDate}</p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">
                          Next Milestone
                        </p>
                        <p className="mt-1 font-medium">{profile.nextMilestoneDate}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-slate-100 p-6 sm:p-8">
                  <h2 className="mb-6 font-display text-xl font-bold text-lp-navy">Startup Overview</h2>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Problem Statement
                        </label>
                        <textarea
                          rows={4}
                          value={profile.problemStatement}
                          onChange={(event) => updateProfile('problemStatement', event.target.value)}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Solution Summary
                        </label>
                        <textarea
                          rows={4}
                          value={profile.solutionSummary}
                          onChange={(event) => updateProfile('solutionSummary', event.target.value)}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Target Market
                        </label>
                        <textarea
                          rows={4}
                          value={profile.targetMarket}
                          onChange={(event) => updateProfile('targetMarket', event.target.value)}
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Current Traction Metrics
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-slate-100 p-4 text-center">
                            <p className="font-display text-2xl font-extrabold text-lp-navy">
                              {profile.arrTarget}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                              ARR Target
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-100 p-4 text-center">
                            <p className="font-display text-2xl font-extrabold text-lp-navy">
                              {profile.pilotClients}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                              Pilot Clients
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-bold text-lp-navy">
                      Linked Documents Snapshot
                    </h2>
                    <button
                      type="button"
                      className="lp-focus rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600"
                    >
                      Bulk Download
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {initialDocuments.map((document) => (
                      <article
                        key={document.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-lp-navy">{document.name}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{document.meta}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${statusClass(
                            document.status,
                          )}`}
                        >
                          {document.status}
                        </span>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>

      {hasUnsavedChanges ? (
        <div className="fixed bottom-20 left-1/2 z-50 w-[min(94%,760px)] -translate-x-1/2 rounded-2xl border border-slate-300 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:bottom-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-lp-gold/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#755b00]">
                Unsaved Changes
              </span>
              <p className="text-sm font-medium text-lp-navy">You have pending profile edits</p>
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
                onClick={saveChanges}
                disabled={saveState === 'loading'}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saveState === 'loading' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-white/10 bg-lp-navy/95 backdrop-blur md:hidden">
        {['Home', 'Profile', 'Team', 'Docs'].map((item) => (
          <button
            key={item}
            type="button"
            className={`lp-focus rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
              item === 'Profile' ? 'text-lp-gold' : 'text-slate-300'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default IncubateeProfilePage