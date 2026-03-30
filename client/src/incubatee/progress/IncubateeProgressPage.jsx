import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4']

function statusTone(status) {
  if (status === 'Approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Rework Requested') {
    return 'bg-rose-50 text-rose-700'
  }

  if (status === 'Submitted') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function IncubateeProgressPage() {
  const [progressData, setProgressData] = useState(null)
  const [activeQuarter, setActiveQuarter] = useState('Q1')
  const [fileName, setFileName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const loadProgress = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/progress')
      const data = response.data || {}
      const records = data.records || {}
      const quarter = data.activeQuarter || Object.keys(records)[0] || 'Q1'

      setProgressData(data)
      setActiveQuarter(quarter)
      setFileName(records[quarter]?.fileName || '')
    } catch (requestError) {
      setError(requestError.message || 'Unable to load progress records.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProgress()
  }, [])

  const record = useMemo(() => {
    return progressData?.records?.[activeQuarter] || null
  }, [activeQuarter, progressData])

  const availableQuarters = useMemo(() => {
    const records = progressData?.records || {}
    return quarterOrder.filter((quarter) => records[quarter])
  }, [progressData])

  const openQuarter = (quarter) => {
    setActiveQuarter(quarter)
    setFileName(progressData?.records?.[quarter]?.fileName || '')
  }

  const submitQuarter = async () => {
    if (!String(fileName).trim()) {
      setToast('File name is required before submission.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiRequest('/incubatee/progress/submit', {
        method: 'POST',
        body: {
          quarter: activeQuarter,
          fileName: String(fileName).trim(),
        },
      })

      const updatedRecord = response.data
      setProgressData((current) => ({
        ...(current || {}),
        activeQuarter,
        records: {
          ...((current && current.records) || {}),
          [activeQuarter]: updatedRecord,
        },
      }))
      setToast(`${activeQuarter} submission sent for review.`)
      setTimeout(() => setToast(''), 2000)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to submit progress deck.')
      setTimeout(() => setToast(''), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <IncubateeShell
      activeKey=""
      title="Incubatee Progress"
      subtitle="Quarterly progress workflow connected to backend review pipeline"
      badge={activeQuarter}
      headerAction={
        <button
          type="button"
          onClick={loadProgress}
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
          <div className="flex flex-wrap items-center gap-2">
            {availableQuarters.length ? (
              availableQuarters.map((quarter) => (
                <button
                  key={quarter}
                  type="button"
                  onClick={() => openQuarter(quarter)}
                  className={`lp-focus rounded-full px-3 py-1.5 text-xs font-semibold ${
                    activeQuarter === quarter
                      ? 'bg-lp-navy text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {quarter}
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">No quarter records found.</p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Submission Details</h2>

            {isLoading ? (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-14 rounded bg-slate-100" />
                <div className="h-14 rounded bg-slate-100" />
              </div>
            ) : record ? (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-500">Status</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-500">Submission ID</span>
                  <span>{record.submissionId || 'Not assigned'}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-500">Reviewer</span>
                  <span>{record.reviewer || 'Pending assignment'}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-500">Submitted At</span>
                  <span>{record.submittedAt || 'Not submitted'}</span>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No record for selected quarter.
              </div>
            )}
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">Upload Progress Deck</h2>

            <div className="mt-4 space-y-3">
              <input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="Quarterly deck file name"
                className="lp-focus h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />

              <p className="text-xs text-slate-500">
                Submit once your quarter deck is final. This action triggers faculty/admin notifications.
              </p>

              <button
                type="button"
                onClick={submitQuarter}
                disabled={isSubmitting || isLoading || !activeQuarter}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : `Submit ${activeQuarter}`}
              </button>
            </div>
          </article>
        </section>
      </div>

      {toast ? (
        <div className="fixed bottom-20 right-4 z-50 rounded-xl bg-lp-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </IncubateeShell>
  )
}

export default IncubateeProgressPage
