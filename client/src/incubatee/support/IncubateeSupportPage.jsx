import { useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const ticketStages = ['Open', 'In Progress', 'Resolved']

const initialTickets = [
  {
    id: 'tk-1',
    title: 'Unable to upload large PPT file',
    category: 'Submissions',
    priority: 'High',
    stage: 'Open',
    updatedAt: 'Mar 30, 2026 10:18 AM',
  },
  {
    id: 'tk-2',
    title: 'Intern attendance export mismatch',
    category: 'Interns',
    priority: 'Medium',
    stage: 'In Progress',
    updatedAt: 'Mar 29, 2026 04:22 PM',
  },
  {
    id: 'tk-3',
    title: 'Claim settlement receipt not downloadable',
    category: 'Finance',
    priority: 'Low',
    stage: 'Resolved',
    updatedAt: 'Mar 27, 2026 12:01 PM',
  },
]

const knowledgeArticles = [
  {
    id: 'ka-1',
    title: 'How to submit rework version for progress PPT',
    tag: 'Submissions',
  },
  {
    id: 'ka-2',
    title: 'Mentor reassignment workflow for active interns',
    tag: 'Interns',
  },
  {
    id: 'ka-3',
    title: 'Finance claim references and settlement timeline',
    tag: 'Finance',
  },
]

function priorityTone(priority) {
  if (priority === 'High') {
    return 'bg-rose-50 text-rose-700'
  }

  if (priority === 'Medium') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={`support-kpi-${idx}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="mt-3 h-8 w-14 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-20 rounded bg-slate-200" />
      </div>
    </div>
  )
}

function IncubateeSupportPage() {
  const [viewState, setViewState] = useState('default')
  const [searchText, setSearchText] = useState('')
  const [tickets, setTickets] = useState(initialTickets)
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({ title: '', category: '', priority: 'Medium' })
  const [toast, setToast] = useState('')

  const visibleTickets = useMemo(() => {
    const source = viewState === 'empty' ? [] : tickets
    const lowered = searchText.trim().toLowerCase()

    return source.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(lowered) ||
        ticket.category.toLowerCase().includes(lowered),
    )
  }, [searchText, tickets, viewState])

  const stageBuckets = useMemo(() => {
    return ticketStages.reduce((acc, stage) => {
      acc[stage] = visibleTickets.filter((ticket) => ticket.stage === stage)
      return acc
    }, {})
  }, [visibleTickets])

  const openCount = visibleTickets.filter((ticket) => ticket.stage === 'Open').length
  const progressCount = visibleTickets.filter((ticket) => ticket.stage === 'In Progress').length
  const resolvedCount = visibleTickets.filter((ticket) => ticket.stage === 'Resolved').length

  const createTicket = () => {
    if (!newTicket.title || !newTicket.category) {
      setToast('Fill ticket title and category.')
      setTimeout(() => setToast(''), 1600)
      return
    }

    setTickets((current) => [
      {
        id: `tk-${Date.now()}`,
        title: newTicket.title,
        category: newTicket.category,
        priority: newTicket.priority,
        stage: 'Open',
        updatedAt: new Date().toLocaleString('en-IN'),
      },
      ...current,
    ])

    setNewTicket({ title: '', category: '', priority: 'Medium' })
    setIsCreateTicketOpen(false)
    setToast('Support ticket created.')
    setTimeout(() => setToast(''), 1700)
  }

  const moveTicketToNextStage = (ticketId) => {
    setTickets((current) =>
      current.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket
        }

        if (ticket.stage === 'Open') {
          return { ...ticket, stage: 'In Progress' }
        }

        if (ticket.stage === 'In Progress') {
          return { ...ticket, stage: 'Resolved' }
        }

        return ticket
      }),
    )

    setToast('Ticket moved to next stage.')
    setTimeout(() => setToast(''), 1700)
  }

  return (
    <IncubateeShell
      activeKey="support"
      title="Incubatee Support"
      subtitle="Track issues, resolution progress, and help center resources"
      badge="Support Queue"
      headerAction={
        <button
          type="button"
          onClick={() => setIsCreateTicketOpen(true)}
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Raise Ticket
        </button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
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

            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search tickets by title or category"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
          </div>
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Support feed failed to load. Keep using this preview while backend APIs are pending.
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Open</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : openCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">In Progress</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : progressCount}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Resolved</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{viewState === 'empty' ? 0 : resolvedCount}</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <>
            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Ticket Pipeline</h2>

              {viewState === 'empty' ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">No support tickets raised yet.</p>
                  <p className="mt-2 text-sm text-slate-500">Use Raise Ticket when your team needs assistance.</p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  {ticketStages.map((stage) => (
                    <article key={stage} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.09em] text-slate-500">{stage}</p>
                      <div className="mt-3 space-y-3">
                        {stageBuckets[stage].map((ticket) => (
                          <div key={ticket.id} className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-lp-navy">{ticket.title}</p>
                              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${priorityTone(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{ticket.category}</p>
                            <p className="mt-1 text-[11px] text-slate-400">Updated {ticket.updatedAt}</p>
                            {ticket.stage !== 'Resolved' ? (
                              <button
                                type="button"
                                onClick={() => moveTicketToNextStage(ticket.id)}
                                className="lp-focus mt-3 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                              >
                                Move Forward
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-extrabold text-lp-navy">Knowledge Center</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {(viewState === 'empty' ? [] : knowledgeArticles).map((article) => (
                  <article key={article.id} className="rounded-2xl border border-slate-200 p-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                      {article.tag}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-lp-navy">{article.title}</p>
                    <button
                      type="button"
                      className="lp-focus mt-3 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Open Guide
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {isCreateTicketOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Create Support Ticket</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={newTicket.title}
                onChange={(event) => setNewTicket((current) => ({ ...current, title: event.target.value }))}
                placeholder="Ticket title"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newTicket.category}
                onChange={(event) => setNewTicket((current) => ({ ...current, category: event.target.value }))}
                placeholder="Category"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <select
                value={newTicket.priority}
                onChange={(event) => setNewTicket((current) => ({ ...current, priority: event.target.value }))}
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateTicketOpen(false)}
                className="lp-focus rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createTicket}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </IncubateeShell>
  )
}

export default IncubateeSupportPage
