import { useMemo, useState } from 'react'
import IncubateeShell from '../common/IncubateeShell'

const previewModes = ['default', 'loading', 'empty', 'error']

const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'openings', label: 'Openings' },
  { id: 'applicants', label: 'Applicants' },
  { id: 'interns', label: 'Interns' },
  { id: 'mentors', label: 'Mentors' },
]

const sortOptions = [
  { id: 'latest', label: 'Latest' },
  { id: 'mostApplicants', label: 'Most Applicants' },
  { id: 'endingSoon', label: 'Ending Soon' },
]

const pipelineStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Joined']

const initialOpenings = [
  {
    id: 'op-1',
    role: 'AI Product Intern',
    department: 'Product',
    duration: '16 weeks',
    durationWeeks: 16,
    stipend: 'INR 18,000 / month',
    status: 'Open',
    applicants: 34,
    createdAt: '2026-03-24',
  },
  {
    id: 'op-2',
    role: 'Embedded Systems Intern',
    department: 'Engineering',
    duration: '12 weeks',
    durationWeeks: 12,
    stipend: 'INR 22,000 / month',
    status: 'Open',
    applicants: 19,
    createdAt: '2026-03-19',
  },
  {
    id: 'op-3',
    role: 'Growth Research Intern',
    department: 'Growth',
    duration: '10 weeks',
    durationWeeks: 10,
    stipend: 'INR 15,000 / month',
    status: 'Draft',
    applicants: 0,
    createdAt: '2026-03-27',
  },
]

const initialInterns = [
  {
    id: 'in-1',
    name: 'Riya Nair',
    university: 'IIT Madras',
    mentor: 'Dr. Sarah Vance',
    startDate: 'Apr 02, 2026',
    endDate: 'Jul 22, 2026',
    progress: 62,
    status: 'On Track',
  },
  {
    id: 'in-2',
    name: 'Harsh Patel',
    university: 'BITS Pilani',
    mentor: 'Marcus Chen',
    startDate: 'Mar 17, 2026',
    endDate: 'Jun 15, 2026',
    progress: 43,
    status: 'Needs Attention',
  },
  {
    id: 'in-3',
    name: 'Ananya Das',
    university: 'NIT Trichy',
    mentor: 'Elaine Park',
    startDate: 'Jan 08, 2026',
    endDate: 'Apr 05, 2026',
    progress: 100,
    status: 'Completed',
  },
]

const initialPipeline = {
  Applied: [
    { id: 'ap-1', name: 'Krish Verma', role: 'AI Product Intern' },
    { id: 'ap-2', name: 'Farah Khan', role: 'Embedded Systems Intern' },
    { id: 'ap-3', name: 'Dinesh Iyer', role: 'Growth Research Intern' },
  ],
  Screening: [
    { id: 'sc-1', name: 'Noor Ali', role: 'AI Product Intern' },
    { id: 'sc-2', name: 'Arjun Das', role: 'Embedded Systems Intern' },
  ],
  Interview: [
    { id: 'iv-1', name: 'Priya Menon', role: 'AI Product Intern' },
    { id: 'iv-2', name: 'Ronit Sen', role: 'Growth Research Intern' },
  ],
  Offer: [{ id: 'of-1', name: 'Kabir Shah', role: 'Embedded Systems Intern' }],
  Joined: [{ id: 'jd-1', name: 'Meera Jain', role: 'AI Product Intern' }],
}

const initialMentorAssignments = [
  {
    id: 'ma-1',
    internName: 'Riya Nair',
    mentor: 'Dr. Sarah Vance',
    capacity: '4 / 6',
  },
  {
    id: 'ma-2',
    internName: 'Harsh Patel',
    mentor: 'Marcus Chen',
    capacity: '3 / 5',
  },
  {
    id: 'ma-3',
    internName: 'Ananya Das',
    mentor: 'Elaine Park',
    capacity: '2 / 4',
  },
]

