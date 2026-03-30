const express = require('express')
const {
  getSessionsByRole,
  getSettingsByRole,
  revokeSessionByRole,
  signOutOtherSessions,
  updateSettingsByRole,
} = require('../data/store')

const router = express.Router()

router.get('/', (req, res) => {
  const role = req.query.role || 'admin'

  return res.json({
    ok: true,
    role,
    channel: {
      mode: 'email_only',
      provider: 'resend',
    },
    settings: getSettingsByRole(role),
  })
})

router.patch('/', (req, res) => {
  const role = req.query.role || req.body.role || 'admin'
  const patch = req.body.settings || req.body || {}

  const settings = updateSettingsByRole(role, patch)

  if (!settings) {
    return res.status(404).json({
      ok: false,
      error: 'role_not_found',
      message: 'No settings profile found for this role.',
    })
  }

  return res.json({
    ok: true,
    role,
    settings,
    message: 'Settings saved successfully.',
  })
})

router.get('/sessions', (req, res) => {
  const role = req.query.role || 'admin'

  return res.json({
    ok: true,
    role,
    sessions: getSessionsByRole(role),
  })
})

router.delete('/sessions/:id', (req, res) => {
  const role = req.query.role || req.body.role || 'admin'

  return res.json({
    ok: true,
    role,
    sessions: revokeSessionByRole(role, req.params.id),
  })
})

router.post('/sessions/signout-others', (req, res) => {
  const role = req.body.role || req.query.role || 'admin'

  return res.json({
    ok: true,
    role,
    sessions: signOutOtherSessions(role),
  })
})

module.exports = router
