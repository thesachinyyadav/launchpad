import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

const ticketStages = ['Open', 'In Progress', 'Resolved']

function priorityTone(priority) {
  if (priority === 'High') {
    return 'bg-rose-50 text-rose-700'
  }

  if (priority === 'Medium') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function IncubateeSupportPage() {
  const [tickets, setTickets] = useState([])
  const [knowledgeArticles, setKnowledgeArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({ title: '', category: '', priority: 'Medium' })
  const [toast, setToast] = useState('')

  const loadSupport = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/support')
      setTickets(response.tickets || [])
      setKnowledgeArticles(response.knowledgeArticles || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to load support data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSupport()
  }, [])

  const visibleTickets = useMemo(() => {
    const lowered = searchText.trim().toLowerCase()

    return tickets.filter((ticket) => {
      return (
        ticket.title.toLowerCase().includes(lowered) ||
        ticket.category.toLowerCase().includes(lowered)
      )
    })
  }, [searchText, tickets])

  const stageBuckets = useMemo(() => {
    return ticketStages.reduce((acc, stage) => {
      acc[stage] = visibleTickets.filter((ticket) => ticket.stage === stage)
      return acc
    }, {})
  }, [visibleTickets])

  const createTicket = async () => {
    if (!newTicket.title || !newTicket.category) {
      setToast('Fill ticket title and category.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    try {
      const response = await apiRequest('/incubatee/support/tickets', {
        method: 'POST',
        body: newTicket,
      })

      if (response.item) {
        setTickets((current) => [response.item, ...current])
      }

      setNewTicket({ title: '', category: '', priority: 'Medium' })
      setIsCreateTicketOpen(false)
      setToast('Support ticket created.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to create support ticket.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  const moveTicketForward = async (ticketId) => {
    try {
      const response = await apiRequest(`/incubatee/support/tickets/${ticketId}/advance`, {
        method: 'PATCH',
      })

      const updated = response.item
      setTickets((current) => current.map((ticket) => (ticket.id === updated.id ? updated : ticket)))
      setToast('Ticket moved to next stage.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to update ticket stage.')
      setTimeout(() => setToast(''), 1800)
    }
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
        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search tickets by title or category"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-80"
            />
            <button
              type="button"
              onClick={loadSupport}
              className="lp-focus rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {ticketStages.map((stage) => (
            <article key={stage} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-[0.09em] text-slate-500">{stage}</h2>
              {isLoading ? (
                <div className="mt-3 h-16 animate-pulse rounded bg-slate-100" />
              ) : stageBuckets[stage].length ? (
                <div className="mt-3 space-y-3">
                  {stageBuckets[stage].map((ticket) => (
                    <div key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-lp-navy">{ticket.title}</p>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${priorityTone(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{ticket.category}</p>
                      <p className="mt-1 text-[11px] text-slate-400">Updated {ticket.updatedAt}</p>
                      {stage !== 'Resolved' ? (
                        <button
                          type="button"
                          onClick={() => moveTicketForward(ticket.id)}
                          className="lp-focus mt-3 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                        >
                          Move Forward
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
                  No tickets
                </div>
              )}
            </article>
          ))}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-lp-navy">Knowledge Center</h2>
          {isLoading ? (
            <div className="mt-4 h-16 animate-pulse rounded bg-slate-100" />
          ) : knowledgeArticles.length ? (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {knowledgeArticles.map((article) => (
                <article key={article.id} className="rounded-2xl border border-slate-200 p-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                    {article.tag}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-lp-navy">{article.title}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No knowledge articles available.
            </div>
          )}
        </section>
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
