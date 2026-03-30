import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'
import { apiRequest } from '../../lib/api'

function resultTone(result) {
  if (result === 'Delivered') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (result === 'Queued') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-rose-50 text-rose-700'
}

function AdminSystemPage() {
  const [templates, setTemplates] = useState([])
  const [deliveryLog, setDeliveryLog] = useState([])
  const [provider, setProvider] = useState('resend')
  const [campaign, setCampaign] = useState({ template: '', audience: '', subject: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const loadSystem = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/admin/system')
      setProvider(response.provider || 'resend')
      setTemplates(response.templates || [])
      setDeliveryLog(response.deliveryLog || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load system controls.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSystem()
  }, [])

  const deliveryRate = useMemo(() => {
    if (!deliveryLog.length) {
      return 0
    }

    const deliveredCount = deliveryLog.filter((item) => item.result === 'Delivered').length
    return Math.round((deliveredCount / deliveryLog.length) * 100)
  }, [deliveryLog])

  const toggleTemplate = async (id) => {
    try {
      const response = await apiRequest(`/admin/system/templates/${id}/toggle`, {
        method: 'POST',
      })

      const updated = response.item
      setTemplates((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setToast(`Template state changed to ${updated.status}.`)
      setTimeout(() => setToast(''), 2000)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to update template state.')
      setTimeout(() => setToast(''), 2000)
    }
  }

  const queueCampaign = async () => {
    if (!campaign.template || !campaign.audience || !campaign.subject) {
      setToast('Complete template, audience, and subject.')
      setTimeout(() => setToast(''), 2000)
      return
    }

    try {
      await apiRequest('/admin/system/campaign', {
        method: 'POST',
        body: campaign,
      })

      setCampaign({ template: '', audience: '', subject: '' })
      setToast('Email campaign queued via Resend.')
      setTimeout(() => setToast(''), 2000)
      loadSystem()
    } catch (requestError) {
      setToast(requestError.message || 'Unable to queue campaign.')
      setTimeout(() => setToast(''), 2000)
    }
  }

  return (
    <AdminShell
      activeKey="system"
      title="Admin System"
      subtitle="Email operations, template control, and delivery observability"
      badge="Resend Email Channel"
      headerAction={
        <button
          type="button"
          onClick={loadSystem}
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Refresh
        </button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Notifications are email only, powered by {provider}. SMS and push channels remain disabled.
        </section>

        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Active Templates</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">
              {templates.filter((item) => item.status === 'Active').length}
            </p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Delivery Rate</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{deliveryRate}%</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Provider</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{provider}</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Email Templates</h2>
            {isLoading ? (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-14 rounded bg-slate-100" />
                <div className="h-14 rounded bg-slate-100" />
              </div>
            ) : templates.length ? (
              <div className="mt-4 space-y-3">
                {templates.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-lp-navy">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">Audience: {item.audience}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTemplate(item.id)}
                      className="lp-focus mt-3 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Toggle State
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No templates found.
              </div>
            )}
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Broadcast Composer</h2>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <select
                value={campaign.template}
                onChange={(event) =>
                  setCampaign((current) => ({ ...current, template: event.target.value }))
                }
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="">Select template</option>
                {templates.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                value={campaign.audience}
                onChange={(event) =>
                  setCampaign((current) => ({ ...current, audience: event.target.value }))
                }
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="">Select audience</option>
                <option value="Faculty">Faculty</option>
                <option value="Incubatees">Incubatees</option>
                <option value="Admin">Admin</option>
                <option value="All">All</option>
              </select>
              <input
                value={campaign.subject}
                onChange={(event) =>
                  setCampaign((current) => ({ ...current, subject: event.target.value }))
                }
                placeholder="Email subject"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={queueCampaign}
              className="lp-focus mt-4 rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
            >
              Queue Campaign
            </button>
          </article>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Delivery Log ({provider})</h2>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : deliveryLog.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                    <th className="pb-3 pr-3">Email Type</th>
                    <th className="pb-3 pr-3">Audience</th>
                    <th className="pb-3 pr-3">Recipients</th>
                    <th className="pb-3 pr-3">Result</th>
                    <th className="pb-3">Sent At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveryLog.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-3 font-semibold text-lp-navy">{item.emailType}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.audienceRole}</td>
                      <td className="py-4 pr-3 text-slate-600">{item.recipients}</td>
                      <td className="py-4 pr-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resultTone(item.result)}`}>
                          {item.result}
                        </span>
                      </td>
                      <td className="py-4 text-slate-600">{item.sentAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No delivery records found.
            </div>
          )}
        </section>
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </AdminShell>
  )
}

export default AdminSystemPage
