const { randomUUID } = require('node:crypto')
const express = require('express')
const {
  db,
  clone,
  createClaim,
  createIncubateeMeetingRequest,
  createNotification,
  getIncubateeFacultyDesk,
  getIncubateeBundle,
  queueSupportTicket,
  advanceSupportTicket,
  updatePresentationUpload,
  updateIncubateeProfile,
  updateSubmissionStatus,
} = require('../data/store')
const { dispatchRoleEmail } = require('../services/workflowService')

const router = express.Router()

router.get('/bundle', (req, res) => {
  res.json({
    ok: true,
    data: getIncubateeBundle(),
  })
})

router.get('/dashboard', (req, res) => {
  res.json({
    ok: true,
    data: getIncubateeBundle().dashboard,
  })
})

router.get('/profile', (req, res) => {
  res.json({
    ok: true,
    data: getIncubateeBundle().profile,
  })
})

router.patch('/profile', (req, res) => {
  const profile = updateIncubateeProfile(req.body || {})

  res.json({
    ok: true,
    data: profile,
    message: 'Profile updated successfully.',
  })
})

router.get('/projects', (req, res) => {
  res.json({
    ok: true,
    items: clone(db.projects),
  })
})

router.get('/submissions', (req, res) => {
  res.json({
    ok: true,
    items: clone(db.submissions),
  })
})

router.post('/submissions/:id/submit', async (req, res) => {
  const updatedSubmission = updateSubmissionStatus(req.params.id, 'Submitted')

  if (!updatedSubmission) {
    return res.status(404).json({
      ok: false,
      error: 'submission_not_found',
      message: 'Submission not found.',
    })
  }

  const reviewEntry = db.facultyReviews.find((item) => item.submissionId === req.params.id)

  if (reviewEntry) {
    reviewEntry.status = 'Pending'
    reviewEntry.submittedAt = new Date().toLocaleDateString('en-IN')
  } else {
    db.facultyReviews.unshift({
      id: `rv-${randomUUID().slice(0, 8)}`,
      submissionId: req.params.id,
      startup: updatedSubmission.startup,
      artifact: updatedSubmission.asset,
      stage: updatedSubmission.stage,
      submittedAt: new Date().toLocaleDateString('en-IN'),
      status: 'Pending',
      reviewer: 'Pending Assignment',
      comment: '',
    })
  }

  createNotification({
    title: 'Submission Received',
    message: `${updatedSubmission.asset} was submitted and queued for faculty review.`,
    source: 'incubatee',
    priority: 'medium',
    category: 'update',
    audienceRoles: ['faculty', 'admin'],
  })

  await dispatchRoleEmail({
    emailType: 'Submission Received',
    audienceRoles: ['faculty', 'admin'],
    subject: 'New Submission Received',
    message: `${updatedSubmission.asset} from ${updatedSubmission.startup} is now awaiting review.`,
  })

  return res.json({
    ok: true,
    item: updatedSubmission,
  })
})

router.get('/presentations', (req, res) => {
  res.json({
    ok: true,
    data: clone(db.presentations),
  })
})

router.patch('/presentations/upload', (req, res) => {
  const { stage, fileKey, fileName } = req.body || {}
  const presentations = updatePresentationUpload({ stage, fileKey, fileName })

  if (!presentations) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'stage and fileKey are required.',
    })
  }

  return res.json({
    ok: true,
    data: presentations,
  })
})

router.post('/presentations/submit', async (req, res) => {
  const activeStage = db.presentations.activeStage
  const uploads = db.presentations.uploads[activeStage] || {}
  const requiredFileKeys = Object.keys(uploads)
  const hasMissingUploads = requiredFileKeys.some((key) => !uploads[key])

  if (hasMissingUploads) {
    return res.status(400).json({
      ok: false,
      error: 'missing_assets',
      message: 'All required presentation files must be uploaded before submission.',
    })
  }

  db.presentations.status = 'Under Review'
  db.presentations.attemptNumber += 1

  createNotification({
    title: 'Presentation Submission Received',
    message: 'Stage presentation package submitted for review.',
    source: 'incubatee',
    priority: 'medium',
    category: 'update',
    audienceRoles: ['faculty', 'admin'],
  })

  await dispatchRoleEmail({
    emailType: 'Presentation Submission',
    audienceRoles: ['faculty', 'admin'],
    subject: 'New Presentation Submission',
    message: 'A presentation package is available for review in LaunchPad CICF.',
  })

  res.json({
    ok: true,
    data: clone(db.presentations),
  })
})

router.get('/faculty', (req, res) => {
  res.json({
    ok: true,
    data: getIncubateeFacultyDesk(),
  })
})

