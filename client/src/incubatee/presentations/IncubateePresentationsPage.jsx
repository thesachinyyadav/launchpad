import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'

const stageConfig = {
  stage1: {
    title: 'Stage 1: Foundational',
    subtitle: 'Business model, competitor landscape, and market survey',
    requiredFiles: [
      {
        id: 'businessModelCanvas',
        name: 'Business Model Canvas',
        note: 'PDF or XLSX format (max 10MB)',
      },
      {
        id: 'competitorAnalysis',
        name: 'Competitor Landscape',
        note: 'Comparative matrix and market share data',
      },
      {
        id: 'marketSurvey',
        name: 'Market Survey',
        note: 'Customer interviews and validation report',
      },
    ],
    feedback: [
      {
        id: 'f1-1',
        reviewer: 'Dr. Sarah Vance',
        role: 'Lead Mentor',
        status: 'Approved',
        date: 'Mar 14, 2026 10:20 AM',
        comment:
          'Stage 1 submission is strong. Ensure market segmentation is preserved in your Stage 2 board deck.',
      },
    ],
    history: [
      {
        id: 'h1-1',
        title: 'Submitted for review',
        detail: 'Foundational package submitted for Stage 1',
        date: 'Mar 11, 2026',
      },
      {
        id: 'h1-2',
        title: 'Approved',
        detail: 'Faculty approved progression to Stage 2',
        date: 'Mar 15, 2026',
      },
    ],
  },
  stage2: {
    title: 'Stage 2: Growth Focus',
    subtitle: 'Board deck, rubric readiness, and financial briefing',
    requiredFiles: [
      {
        id: 'boardDeck',
        name: 'Board Deck Presentation',
        note: 'PPTX or PDF format (max 20MB)',
      },
      {
        id: 'rubricReadiness',
        name: 'Rubric Readiness Sheet',
        note: 'Scoring criteria checklist and supporting links',
      },
      {
        id: 'financialBriefing',
        name: 'Financial Briefing',
        note: 'Revenue forecast, burn rate, and runway sheet',
      },
    ],
    feedback: [
      {
        id: 'f2-1',
        reviewer: 'Dr. Sarah Vance',
        role: 'Lead Mentor',
        status: 'Rework',
        date: 'Mar 29, 2026 10:12 AM',
        comment:
          'Competitor pricing model needs stronger granularity. Slide 12 projections should align with revised GTM assumptions.',
      },
      {
        id: 'f2-2',
        reviewer: 'Marcus Chen',
        role: 'Venture Partner',
        status: 'Approved',
        date: 'Mar 28, 2026 04:30 PM',
        comment:
          'Financial modeling is consistent with current trends. Ensure speaker script reflects revised risk disclosures.',
      },
    ],
    history: [
      {
        id: 'h2-1',
        title: 'Draft saved',
        detail: 'Attempt #2 autosaved for board deck package',
        date: 'Mar 27, 2026',
      },
      {
        id: 'h2-2',
        title: 'Submitted for review',
        detail: 'Attempt #2 submitted to faculty panel',
        date: 'Mar 28, 2026',
      },
      {
        id: 'h2-3',
        title: 'Feedback received',
        detail: 'Rework requested for pricing and slide alignment',
        date: 'Mar 29, 2026',
      },
      {
        id: 'h2-4',
        title: 'Resubmission pending',
        detail: 'Upload revised board deck before Apr 04, 2026',
        date: 'Mar 30, 2026',
      },
    ],
  },
}

const initialUploads = {
  stage1: {
    businessModelCanvas: 'Business_Model_V4.pdf',
    competitorAnalysis: 'Market_Analysis_Final.xlsx',
    marketSurvey: 'Market_Survey_Insights.pdf',
  },
  stage2: {
    boardDeck: null,
    rubricReadiness: 'Rubric_Readiness_v2.xlsx',
    financialBriefing: 'Financial_Briefing_Q2.xlsx',
  },
}

const sidebarItems = ['Dashboard', 'Projects', 'Presentations', 'Team', 'Support']

const mobileNavItems = ['Home', 'Projects', 'Present', 'Team']

const previewModes = ['default', 'loading', 'empty', 'error']

