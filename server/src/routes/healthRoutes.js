const express = require('express')
const { db, getDeliveryLog } = require('../data/store')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'launchpad-cicf-backend',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

router.get('/workflow', (req, res) => {
  const submissionsByStatus = db.submissions.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  const claimsByStatus = db.claims.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  res.json({
    ok: true,
    summary: {
      users: db.users.length,
      notifications: db.notifications.length,
      submissionsByStatus,
      claimsByStatus,
      emailLogSize: getDeliveryLog().length,
    },
  })
})

module.exports = router
