import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

const emptyProfile = {
  startupName: '',
  cicfId: '',
  founderName: '',
  founderEmail: '',
  phone: '',
  domain: '',
  headquarters: '',
  overview: '',
  teamMembers: [],
}

function IncubateeProfilePage() {
  const [profile, setProfile] = useState(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' })

  const loadProfile = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/profile')
      setProfile({ ...emptyProfile, ...(response.data || {}) })
    } catch (requestError) {
      setError(requestError.message || 'Unable to load incubatee profile.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const completeness = useMemo(() => {
    const fields = [
      profile.startupName,
      profile.founderName,
      profile.founderEmail,
      profile.phone,
      profile.domain,
      profile.headquarters,
      profile.overview,
    ]

    const completed = fields.filter((value) => String(value || '').trim()).length
    return Math.round((completed / fields.length) * 100)
  }, [profile])

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const addMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim() || !newMember.email.trim()) {
      setToast('Member name, role, and email are required.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    setProfile((current) => ({
      ...current,
      teamMembers: [
        ...(current.teamMembers || []),
        {
          id: `tm-${Date.now()}`,
          name: newMember.name.trim(),
          role: newMember.role.trim(),
          email: newMember.email.trim(),
        },
      ],
    }))

    setNewMember({ name: '', role: '', email: '' })
  }

  const removeMember = (memberId) => {
    setProfile((current) => ({
      ...current,
      teamMembers: (current.teamMembers || []).filter((member) => member.id !== memberId),
    }))
  }

  const saveProfile = async () => {
    if (!profile.startupName.trim() || !profile.founderName.trim()) {
      setToast('Startup name and founder name are required.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    setIsSaving(true)

    try {
      const response = await apiRequest('/incubatee/profile', {
        method: 'PATCH',
        body: profile,
      })

      setProfile({ ...emptyProfile, ...(response.data || {}) })
      setToast('Profile saved successfully.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to save profile.')
      setTimeout(() => setToast(''), 1800)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <IncubateeShell
      activeKey=""
      title="Incubatee Profile"
      subtitle="Maintain startup identity and team records from backend data"
      badge={`${completeness}% complete`}
      headerAction={
        <button
          type="button"
          onClick={loadProfile}
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
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Startup Details</h2>
            {isLoading ? (
              <div className="mt-4 h-20 animate-pulse rounded bg-slate-100" />
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <input
                  value={profile.startupName}
                  onChange={(event) => updateField('startupName', event.target.value)}
                  placeholder="Startup name"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  CICF ID: {profile.cicfId || 'Not assigned'}
                </div>
                <input
                  value={profile.domain}
                  onChange={(event) => updateField('domain', event.target.value)}
                  placeholder="Domain"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <input
                  value={profile.headquarters}
                  onChange={(event) => updateField('headquarters', event.target.value)}
                  placeholder="Headquarters"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <textarea
                  value={profile.overview}
                  onChange={(event) => updateField('overview', event.target.value)}
                  placeholder="Startup overview"
                  rows={4}
                  className="lp-focus rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Founder Contact</h2>
            {isLoading ? (
              <div className="mt-4 h-20 animate-pulse rounded bg-slate-100" />
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <input
                  value={profile.founderName}
                  onChange={(event) => updateField('founderName', event.target.value)}
                  placeholder="Founder name"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <input
                  value={profile.founderEmail}
                  onChange={(event) => updateField('founderEmail', event.target.value)}
                  placeholder="Founder email"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <input
                  value={profile.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="Contact number"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
              </div>
            )}
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Team Members</h2>

          {isLoading ? (
            <div className="mt-4 h-16 animate-pulse rounded bg-slate-100" />
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={newMember.name}
                  onChange={(event) =>
                    setNewMember((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Name"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <input
                  value={newMember.role}
                  onChange={(event) =>
                    setNewMember((current) => ({ ...current, role: event.target.value }))
                  }
                  placeholder="Role"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
                <input
                  value={newMember.email}
                  onChange={(event) =>
                    setNewMember((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Email"
                  className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={addMember}
                className="lp-focus mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700"
              >
                Add Team Member
              </button>

              <div className="mt-4 space-y-2">
                {(profile.teamMembers || []).length ? (
                  (profile.teamMembers || []).map((member) => (
                    <article key={member.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-lp-navy">{member.name}</p>
                          <p className="text-xs text-slate-500">
                            {member.role} | {member.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          className="lp-focus rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No team members added.
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveProfile}
            disabled={isSaving || isLoading}
            className="lp-focus rounded-lg bg-lp-navy px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </IncubateeShell>
  )
}

export default IncubateeProfilePage