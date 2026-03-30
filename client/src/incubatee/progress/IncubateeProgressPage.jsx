import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'

const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4']

const initialQuarterRecords = {
  Q1: {
    submissionId: '#ST-2024-Q1-02',
    status: 'Approved',
    submittedAt: 'Mar 08, 2026 10:15 AM',
    reviewer: 'Dr. Sarah Vance',
    fileName: 'Q1_Progress_StatureElite.pptx',
    notes:
      'Quarter one baseline established across product velocity and pilot engagement.',
    completion: 48,
    milestones: '3/6',
    openActions: 1,
    nextReview: 'Apr 10',
  },
  Q2: {
    submissionId: '#ST-2024-Q2-05',
    status: 'Approved',
    submittedAt: 'Jun 14, 2026 02:22 PM',
    reviewer: 'Dr. Sarah Vance',
    fileName: 'Q2_Progress_StatureElite.pptx',
    notes:
      'Quarter two highlighted architecture stability and retention improvements across pilots.',
    completion: 63,
    milestones: '4/6',
    openActions: 1,
    nextReview: 'Jul 28',
  },
  Q3: {
    submissionId: '#ST-2024-Q3-08',
    status: 'Rework Requested',
    submittedAt: 'Aug 24, 2026 11:42 AM',
    reviewer: 'Dr. Sarah Vance',
    fileName: 'Q3_Progress_Report_StatureElite.pptx',
    notes:
      'Current quarter focused on scaling GTM and enterprise integration readiness.',
    completion: 75,
    milestones: '4/6',
    openActions: 2,
    nextReview: 'Oct 28',
  },
  Q4: {
    submissionId: '#ST-2024-Q4-DRAFT',
    status: 'Draft',
    submittedAt: 'Not submitted',
    reviewer: 'Pending assignment',
    fileName: null,
    notes: '',
    completion: 75,
    milestones: '4/6',
    openActions: 3,
    nextReview: 'Dec 15',
  },
}

const reviewFeedByQuarter = {
  Q1: [
    {
      id: 'q1-r1',
      reviewer: 'Dr. Sarah Vance',
      role: 'Lead Faculty Reviewer',
      status: 'Approved',
      date: 'Mar 09, 2026',
      comment:
        'Solid first-quarter baseline. Maintain data discipline in subsequent updates.',
    },
  ],
  Q2: [
    {
      id: 'q2-r1',
      reviewer: 'Dr. Sarah Vance',
      role: 'Lead Faculty Reviewer',
      status: 'Approved',
      date: 'Jun 15, 2026',
      comment:
        'Milestone reporting is clear and evidence-backed. Continue the same KPI clarity for Q3.',
    },
  ],
  Q3: [
    {
      id: 'q3-r1',
      reviewer: 'Dr. Sarah Vance',
      role: 'Lead Faculty Reviewer',
      status: 'Rework',
      date: 'Aug 24, 2026',
      comment:
        'Year-2 financial projections need R&D versus marketing split. Update Slide 14 and Slide 15 with sub-categories and revised CAC logic.',
    },
    {
      id: 'q3-r2',
      reviewer: 'Marcus Chen',
      role: 'Venture Partner',
      status: 'Reviewed',
      date: 'Aug 22, 2026',
      comment:
        'Good directional plan. Include previous quarter milestone validation in appendix.',
    },
  ],
  Q4: [],
}

const historyByQuarter = {
  Q1: [
    {
      id: 'q1-h1',
      label: 'Submitted',
      detail: 'Initial baseline deck submitted',
      result: 'Approved',
      date: 'Mar 08, 2026',
    },
  ],
  Q2: [
    {
      id: 'q2-h1',
      label: 'Submitted',
      detail: 'Quarter two growth update uploaded',
      result: 'Approved',
      date: 'Jun 14, 2026',
    },
  ],
  Q3: [
    {
      id: 'q3-h1',
      label: 'Submitted',
      detail: 'Quarter three deck uploaded for committee review',
      result: 'Rework',
      date: 'Aug 24, 2026',
    },
    {
      id: 'q3-h2',
      label: 'Feedback Received',
      detail: 'Reviewer requested projection revision',
      result: 'Rework',
      date: 'Aug 24, 2026',
    },
  ],
  Q4: [],
}

const previewModes = ['default', 'loading', 'empty', 'error']

const sideNavItems = [
  'Overview',
  'Quarterly Uploads',
  'Faculty Reviews',
  'Submission History',
  'Settings',
]