router.post('/faculty/requests', async (req, res) => {
  const { mentor, topic, date } = req.body || {}

  if (!mentor || !topic || !date) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'mentor, topic, and date are required.',
    })
  }

  const request = createIncubateeMeetingRequest({ mentor, topic, date })

  createNotification({
    title: 'Mentor Meeting Requested',
    message: `${mentor} received a new meeting request from incubatee workspace.`,
    source: 'incubatee',
    priority: 'medium',
    category: 'mention',
    audienceRoles: ['faculty', 'admin'],
  })

  await dispatchRoleEmail({
    emailType: 'Mentor Meeting Request',
    audienceRoles: ['faculty', 'admin'],
    subject: 'New Mentor Meeting Request',
    message: `${mentor} was requested for: ${topic}`,
  })

  return res.json({
    ok: true,
    item: request,
  })
})

router.get('/progress', (req, res) => {
  res.json({
    ok: true,
    data: clone(db.progress),
  })
})

router.post('/progress/submit', async (req, res) => {
  const quarter = req.body.quarter || 'Q4'
  const fileName = req.body.fileName || `${quarter}_Progress_Deck_v1.pptx`

  if (!db.progress.records[quarter]) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_quarter',
      message: 'Quarter should be one of Q1, Q2, Q3, Q4.',
    })
  }

  db.progress.records[quarter] = {
    ...db.progress.records[quarter],
    status: 'Submitted',
    submittedAt: new Date().toLocaleString('en-IN'),
    reviewer: 'Pending faculty assignment',
    fileName,
  }

  createNotification({
    title: `${quarter} Progress Submitted`,
    message: `Progress deck for ${quarter} was submitted for faculty review.`,
    source: 'incubatee',
    priority: 'medium',
    category: 'update',
    audienceRoles: ['faculty', 'admin'],
  })

  await dispatchRoleEmail({
    emailType: 'Quarterly Progress Submission',
    audienceRoles: ['faculty', 'admin'],
    subject: `${quarter} Progress Submission`,
    message: `A new ${quarter} progress submission is ready for review.`,
  })

  res.json({
    ok: true,
    data: clone(db.progress.records[quarter]),
  })
})

router.get('/interns', (req, res) => {
  res.json({
    ok: true,
    data: clone(db.internshipData),
  })
})

router.post('/interns/openings', (req, res) => {
  const { role, department, duration, stipend } = req.body || {}

  if (!role || !department || !duration || !stipend) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'role, department, duration, and stipend are required.',
    })
  }

  const durationMatch = String(duration).match(/\d+/)

  const record = {
    id: `op-${randomUUID().slice(0, 8)}`,
    role,
    department,
    duration,
    durationWeeks: durationMatch ? Number(durationMatch[0]) : 12,
    stipend,
    status: 'Draft',
    applicants: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  }

  db.internshipData.openings.unshift(record)

  return res.json({
    ok: true,
    item: clone(record),
  })
})

router.patch('/interns/openings/:id/close', (req, res) => {
  const opening = db.internshipData.openings.find((item) => item.id === req.params.id)

  if (!opening) {
    return res.status(404).json({
      ok: false,
      error: 'opening_not_found',
      message: 'Intern opening not found.',
    })
  }

  opening.status = 'Closed'

  return res.json({
    ok: true,
    item: clone(opening),
  })
})

router.get('/finance', (req, res) => {
  res.json({
    ok: true,
    claims: clone(db.claims),
    payoutSchedule: clone(db.payoutSchedule),
    budgetBands: clone(db.budgetBands),
  })
})

router.post('/finance/claims', async (req, res) => {
  const { category, amount, reference } = req.body || {}

  if (!category || !amount) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'category and amount are required.',
    })
  }

  const claim = createClaim({
    startup: db.incubateeProfile.startupName || 'Incubatee Startup',
    category,
    amount,
    reference,
  })

  createNotification({
    title: 'New Claim Raised',
    message: `${claim.category} claim ${claim.reference} requires finance review.`,
    source: 'incubatee',
    priority: 'medium',
    category: 'update',
    audienceRoles: ['admin'],
  })

  await dispatchRoleEmail({
    emailType: 'Claim Raised',
    audienceRoles: ['admin'],
    subject: 'New Claim Raised',
    message: `${claim.category} claim was raised by incubatee workflow.`,
  })

  res.json({
    ok: true,
    item: claim,
  })
})

router.get('/support', (req, res) => {
  res.json({
    ok: true,
    tickets: clone(db.supportTickets),
    knowledgeArticles: clone(db.supportKnowledge),
  })
})

router.post('/support/tickets', (req, res) => {
  const { title, category, priority } = req.body || {}

  if (!title || !category) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'title and category are required.',
    })
  }

  const ticket = queueSupportTicket({ title, category, priority })

  res.json({
    ok: true,
    item: ticket,
  })
})

router.patch('/support/tickets/:id/advance', (req, res) => {
  const ticket = advanceSupportTicket(req.params.id)

  if (!ticket) {
    return res.status(404).json({
      ok: false,
      error: 'ticket_not_found',
      message: 'Ticket not found.',
    })
  }

  res.json({
    ok: true,
    item: ticket,
  })
})

module.exports = router
