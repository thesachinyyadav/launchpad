import { useMemo, useState } from 'react'
import AdminShell from '../common/AdminShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const initialTemplates = [
  {
    id: 'tp-1',
    name: 'Review Reminder',
    audience: 'Faculty',
    status: 'Active',
  },
  {
    id: 'tp-2',
    name: 'Submission Received',
    audience: 'Incubatee',
    status: 'Active',
  },
  {
    id: 'tp-3',
    name: 'Claim Decision Update',
    audience: 'Incubatee',
    status: 'Draft',
  },
]

const initialDeliveryLog = [
  {
    id: 'dl-1',
    emailType: 'Review Reminder',
    recipients: 18,
    provider: 'Resend',
    result: 'Delivered',
    sentAt: 'Mar 30, 2026 09:40 AM',
  },
  {
    id: 'dl-2',
    emailType: 'Submission Received',
    recipients: 7,
    provider: 'Resend',
    result: 'Delivered',
    sentAt: 'Mar 30, 2026 08:55 AM',
  },
  {
    id: 'dl-3',
    emailType: 'Claim Decision Update',
    recipients: 3,
    provider: 'Resend',
    result: 'Queued',
    sentAt: 'Mar 30, 2026 08:12 AM',
  },
]

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
  const [viewState, setViewState] = useState('default')
  const [templates, setTemplates] = useState(initialTemplates)
  const [deliveryLog, setDeliveryLog] = useState(initialDeliveryLog)
  const [campaign, setCampaign] = useState({ template: '', audience: '', subject: '' })
  const [toast, setToast] = useState('')

  const visibleTemplates = viewState === 'empty' ? [] : templates
  const visibleLogs = viewState === 'empty' ? [] : deliveryLog

  const deliveryRate = useMemo(() => {
    if (!visibleLogs.length) {
      return 0
    }

    const delivered = visibleLogs.filter((item) => item.result === 'Delivered').length
    return Math.round((delivered / visibleLogs.length) * 100)
  }, [visibleLogs])

  const launchCampaign = () => {
    if (!campaign.template || !campaign.audience || !campaign.subject) {
      setToast('Complete template, audience, and subject.')
      setTimeout(() => setToast(''), 1700)
      return
    }

    setDeliveryLog((current) => [
      {
        id: `dl-${Date.now()}`,
        emailType: campaign.template,
        recipients: campaign.audience === 'All' ? 42 : 18,
        provider: 'Resend',
        result: 'Queued',
        sentAt: new Date().toLocaleString('en-IN'),
      },
      ...current,
    ])

    setCampaign({ template: '', audience: '', subject: '' })
    setToast('Email campaign queued via Resend.')
    setTimeout(() => setToast(''), 1800)
  }

  const toggleTemplate = (templateId) => {
    setTemplates((current) =>
      current.map((item) =>
        item.id === templateId
          ? { ...item, status: item.status === 'Active' ? 'Draft' : 'Active' }
          : item,
      ),
    )
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
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Open Provider Console
        </button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Notification transport is email only for now, powered by Resend. SMS and push channels are intentionally disabled in this frontend.
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Email delivery metrics unavailable from provider.
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Active Templates</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">
              {viewState === 'empty' ? 0 : visibleTemplates.filter((item) => item.status === 'Active').length}
            </p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Delivery Rate</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : deliveryRate}%</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Provider</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">Resend</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="mt-4 h-14 rounded bg-slate-200" />
            <div className="mt-3 h-14 rounded bg-slate-200" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Email Templates</h2>
                <div className="mt-4 space-y-3">
                  {visibleTemplates.map((item) => (
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
                    <option>Faculty</option>
                    <option>Incubatees</option>
                    <option>All</option>
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
                  onClick={launchCampaign}
                  className="lp-focus mt-4 rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
                >
                  Queue Campaign
                </button>
              </article>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Delivery Log (Resend)</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                      <th className="pb-3 pr-3">Email Type</th>
                      <th className="pb-3 pr-3">Recipients</th>
                      <th className="pb-3 pr-3">Provider</th>
                      <th className="pb-3 pr-3">Result</th>
                      <th className="pb-3">Sent At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleLogs.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 pr-3 font-semibold text-lp-navy">{item.emailType}</td>
                        <td className="py-4 pr-3 text-slate-600">{item.recipients}</td>
                        <td className="py-4 pr-3 text-slate-600">{item.provider}</td>
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
            </section>
          </>
        )}
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
