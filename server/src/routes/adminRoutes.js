const express = require('express')
const {
  clone,
  createNotification,
  db,
  getAdminBundle,
  progressIncubateeStage,
  rebalanceFacultyLoad,
  toggleTemplateStatus,
} = require('../data/store')
const {
  dispatchRoleEmail,
  processClaimDecision,
  processSystemCampaign,
} = require('../services/workflowService')

const router = express.Router()

router.get('/bundle', (req, res) => {
  res.json({
    ok: true,
    data: getAdminBundle(),
  })
})

router.get('/dashboard', (req, res) => {
  res.json({
    ok: true,
    data: getAdminBundle().dashboard,
  })
})

router.get('/incubatees', (req, res) => {
  res.json({
    ok: true,
    items: clone(db.adminIncubatees),
  })
})

router.patch('/incubatees/:id/stage', async (req, res) => {
  const incubatee = progressIncubateeStage(req.params.id)

  if (!incubatee) {
    return res.status(404).json({
      ok: false,
      error: 'incubatee_not_found',
      message: 'Incubatee not found.',
    })
  }

  createNotification({
    title: 'Incubatee Stage Updated',
    message: `${incubatee.startup} moved to ${incubatee.stage}.`,
    source: 'admin',
    priority: 'medium',
    category: 'update',
    audienceRoles: ['faculty', 'incubatee'],
  })

  await dispatchRoleEmail({
    emailType: 'Incubatee Stage Update',
    audienceRoles: ['faculty', 'incubatee'],
    subject: 'Incubatee Stage Updated',
    message: `${incubatee.startup} is now in ${incubatee.stage}.`,
  })

  return res.json({
    ok: true,
    item: incubatee,
  })
})

router.get('/faculty', (req, res) => {
  res.json({
    ok: true,
    items: clone(db.facultyDirectory),
  })
})

router.post('/faculty/:id/rebalance', (req, res) => {
  const faculty = rebalanceFacultyLoad(req.params.id)

  if (!faculty) {
    return res.status(404).json({
      ok: false,
      error: 'faculty_not_found',
      message: 'Faculty member not found.',
    })
  }

  return res.json({
    ok: true,
    item: faculty,
  })
})

router.get('/finance/claims', (req, res) => {
  res.json({
    ok: true,
    items: clone(db.claims),
  })
})

router.post('/finance/claims/:id/decision', async (req, res) => {
  const { decision, actorName = 'Admin Finance' } = req.body || {}

  if (!decision) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'decision is required.',
    })
  }

  const claim = await processClaimDecision({
    claimId: req.params.id,
    decision,
    actorName,
  })

  if (!claim) {
    return res.status(404).json({
      ok: false,
      error: 'claim_not_found',
      message: 'Claim not found.',
    })
  }

  return res.json({
    ok: true,
    item: claim,
  })
})

router.get('/system', (req, res) => {
  res.json({
    ok: true,
    provider: 'resend',
    templates: clone(db.systemTemplates),
    deliveryLog: clone(db.emailLog),
  })
})

router.post('/system/templates/:id/toggle', (req, res) => {
  const template = toggleTemplateStatus(req.params.id)

  if (!template) {
    return res.status(404).json({
      ok: false,
      error: 'template_not_found',
      message: 'Template not found.',
    })
  }

  return res.json({
    ok: true,
    item: template,
  })
})

router.post('/system/campaign', async (req, res) => {
  const { template, audience, subject } = req.body || {}

  if (!template || !audience || !subject) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'template, audience, and subject are required.',
    })
  }

  const result = await processSystemCampaign({ template, audience, subject })

  createNotification({
    title: 'Email Campaign Queued',
    message: `${template} queued for ${audience} audience via Resend.`,
    source: 'admin',
    priority: 'low',
    category: 'system',
    audienceRoles: ['admin'],
  })

  return res.json({
    ok: true,
    data: result,
  })
})

module.exports = router