const mobileNavItems = ['Overview', 'Uploads', 'Reviews', 'History', 'Settings']

function resultBadgeClass(result) {
  if (result === 'Approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (result === 'Rework') {
    return 'bg-rose-50 text-rose-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function statusBadgeClass(status) {
  if (status === 'Approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Rework Requested') {
    return 'bg-rose-500/15 border border-rose-300 text-rose-100'
  }

  if (status === 'Under Review' || status === 'Submitted') {
    return 'bg-lp-gold/20 border border-lp-gold/40 text-lp-gold'
  }

  return 'bg-white/10 border border-white/20 text-slate-100'
}

function LoadingView() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-3xl bg-slate-200/70 p-8">
        <div className="h-4 w-32 rounded bg-slate-300" />
        <div className="mt-4 h-10 w-72 rounded bg-slate-300" />
        <div className="mt-3 h-4 w-[60%] rounded bg-slate-300" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={`kpi-loader-${idx}`} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="mt-5 h-8 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="mt-4 h-44 rounded-2xl bg-slate-200" />
            <div className="mt-4 h-16 rounded-xl bg-slate-200" />
          </div>
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-36 rounded bg-slate-200" />
            <div className="mt-4 h-24 rounded bg-slate-200" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="animate-pulse rounded-3xl bg-slate-300 p-8">
            <div className="h-5 w-28 rounded bg-slate-200" />
            <div className="mt-4 h-20 rounded bg-slate-200" />
          </div>
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-5 w-36 rounded bg-slate-200" />
            <div className="mt-4 h-20 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

function IncubateeProgressPage() {
  const [activeQuarter, setActiveQuarter] = useState('Q3')
  const [records, setRecords] = useState(initialQuarterRecords)
  const [viewState, setViewState] = useState('default')
  const [isReworkPreview, setIsReworkPreview] = useState(true)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mobileReviewOpen, setMobileReviewOpen] = useState(false)
  const [toast, setToast] = useState('')

  const record = records[activeQuarter]

  const effectiveStatus = (() => {
    if (isSubmitting) {
      return 'Under Review'
    }

    if (isReworkPreview) {
      return 'Rework Requested'
    }

    return record.status
  })()

  const reviewItems = useMemo(() => {
    if (viewState === 'empty') {
      return []
    }

    return reviewFeedByQuarter[activeQuarter]
  }, [activeQuarter, viewState])

  const historyItems = useMemo(() => {
    if (viewState === 'empty') {
      return []
    }

    return historyByQuarter[activeQuarter]
  }, [activeQuarter, viewState])

  const setFile = (name) => {
    setRecords((current) => ({
      ...current,
      [activeQuarter]: {
        ...current[activeQuarter],
        fileName: name,
      },
    }))
  }

  const setNotes = (value) => {
    setRecords((current) => ({
      ...current,
      [activeQuarter]: {
        ...current[activeQuarter],
        notes: value,
      },
    }))
  }

  const replaceFile = () => {
    setFile(`${activeQuarter}_Updated_Progress_Deck.pptx`)
    setToast('File replaced for this quarter.')
    setTimeout(() => setToast(''), 1800)
  }

  const removeFile = () => {
    setFile(null)
  }

  const selectMockFile = () => {
    setFile(`${activeQuarter}_Progress_Deck_v1.pptx`)
    setToast('File selected successfully.')
    setTimeout(() => setToast(''), 1800)
  }

  const saveDraft = () => {
    setIsSavingDraft(true)

    setTimeout(() => {
      setIsSavingDraft(false)
      setRecords((current) => ({
        ...current,
        [activeQuarter]: {
          ...current[activeQuarter],
          status: 'Draft',
        },
      }))
      setToast('Draft saved.')
      setTimeout(() => setToast(''), 1800)
    }, 700)
  }

  const submitQuarter = () => {
    if (!record.fileName) {
      setToast('Please upload a file before submission.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setIsReworkPreview(false)
      setRecords((current) => ({
        ...current,
        [activeQuarter]: {
          ...current[activeQuarter],
          status: 'Submitted',
          submittedAt: `${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
        },
      }))
      setToast('Submission sent for faculty review.')
      setTimeout(() => setToast(''), 2200)
    }, 1000)
  }

  const downloadTemplate = () => {
    setToast('Template download is a UI placeholder.')
    setTimeout(() => setToast(''), 1800)
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-lp-navy">
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-6">
          <BrandLogo compact />
          <nav className="hidden gap-6 text-sm font-semibold text-slate-500 md:flex">
            <Link to="/incubatee/dashboard" className="lp-focus hover:text-lp-navy">Dashboard</Link>
            <button className="lp-focus hover:text-lp-navy" type="button">Analytics</button>
            <button className="lp-focus hover:text-lp-navy" type="button">Reports</button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/incubatee/profile" className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 hover:text-lp-navy">
            Profile
          </Link>
          <Link to="/incubatee/presentations" className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 hover:text-lp-navy">
            Presentations
          </Link>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 flex-col border-r border-slate-200 bg-slate-100 p-4 md:flex">
        <div className="mb-6 px-2">
          <h2 className="font-display text-lg font-black text-lp-navy">LaunchPad CICF</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-lp-gold">Incubation Program</p>
        </div>

        <nav className="flex-1 space-y-1 text-sm font-medium">
          {sideNavItems.map((item) => {
            const active = item === 'Quarterly Uploads'
            return (
              <button
                key={item}
                type="button"
                className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                  active
                    ? 'bg-white text-lp-gold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-lp-navy'
                }`}
              >
                {item}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          className="lp-focus mt-4 rounded-xl bg-gradient-to-r from-[#755b00] to-lp-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
        >
          New Submission
        </button>
      </aside>

      <main className="px-4 pb-28 pt-20 md:ml-64 md:px-8 md:pb-10 md:pt-24">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-lp-gold">
                Submission Cycle 2024
              </span>
              <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-lp-navy md:text-5xl">
                Incubatee Progress
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
                Upload your quarterly milestone presentation for faculty committee review.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {previewModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewState(mode)}
                  className={`lp-focus rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                    viewState === mode
                      ? 'bg-lp-navy text-white'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsReworkPreview((current) => !current)}
                className={`lp-focus rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                  isReworkPreview
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-slate-600'
                }`}
              >
                {isReworkPreview ? 'Rework On' : 'Rework Off'}
              </button>
            </div>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1.5">
            {quarterOrder.map((quarter) => (
              <button
                key={quarter}
                type="button"
                onClick={() => setActiveQuarter(quarter)}
                className={`lp-focus rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] ${
                  activeQuarter === quarter
                    ? 'bg-white text-lp-gold shadow-sm'
                    : 'text-slate-500 hover:text-lp-navy'
                }`}
              >
                {quarter}
              </button>
            ))}
          </div>

          {viewState === 'error' ? (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-sm font-medium text-rose-700">
                Unable to fetch latest quarter status. Showing cached records.
              </p>
              <button
                type="button"
                onClick={() => setViewState('default')}
                className="lp-focus rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Retry
              </button>
            </section>
          ) : null}

          {viewState === 'loading' ? (
            <LoadingView />
          ) : viewState === 'empty' ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h3 className="font-display text-2xl font-bold text-lp-navy">No quarter submissions yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Select a quarter and upload your first progress deck to start review tracking.
              </p>
              <button
                type="button"
                onClick={() => setViewState('default')}
                className="lp-focus mt-6 rounded-xl bg-lp-navy px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white"
              >
                Start Now
              </button>
            </section>
          ) : (
            <>
              <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Completion</p>
                  <p className="mt-4 font-display text-3xl font-black text-lp-navy">{record.completion}%</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Milestones</p>
                  <p className="mt-4 font-display text-3xl font-black text-lp-navy">{record.milestones}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Open Actions</p>
                  <p className="mt-4 font-display text-3xl font-black text-rose-600">{record.openActions}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Next Review</p>
                  <p className="mt-4 font-display text-2xl font-black text-lp-navy">{record.nextReview}</p>
                </article>
              </section>

              <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                      <h3 className="font-display text-xl font-bold text-lp-navy">Quarterly PPT Upload</h3>
                      <button
                        type="button"
                        onClick={downloadTemplate}
                        className="lp-focus rounded-lg border border-lp-gold/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-lp-navy"
                      >
                        Download Template
                      </button>
                    </div>

                    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <p className="text-lg font-semibold text-lp-navy">Drag and drop your presentation</p>
                      <p className="mt-1 text-sm text-slate-500">PDF or PPTX files only. Max 25MB.</p>
                      <button
                        type="button"
                        onClick={selectMockFile}
                        className="lp-focus mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700"
                      >
                        Select File
                      </button>
                    </div>

                    {record.fileName ? (
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-lp-navy">{record.fileName}</p>
                          <p className="mt-1 text-[11px] text-slate-500">12.4 MB • Uploaded recently</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={replaceFile}
                            className="lp-focus rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="lp-focus rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5">
                      <label className="mb-2 ml-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Submission Summary
                      </label>
                      <textarea
                        rows={4}
                        value={record.notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="lp-focus w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 placeholder:text-slate-400"
                        placeholder="Summarize key achievements and blockers for this quarter."
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={saveDraft}
                        disabled={isSavingDraft}
                        className="lp-focus rounded-xl border border-lp-gold/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-lp-navy disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSavingDraft ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        type="button"
                        onClick={submitQuarter}
                        disabled={isSubmitting}
                        className="lp-focus rounded-xl bg-gradient-to-r from-[#755b00] to-lp-gold px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit For Review'}
                      </button>
                    </div>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h3 className="mb-6 font-display text-xl font-bold text-lp-navy">Quarter History Timeline</h3>

                    {historyItems.length === 0 ? (
                      <p className="text-sm text-slate-500">No timeline entries for this quarter yet.</p>
                    ) : (
                      <div className="relative space-y-6 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-300">
                        {historyItems.map((item) => (
                          <article key={item.id} className="relative">
                            <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-lp-navy" />
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-lp-navy">{item.label}</p>
                                <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
                                <span className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${resultBadgeClass(item.result)}`}>
                                  {item.result}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{item.date}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </article>
                </div>

                <div className="space-y-8">
                  <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black to-lp-navy p-6 text-white shadow-xl sm:p-8">
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-lp-gold/20 blur-2xl" />
                    <div className="relative z-10 space-y-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-lp-gold">Current Status</span>
                        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${statusBadgeClass(effectiveStatus)}`}>
                          {effectiveStatus}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">Submission ID</p>
                          <p className="mt-1 text-xl font-bold text-white">{record.submissionId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">Reviewer</p>
                          <p className="mt-1 text-sm font-semibold text-white">{record.reviewer}</p>
                        </div>
                        <p className="border-t border-white/10 pt-3 text-[11px] text-slate-300">
                          Last updated: {record.submittedAt}
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-slate-100 p-6 sm:p-8">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-bold text-lp-navy">Faculty Review Comments</h3>
                      <button
                        type="button"
                        onClick={() => setMobileReviewOpen((current) => !current)}
                        className="lp-focus rounded-lg border border-slate-300 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 md:hidden"
                      >
                        {mobileReviewOpen ? 'Collapse' : 'Expand'}
                      </button>
                    </div>

                    <div className={`${mobileReviewOpen ? 'space-y-4' : 'hidden md:block md:space-y-4'}`}>
                      {reviewItems.length === 0 ? (
                        <p className="text-sm text-slate-500">No review comments for this quarter yet.</p>
                      ) : (
                        reviewItems.map((review) => (
                          <div
                            key={review.id}
                            className={`rounded-xl border p-4 ${
                              review.status === 'Rework'
                                ? 'border-rose-200 bg-rose-50'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-lp-navy">{review.reviewer}</p>
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                {review.role}
                              </span>
                              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${resultBadgeClass(review.status === 'Rework' ? 'Rework' : review.status === 'Approved' ? 'Approved' : 'Draft')}`}>
                                {review.status}
                              </span>
                            </div>

                            {review.status === 'Rework' ? (
                              <div className="mb-3 rounded-lg border border-rose-200 bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700">
                                Rework instructions: resolve all highlighted slide comments before resubmission.
                              </div>
                            ) : null}

                            <p className="text-xs leading-6 text-slate-700">{review.comment}</p>
                            <p className="mt-2 text-[11px] text-slate-500">{review.date}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-white/10 bg-lp-navy/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={isSavingDraft}
            className="lp-focus rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white"
          >
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={submitQuarter}
            disabled={isSubmitting}
            className="lp-focus rounded-lg bg-gradient-to-r from-[#755b00] to-lp-gold px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit PPT'}
          </button>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {mobileNavItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`lp-focus text-[10px] font-semibold uppercase tracking-[0.1em] ${
              item === 'Uploads' ? 'text-lp-gold' : 'text-slate-500'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {toast ? (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-lp-navy px-4 py-2 text-sm text-white shadow-xl md:bottom-6">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export default IncubateeProgressPage