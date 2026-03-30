const express = require('express')
const {
  addMentorshipLog,
  clone,
  createNotification,
  db,
  getFacultyBundle,
  updateInternStatus,
} = require('../data/store')
const { dispatchRoleEmail, processReviewDecision } = require('../services/workflowService')

const router = express.Router()

router.get('/bundle', (req, res) => {
  res.json({
    ok: true,
    data: getFacultyBundle(),
  })
})

router.get('/dashboard', (req, res) => {
  const bundle = getFacultyBundle()

  res.json({
    ok: true,
    data: {
      reviewQueue: bundle.reviews,
      sessions: bundle.dashboard.sessions,
      stats: {
        reviewsDue: bundle.reviews.length,
        highPriority: bundle.reviews.filter((item) => item.status === 'Pending').length,
        mentorshipSessions: bundle.dashboard.sessions.length,
      },
    },
  })
})

router.get('/reviews', (req, res) => {
  res.json({
    ok: true,
    items: clone(db.facultyReviews),
  })
})

router.post('/reviews/:id/decision', async (req, res) => {
  const { decision, comment, reviewerName = 'Faculty Reviewer' } = req.body || {}

  if (!decision) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'decision is required.',
    })
  }

  const result = await processReviewDecision({
    reviewId: req.params.id,
    decision,
    comment,
    reviewerName,
  })

  if (!result) {
    return res.status(404).json({
      ok: false,
      error: 'review_not_found',
      message: 'Review entry not found.',
    })
  }

  return res.json({
    ok: true,
    data: result,
  })
})

router.get('/mentorship', (req, res) => {
  res.json({
    ok: true,
    data: clone(db.mentorship),
  })
})

router.post('/mentorship/log', (req, res) => {
  const { startup, title, action } = req.body || {}

  if (!startup || !title || !action) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'startup, title, and action are required.',
    })
  }

  const log = addMentorshipLog({ startup, title, action })

  res.json({
    ok: true,
    item: log,
  })
})

router.get('/interns', (req, res) => {
  res.json({
    ok: true,
    items: clone(db.internshipData.interns),
  })
})

router.patch('/interns/:id/status', async (req, res) => {
  const { status } = req.body || {}

  if (!status) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'status is required.',
    })
  }

  const intern = updateInternStatus(req.params.id, status)

  if (!intern) {
    return res.status(404).json({
      ok: false,
      error: 'intern_not_found',
      message: 'Intern record not found.',
    })
  }

  createNotification({
    title: 'Intern Status Updated',
    message: `${intern.name} status changed to ${status} by faculty.`,
    source: 'faculty',
    priority: status === 'Needs Attention' ? 'high' : 'low',
    category: 'update',
    audienceRoles: ['incubatee', 'admin'],
  })

  await dispatchRoleEmail({
    emailType: 'Intern Status Update',
    audienceRoles: ['incubatee', 'admin'],
    subject: 'Intern Status Updated',
    message: `${intern.name} status has been marked as ${status}.`,
  })

  return res.json({
    ok: true,
    item: intern,
  })
})

module.exports = router
