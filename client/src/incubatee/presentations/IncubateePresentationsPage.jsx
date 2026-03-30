import { useEffect, useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'
import { apiRequest } from '../../lib/api'

function formatKeyLabel(key) {
  return String(key || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (value) => value.toUpperCase())
}

function statusTone(status) {
  if (status === 'Under Review') {
    return 'bg-amber-50 text-amber-700'
  }

  if (status === 'Rework Requested') {
    return 'bg-rose-50 text-rose-700'
  }

  if (status === 'Approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function IncubateePresentationsPage() {
  const [presentations, setPresentations] = useState(null)
  const [draftUploads, setDraftUploads] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const loadPresentations = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/incubatee/presentations')
      setPresentations(response.data || null)
      setDraftUploads({})
    } catch (requestError) {
      setError(requestError.message || 'Unable to load presentation workflow.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPresentations()
  }, [])

  const activeStage = presentations?.activeStage || 'stage2'
  const stageUploads = useMemo(() => {
    return presentations?.uploads?.[activeStage] || {}
  }, [activeStage, presentations])

  const fileKeys = useMemo(() => {
    const keys = Object.keys(stageUploads)
    if (keys.length) {
      return keys
    }

    return ['boardDeck', 'rubricReadiness', 'financialBriefing']
  }, [stageUploads])

  const missingCount = useMemo(() => {
    return fileKeys.filter((key) => {
      const value = draftUploads[key] ?? stageUploads[key]
      return !String(value || '').trim()
    }).length
  }, [draftUploads, fileKeys, stageUploads])

  const saveUpload = async (fileKey) => {
    const value = String(draftUploads[fileKey] ?? stageUploads[fileKey] ?? '').trim()

    try {
      const response = await apiRequest('/incubatee/presentations/upload', {
        method: 'PATCH',
        body: {
          stage: activeStage,
          fileKey,
          fileName: value || null,
        },
      })

      setPresentations(response.data || presentations)
      setDraftUploads((current) => {
        const next = { ...current }
        delete next[fileKey]
        return next
      })
      setToast(value ? 'Presentation file saved.' : 'Presentation file cleared.')
      setTimeout(() => setToast(''), 1800)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to save presentation file.')
      setTimeout(() => setToast(''), 1800)
    }
  }

  const submitForReview = async () => {
    setIsSubmitting(true)

    try {
      const response = await apiRequest('/incubatee/presentations/submit', {
        method: 'POST',
      })

      setPresentations(response.data || presentations)
      setToast('Presentation package submitted for review.')
      setTimeout(() => setToast(''), 2000)
    } catch (requestError) {
      setToast(requestError.message || 'Unable to submit presentation package.')
      setTimeout(() => setToast(''), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <IncubateeShell
      activeKey=""
      title="Incubatee Presentations"
      subtitle="Upload stage assets and submit complete package for faculty review"
      badge={activeStage.toUpperCase()}
      headerAction={
        <button
          type="button"
          onClick={loadPresentations}
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

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Status</p>
            <p className="mt-3 text-2xl font-black text-lp-navy">{presentations?.status || 'Draft'}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Attempt</p>
            <p className="mt-3 text-2xl font-black text-lp-navy">{presentations?.attemptNumber ?? 0}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Missing Files</p>
            <p className="mt-3 text-2xl font-black text-lp-navy">{missingCount}</p>
          </article>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold text-lp-navy">{activeStage.toUpperCase()} Uploads</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusTone(presentations?.status || 'Draft')}`}>
              {presentations?.status || 'Draft'}
            </span>
          </div>

          {isLoading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-14 rounded bg-slate-100" />
              <div className="h-14 rounded bg-slate-100" />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {fileKeys.map((fileKey) => {
                const liveValue = String(stageUploads[fileKey] || '')
                const draftValue = draftUploads[fileKey] ?? liveValue

                return (
                  <article key={fileKey} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">{formatKeyLabel(fileKey)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        value={draftValue}
                        onChange={(event) =>
                          setDraftUploads((current) => ({ ...current, [fileKey]: event.target.value }))
                        }
                        placeholder="Enter uploaded file name"
                        className="lp-focus h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => saveUpload(fileKey)}
                        className="lp-focus rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700"
                      >
                        Save
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Current: {liveValue || 'Not uploaded'}
                    </p>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={submitForReview}
              disabled={isSubmitting || isLoading || missingCount > 0}
              className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit For Review'}
            </button>
          </div>
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

export default IncubateePresentationsPage