function statusChipClass(status) {
  if (status === 'Approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Rework') {
    return 'bg-rose-50 text-rose-700'
  }

  return 'bg-amber-50 text-amber-700'
}

function normalizeFileName(name) {
  return `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')}_mock.pdf`
}

function LoadingPanel() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-3xl bg-slate-200/70 p-8">
        <div className="h-4 w-40 rounded bg-slate-300" />
        <div className="mt-4 h-10 w-64 rounded bg-slate-300" />
        <div className="mt-3 h-4 w-[70%] rounded bg-slate-300" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="mt-4 h-20 rounded bg-slate-200" />
            <div className="mt-3 h-20 rounded bg-slate-200" />
          </div>
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="mt-4 h-16 rounded bg-slate-200" />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="animate-pulse rounded-3xl bg-slate-300 p-8">
            <div className="h-5 w-28 rounded bg-slate-200" />
            <div className="mt-4 h-16 rounded bg-slate-200" />
          </div>
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-16 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

function IncubateePresentationsPage() {
  const [activeStage, setActiveStage] = useState('stage2')
  const [uploads, setUploads] = useState(initialUploads)
  const [viewState, setViewState] = useState('default')
  const [isReworkRequested, setIsReworkRequested] = useState(true)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptNumber, setAttemptNumber] = useState(2)
  const [mobileFeedbackOpen, setMobileFeedbackOpen] = useState(false)
  const [toast, setToast] = useState('')

  const stageData = stageConfig[activeStage]

  const stageUploads = uploads[activeStage]

  const completedRequiredCount = useMemo(() => {
    return stageData.requiredFiles.filter((file) => stageUploads[file.id]).length
  }, [stageData.requiredFiles, stageUploads])

  const allRequiredComplete = completedRequiredCount === stageData.requiredFiles.length

  const statusLabel = (() => {
    if (isSubmitting) {
      return 'Under Review'
    }

    if (isReworkRequested) {
      return 'Rework Requested'
    }

    if (allRequiredComplete) {
      return 'Submitted'
    }

    return 'Draft'
  })()

  const statusBadgeClass = (() => {
    if (statusLabel === 'Rework Requested') {
      return 'border border-rose-300 bg-rose-500/15 text-rose-100'
    }

    if (statusLabel === 'Submitted' || statusLabel === 'Under Review') {
      return 'border border-amber-300/40 bg-lp-gold/20 text-lp-gold'
    }

    return 'border border-white/20 bg-white/10 text-slate-100'
  })()

  const currentFeedback = useMemo(() => {
    if (viewState === 'empty') {
      return []
    }

    return stageData.feedback
  }, [viewState, stageData.feedback])

  const currentHistory = useMemo(() => {
    if (viewState === 'empty') {
      return []
    }

    return stageData.history
  }, [viewState, stageData.history])

  const uploadMockFile = (fileId, label) => {
    setUploads((current) => ({
      ...current,
      [activeStage]: {
        ...current[activeStage],
        [fileId]: normalizeFileName(label),
      },
    }))

    setToast(`Selected file for ${label}.`)
    setTimeout(() => setToast(''), 1600)
  }

  const removeMockFile = (fileId) => {
    setUploads((current) => ({
      ...current,
      [activeStage]: {
        ...current[activeStage],
        [fileId]: null,
      },
    }))
  }

  const saveDraft = () => {
    setIsSavingDraft(true)

    setTimeout(() => {
      setIsSavingDraft(false)
      setToast('Draft saved successfully.')
      setTimeout(() => setToast(''), 1800)
    }, 700)
  }

  const submitForReview = () => {
    if (!allRequiredComplete) {
      setToast('Complete all required assets before submission.')
      setTimeout(() => setToast(''), 1800)
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setIsReworkRequested(false)
      setAttemptNumber((current) => current + 1)
      setToast('Submission sent to faculty review queue.')
      setTimeout(() => setToast(''), 2200)
    }, 1000)
  }

  const resetCurrentStage = () => {
    setUploads((current) => ({
      ...current,
      [activeStage]: Object.keys(current[activeStage]).reduce((acc, key) => {
        acc[key] = null
        return acc
      }, {}),
    }))

    setToast('Current stage form reset.')
    setTimeout(() => setToast(''), 1600)
  }

  const downloadTemplate = () => {
    setToast('Template download is a UI placeholder for now.')
    setTimeout(() => setToast(''), 1600)
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-lp-navy">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-slate-50 md:flex md:flex-col">
        <div className="px-6 py-8">
          <BrandLogo compact />
          <p className="mt-2 text-xs text-slate-500">Incubatee Stage 2</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = item === 'Presentations'
            return (
              <button
                key={item}
                type="button"
                className={`w-full rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? 'border-r-4 border-lp-gold bg-slate-200/70 text-lp-navy'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-lp-navy'
                }`}
              >
                {item}
              </button>
            )
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-xl bg-lp-navy p-4 text-white">
            <p className="text-xs font-bold">Felix Alpha</p>
            <p className="mt-1 text-[11px] text-slate-300">Founder and CEO</p>
          </div>
        </div>
      </aside>

      <main className="md:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-lp-navy">
              Presentations
            </h2>
            <span className="hidden text-sm text-slate-500 sm:inline">Stage 2: Growth</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/incubatee/dashboard"
              className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 hover:text-lp-navy"
            >
              Dashboard
            </Link>
            <Link
              to="/incubatee/profile"
              className="lp-focus rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 hover:text-lp-navy"
            >
              Profile
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-lp-navy lg:text-5xl">
                Project Launchpad
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage milestone submissions, review comments, and resubmission cycles for your incubation presentation workflow.
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
                onClick={() => setIsReworkRequested((current) => !current)}
                className={`lp-focus rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                  isReworkRequested
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-slate-600'
                }`}
              >
                {isReworkRequested ? 'Rework Mode' : 'Normal Mode'}
              </button>
            </div>
          </div>

          {viewState === 'error' ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-sm font-medium text-rose-700">
                Sync failed while loading submission status. Showing cached details.
              </p>
              <button
                type="button"
                onClick={() => setViewState('default')}
                className="lp-focus rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Retry
              </button>
            </div>
          ) : null}

          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => setActiveStage('stage1')}
              className={`lp-focus rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] ${
                activeStage === 'stage1'
                  ? 'bg-white text-lp-navy shadow-sm'
                  : 'text-slate-500 hover:text-lp-navy'
              }`}
            >
              Stage 1
            </button>
            <button
              type="button"
              onClick={() => setActiveStage('stage2')}
              className={`lp-focus rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] ${
                activeStage === 'stage2'
                  ? 'bg-white text-lp-navy shadow-sm'
                  : 'text-slate-500 hover:text-lp-navy'
              }`}
            >
              Stage 2
            </button>
            <span className="rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
              Stage 3 Locked
            </span>
          </div>

          {viewState === 'loading' ? (
            <LoadingPanel />
          ) : viewState === 'empty' ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h3 className="font-display text-2xl font-bold text-lp-navy">
                No submissions yet
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Start by uploading your first required file to create a draft submission for this stage.
              </p>
              <button
                type="button"
                onClick={() => setViewState('default')}
                className="lp-focus mt-6 rounded-xl bg-lp-navy px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white"
              >
                Start Submission
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-8 lg:col-span-7">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-bold text-lp-navy">
                        Submission Checklist
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">{stageData.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-lp-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-lp-navy">
                      {completedRequiredCount} of {stageData.requiredFiles.length} required
                    </span>
                  </div>

                  <div className="space-y-4">
                    {stageData.requiredFiles.map((item) => {
                      const selectedFile = stageUploads[item.id]

                      return (
                        <article
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-lp-navy">{item.name}</h4>
                              <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                              <p className="mt-1 text-[11px] text-slate-400">
                                Naming: {item.id}_version_date.ext
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                                selectedFile
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {selectedFile ? 'Complete' : 'Missing'}
                            </span>
                          </div>

                          {selectedFile ? (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                              <p className="text-xs font-semibold text-emerald-700">{selectedFile}</p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => uploadMockFile(item.id, item.name)}
                                  className="lp-focus rounded-lg border border-emerald-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeMockFile(item.id)}
                                  className="lp-focus rounded-lg border border-rose-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-rose-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                              <p className="text-sm font-semibold text-lp-navy">Drag and drop files here</p>
                              <p className="mt-1 text-xs text-slate-500">Allowed: PDF, PPTX, XLSX • Max size 20MB</p>
                              <button
                                type="button"
                                onClick={() => uploadMockFile(item.id, item.name)}
                                className="lp-focus mt-4 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700"
                              >
                                Select File
                              </button>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-500">Last updated: Mar 30, 2026 11:45 AM</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={saveDraft}
                        disabled={isSavingDraft}
                        className="lp-focus rounded-xl border border-lp-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-lp-navy disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSavingDraft ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        type="button"
                        onClick={submitForReview}
                        disabled={isSubmitting}
                        className="lp-focus rounded-xl bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit For Review'}
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-8 lg:col-span-5">
                <section className="relative overflow-hidden rounded-3xl bg-lp-navy p-6 text-white shadow-xl sm:p-8">
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-lp-gold/15 blur-2xl" />
                  <div className="relative z-10">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-lp-gold">
                        Status Report
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${statusBadgeClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <h4 className="font-display text-3xl font-bold">Attempt #{attemptNumber}</h4>
                    <p className="mt-1 text-sm text-slate-300">Submitted on Mar 30, 2026 • 02:45 PM</p>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">Due Date</p>
                        <p className="mt-1 font-medium text-white">Apr 04, 2026</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">Reviewer</p>
                        <p className="mt-1 font-medium text-white">Dr. Sarah Vance</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">Submitted By</p>
                        <p className="mt-1 font-medium text-white">Felix Alpha</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">Current Stage</p>
                        <p className="mt-1 font-medium text-white">{stageData.title}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-lp-navy">Faculty Review Feedback</h3>
                    <button
                      type="button"
                      onClick={() => setMobileFeedbackOpen((current) => !current)}
                      className="lp-focus rounded-lg border border-slate-300 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 md:hidden"
                    >
                      {mobileFeedbackOpen ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  <div className={`${mobileFeedbackOpen ? 'space-y-4' : 'hidden md:block md:space-y-4'}`}>
                    {currentFeedback.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                        <p className="text-sm font-semibold text-lp-navy">No feedback yet</p>
                        <p className="mt-1 text-xs text-slate-500">Faculty comments will appear here after submission.</p>
                      </div>
                    ) : (
                      currentFeedback.map((item) => (
                        <article
                          key={item.id}
                          className={`rounded-xl border p-4 ${
                            item.status === 'Rework'
                              ? 'border-rose-200 bg-rose-50'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-lp-navy">{item.reviewer}</p>
                            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                              {item.role}
                            </span>
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${statusChipClass(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm leading-6 text-slate-700">{item.comment}</p>
                          <p className="mt-2 text-[11px] text-slate-500">{item.date}</p>
                        </article>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-100 p-6 shadow-sm sm:p-8">
                  <h3 className="mb-5 font-display text-lg font-bold text-lp-navy">Submission History</h3>
                  {currentHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">No history entries available yet.</p>
                  ) : (
                    <div className="space-y-5">
                      {currentHistory.map((item, index) => (
                        <article key={item.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={`h-3 w-3 rounded-full ${
                                index === 0
                                  ? 'bg-rose-500'
                                  : index === 1
                                    ? 'bg-lp-navy'
                                    : 'bg-emerald-500'
                              }`}
                            />
                            {index < currentHistory.length - 1 ? (
                              <span className="mt-2 h-full w-px bg-slate-300" />
                            ) : null}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-lp-navy">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
                            <p className="mt-1 text-[11px] text-slate-500">{item.date}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={resetCurrentStage}
                      className="lp-focus rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600"
                    >
                      Reset Form
                    </button>
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="lp-focus rounded-lg bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-lp-navy"
                    >
                      Download Template
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-white/10 bg-lp-navy/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={isSavingDraft}
            className="lp-focus rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-70"
          >
            {isSavingDraft ? 'Saving' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={submitForReview}
            disabled={isSubmitting}
            className="lp-focus rounded-lg bg-lp-gold px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-lp-navy disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting' : 'Submit'}
          </button>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {mobileNavItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`lp-focus rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
              item === 'Present' ? 'text-lp-gold' : 'text-slate-500'
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

export default IncubateePresentationsPage