const mentorPool = ['Dr. Sarah Vance', 'Marcus Chen', 'Elaine Park', 'Rohan Iyer']

const complianceChecklist = [
  { id: 'c1', label: 'Offer letter', complete: true },
  { id: 'c2', label: 'NDA', complete: true },
  { id: 'c3', label: 'Internship agreement', complete: true },
  { id: 'c4', label: 'Attendance policy acknowledgement', complete: false },
  { id: 'c5', label: 'Monthly report submitted', complete: false },
]

const alertMessages = [
  {
    id: 'a-1',
    tone: 'amber',
    text: '5 interview reviews are pending for this week.',
  },
  {
    id: 'a-2',
    tone: 'rose',
    text: '2 active interns are missing compliance documents.',
  },
]

const statusBadgeClass = {
  Open: 'bg-emerald-50 text-emerald-700',
  Closed: 'bg-slate-100 text-slate-600',
  Draft: 'bg-amber-50 text-amber-700',
}

const internStatusClass = {
  'On Track': 'bg-emerald-50 text-emerald-700',
  'Needs Attention': 'bg-rose-50 text-rose-700',
  Completed: 'bg-slate-100 text-slate-600',
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`kpi-loading-${index}`} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="mt-5 h-14 rounded-xl bg-slate-200" />
        <div className="mt-3 h-14 rounded-xl bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="mt-4 h-32 rounded-xl bg-slate-200" />
        </div>
        <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
          <div className="h-6 w-44 rounded bg-slate-200" />
          <div className="mt-4 h-32 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

function IncubateeInternsPage() {
  const [viewState, setViewState] = useState('default')
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [searchQuery, setSearchQuery] = useState('')

  const [openings, setOpenings] = useState(initialOpenings)
  const [interns, setInterns] = useState(initialInterns)
  const [pipeline, setPipeline] = useState(initialPipeline)
  const [mentorAssignments, setMentorAssignments] = useState(initialMentorAssignments)

  const [isCreateOpeningOpen, setIsCreateOpeningOpen] = useState(false)
  const [isReviewApplicantOpen, setIsReviewApplicantOpen] = useState(false)
  const [isAssignMentorOpen, setIsAssignMentorOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  const [newOpening, setNewOpening] = useState({
    role: '',
    department: '',
    duration: '',
    stipend: '',
  })
  const [selectedMentor, setSelectedMentor] = useState('')
  const [toast, setToast] = useState('')

  const openingsForView = viewState === 'empty' ? [] : openings
  const internsForView = viewState === 'empty' ? [] : interns

  const pipelineForView = useMemo(() => {
    if (viewState === 'empty') {
      return pipelineStages.reduce((acc, stage) => {
        acc[stage] = []
        return acc
      }, {})
    }

    return pipeline
  }, [pipeline, viewState])

  const filteredOpenings = useMemo(() => {
    const loweredSearch = searchQuery.trim().toLowerCase()

    let list = openingsForView.filter((item) => {
      const matchesText =
        item.role.toLowerCase().includes(loweredSearch) ||
        item.department.toLowerCase().includes(loweredSearch)

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'openings' && item.status !== 'Closed') ||
        (activeFilter === 'applicants' && item.applicants > 0)

      return matchesText && matchesFilter
    })

    if (sortBy === 'mostApplicants') {
      list = [...list].sort((a, b) => b.applicants - a.applicants)
    } else if (sortBy === 'endingSoon') {
      list = [...list].sort((a, b) => a.durationWeeks - b.durationWeeks)
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return list
  }, [activeFilter, openingsForView, searchQuery, sortBy])

  const totalOpenings = openingsForView.filter((item) => item.status !== 'Closed').length

  const applicationsThisMonth = useMemo(() => {
    return openingsForView.reduce((sum, opening) => sum + opening.applicants, 0)
  }, [openingsForView])

  const pendingReviews = useMemo(() => {
    return (pipelineForView.Screening?.length || 0) + (pipelineForView.Interview?.length || 0)
  }, [pipelineForView])

  const closeOpening = (openingId) => {
    setOpenings((current) =>
      current.map((item) => (item.id === openingId ? { ...item, status: 'Closed' } : item)),
    )

    setToast('Opening marked as closed.')
    setTimeout(() => setToast(''), 1700)
  }

  const openCandidateReview = (candidate, stage) => {
    setSelectedCandidate({ ...candidate, stage })
    setIsReviewApplicantOpen(true)
  }

  const approveCandidate = () => {
    if (!selectedCandidate) {
      return
    }

    const currentStageIndex = pipelineStages.findIndex((stage) => stage === selectedCandidate.stage)
    const nextStage = pipelineStages[currentStageIndex + 1]

    if (!nextStage) {
      setToast('Candidate is already in final stage.')
      setTimeout(() => setToast(''), 1600)
      return
    }

    setPipeline((current) => {
      const updated = { ...current }
      updated[selectedCandidate.stage] = current[selectedCandidate.stage].filter(
        (item) => item.id !== selectedCandidate.id,
      )
      updated[nextStage] = [...current[nextStage], { id: selectedCandidate.id, name: selectedCandidate.name, role: selectedCandidate.role }]
      return updated
    })

    if (nextStage === 'Joined') {
      setInterns((current) => [
        {
          id: `in-${Date.now()}`,
          name: selectedCandidate.name,
          university: 'University pending sync',
          mentor: 'Unassigned',
          startDate: 'TBD',
          endDate: 'TBD',
          progress: 0,
          status: 'On Track',
        },
        ...current,
      ])
    }

    setIsReviewApplicantOpen(false)
    setSelectedCandidate(null)
    setToast(`Candidate moved to ${nextStage}.`)
    setTimeout(() => setToast(''), 1800)
  }

  const rejectCandidate = () => {
    if (!selectedCandidate) {
      return
    }

    setPipeline((current) => {
      const updated = { ...current }
      updated[selectedCandidate.stage] = current[selectedCandidate.stage].filter(
        (item) => item.id !== selectedCandidate.id,
      )
      return updated
    })

    setIsReviewApplicantOpen(false)
    setSelectedCandidate(null)
    setToast('Candidate removed from pipeline.')
    setTimeout(() => setToast(''), 1800)
  }

  const submitNewOpening = () => {
    if (!newOpening.role || !newOpening.department || !newOpening.duration || !newOpening.stipend) {
      setToast('Fill all fields before creating opening.')
      setTimeout(() => setToast(''), 1600)
      return
    }

    const durationMatch = newOpening.duration.match(/\d+/)

    setOpenings((current) => [
      {
        id: `op-${Date.now()}`,
        role: newOpening.role,
        department: newOpening.department,
        duration: newOpening.duration,
        durationWeeks: durationMatch ? Number(durationMatch[0]) : 12,
        stipend: newOpening.stipend,
        status: 'Draft',
        applicants: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ])

    setNewOpening({ role: '', department: '', duration: '', stipend: '' })
    setIsCreateOpeningOpen(false)
    setToast('Opening created as draft.')
    setTimeout(() => setToast(''), 1800)
  }

  const openAssignMentorModal = (record) => {
    setSelectedAssignment(record)
    setSelectedMentor(record.mentor)
    setIsAssignMentorOpen(true)
  }

  const saveMentorAssignment = () => {
    if (!selectedAssignment || !selectedMentor) {
      return
    }

    setMentorAssignments((current) =>
      current.map((item) =>
        item.id === selectedAssignment.id ? { ...item, mentor: selectedMentor } : item,
      ),
    )

    setInterns((current) =>
      current.map((item) =>
        item.name === selectedAssignment.internName ? { ...item, mentor: selectedMentor } : item,
      ),
    )

    setIsAssignMentorOpen(false)
    setSelectedAssignment(null)
    setToast('Mentor assignment updated.')
    setTimeout(() => setToast(''), 1800)
  }

  return (
    <IncubateeShell
      activeKey="interns"
      title="Incubatee Interns"
      subtitle="Manage openings, applicants, mentor mapping, and intern performance"
      badge="Cycle: Summer 2026"
      headerAction={
        <button
          type="button"
          onClick={() => setIsCreateOpeningOpen(true)}
          className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Create Internship Opening
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

            <div className="flex flex-wrap items-center gap-2">
              {filterChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveFilter(chip.id)}
                  className={`lp-focus rounded-full px-3 py-1.5 text-xs font-semibold ${
                    activeFilter === chip.id
                      ? 'bg-lp-gold text-lp-navy'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search openings or applicants"
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400"
            />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="lp-focus h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 sm:w-56"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {viewState === 'error' ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Failed to load interns. Please retry after refreshing data from backend integration.
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Total Openings</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{totalOpenings}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Active Interns</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{internsForView.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Applications This Month</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{applicationsThisMonth}</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">Pending Reviews</p>
            <p className="mt-3 text-3xl font-black text-lp-navy">{pendingReviews}</p>
          </article>
        </section>

        {viewState === 'loading' ? (
          <LoadingState />
        ) : (
          <>
            {viewState !== 'empty' ? (
              <section className="space-y-2">
                {alertMessages.map((alert) => (
                  <article
                    key={alert.id}
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      alert.tone === 'rose'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {alert.text}
                  </article>
                ))}
              </section>
            ) : null}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Internship Openings</h2>
                <button
                  type="button"
                  onClick={() => setIsCreateOpeningOpen(true)}
                  className="lp-focus rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.09em] text-slate-600"
                >
                  Add Opening
                </button>
              </div>

              {viewState === 'empty' ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">No internship openings yet.</p>
                  <p className="mt-2 text-sm text-slate-500">Create your first opening to start receiving applications.</p>
                </div>
              ) : (
                <>
                  <div className="mt-4 hidden overflow-x-auto md:block">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead>
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                          <th className="pb-3 pr-3">Role</th>
                          <th className="pb-3 pr-3">Department</th>
                          <th className="pb-3 pr-3">Duration</th>
                          <th className="pb-3 pr-3">Stipend</th>
                          <th className="pb-3 pr-3">Status</th>
                          <th className="pb-3 pr-3">Applicants</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOpenings.map((opening) => (
                          <tr key={opening.id}>
                            <td className="py-4 pr-3 font-semibold text-lp-navy">{opening.role}</td>
                            <td className="py-4 pr-3 text-slate-600">{opening.department}</td>
                            <td className="py-4 pr-3 text-slate-600">{opening.duration}</td>
                            <td className="py-4 pr-3 text-slate-600">{opening.stipend}</td>
                            <td className="py-4 pr-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[opening.status]}`}>
                                {opening.status}
                              </span>
                            </td>
                            <td className="py-4 pr-3 font-semibold text-slate-700">{opening.applicants}</td>
                            <td className="py-4">
                              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                <button className="lp-focus rounded-md bg-slate-100 px-2 py-1" type="button">
                                  View
                                </button>
                                <button className="lp-focus rounded-md bg-slate-100 px-2 py-1" type="button">
                                  Edit
                                </button>
                                <button
                                  className="lp-focus rounded-md bg-rose-100 px-2 py-1 text-rose-700"
                                  type="button"
                                  onClick={() => closeOpening(opening.id)}
                                >
                                  Close
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 space-y-3 md:hidden">
                    {filteredOpenings.map((opening) => (
                      <article key={`mobile-${opening.id}`} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-lp-navy">{opening.role}</h3>
                            <p className="text-xs text-slate-500">{opening.department}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusBadgeClass[opening.status]}`}>
                            {opening.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{opening.duration} | {opening.stipend}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Applicants: {opening.applicants}
                        </p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Current Interns</h2>
                <div className="mt-4 space-y-3">
                  {internsForView.map((intern) => (
                    <div key={intern.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-lp-navy">{intern.name}</p>
                          <p className="text-xs text-slate-500">{intern.university}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${internStatusClass[intern.status]}`}>
                          {intern.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
                        <p>Mentor: {intern.mentor}</p>
                        <p>Timeline: {intern.startDate} - {intern.endDate}</p>
                      </div>

                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          <span>Progress</span>
                          <span>{intern.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-lp-gold to-[#f0cf76]"
                            style={{ width: `${intern.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Applicant Pipeline</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {pipelineStages.map((stage) => (
                    <div key={stage} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.09em] text-slate-500">{stage}</p>
                      <div className="mt-2 space-y-2">
                        {pipelineForView[stage].map((candidate) => (
                          <button
                            key={candidate.id}
                            type="button"
                            onClick={() => openCandidateReview(candidate, stage)}
                            className="lp-focus w-full rounded-lg border border-slate-200 bg-white p-2 text-left"
                          >
                            <p className="text-xs font-semibold text-lp-navy">{candidate.name}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">{candidate.role}</p>
                          </button>
                        ))}
                        {!pipelineForView[stage].length ? (
                          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-400">
                            No candidates
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7 xl:col-span-2">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Mentor Assignment</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                        <th className="pb-3 pr-3">Intern</th>
                        <th className="pb-3 pr-3">Mentor</th>
                        <th className="pb-3 pr-3">Capacity</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mentorAssignments.map((row) => (
                        <tr key={row.id}>
                          <td className="py-4 pr-3 font-semibold text-lp-navy">{row.internName}</td>
                          <td className="py-4 pr-3 text-slate-600">{row.mentor}</td>
                          <td className="py-4 pr-3 text-slate-600">{row.capacity}</td>
                          <td className="py-4">
                            <button
                              type="button"
                              onClick={() => openAssignMentorModal(row)}
                              className="lp-focus rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
                            >
                              Reassign Mentor
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-lp-navy">Compliance Checklist</h2>
                <div className="mt-4 space-y-2">
                  {complianceChecklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <p className="text-sm text-slate-600">{item.label}</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.complete
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.complete ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
      </div>

      {isCreateOpeningOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Create Internship Opening</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={newOpening.role}
                onChange={(event) => setNewOpening((current) => ({ ...current, role: event.target.value }))}
                placeholder="Role"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newOpening.department}
                onChange={(event) => setNewOpening((current) => ({ ...current, department: event.target.value }))}
                placeholder="Department"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newOpening.duration}
                onChange={(event) => setNewOpening((current) => ({ ...current, duration: event.target.value }))}
                placeholder="Duration (e.g. 12 weeks)"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <input
                value={newOpening.stipend}
                onChange={(event) => setNewOpening((current) => ({ ...current, stipend: event.target.value }))}
                placeholder="Stipend"
                className="lp-focus h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpeningOpen(false)}
                className="lp-focus rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitNewOpening}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
              >
                Save Opening
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isReviewApplicantOpen && selectedCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Review Applicant</h3>
            <p className="mt-2 text-sm text-slate-600">
              {selectedCandidate.name} - {selectedCandidate.role}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
              Current Stage: {selectedCandidate.stage}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={rejectCandidate}
                className="lp-focus rounded-lg bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={approveCandidate}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
              >
                Move Forward
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAssignMentorOpen && selectedAssignment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-lp-navy">Assign or Reassign Mentor</h3>
            <p className="mt-2 text-sm text-slate-600">Intern: {selectedAssignment.internName}</p>

            <select
              value={selectedMentor}
              onChange={(event) => setSelectedMentor(event.target.value)}
              className="lp-focus mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="">Select mentor</option>
              {mentorPool.map((mentor) => (
                <option key={mentor} value={mentor}>
                  {mentor}
                </option>
              ))}
            </select>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAssignMentorOpen(false)}
                className="lp-focus rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMentorAssignment}
                className="lp-focus rounded-lg bg-lp-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white"
              >
                Save Assignment
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

export default IncubateeInternsPage
