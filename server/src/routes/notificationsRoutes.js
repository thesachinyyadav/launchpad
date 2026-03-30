const express = require('express')
const {
  clearReadNotifications,
  dismissNotificationForRole,
  getDeliveryLog,
  getNotificationStats,
  getNotificationsForRole,
  markAllNotificationsRead,
  updateNotificationReadState,
} = require('../data/store')

const router = express.Router()

router.get('/', (req, res) => {
  const role = req.query.role || 'admin'
  const items = getNotificationsForRole(role)

  res.json({
    ok: true,
    role,
    channel: {
      mode: 'email_only',
      provider: 'resend',
    },
    stats: getNotificationStats(role),
    items,
  })
})

router.patch('/:id/read', (req, res) => {
  const role = req.body.role || req.query.role || 'admin'
  const read = Boolean(req.body.read)

  const item = updateNotificationReadState(role, req.params.id, read)

  if (!item) {
    return res.status(404).json({
      ok: false,
      error: 'notification_not_found',
      message: 'Notification not found.',
    })
  }

  return res.json({
    ok: true,
    item,
    stats: getNotificationStats(role),
  })
})

router.delete('/:id', (req, res) => {
  const role = req.body.role || req.query.role || 'admin'
  const removed = dismissNotificationForRole(role, req.params.id)

  if (!removed) {
    return res.status(404).json({
      ok: false,
      error: 'notification_not_found',
      message: 'Notification not found.',
    })
  }

  return res.json({
    ok: true,
    items: getNotificationsForRole(role),
    stats: getNotificationStats(role),
  })
})

router.post('/mark-all-read', (req, res) => {
  const role = req.body.role || req.query.role || 'admin'
  const items = markAllNotificationsRead(role)

  return res.json({
    ok: true,
    items,
    stats: getNotificationStats(role),
  })
})

router.post('/clear-read', (req, res) => {
  const role = req.body.role || req.query.role || 'admin'
  const items = clearReadNotifications(role)

  return res.json({
    ok: true,
    items,
    stats: getNotificationStats(role),
  })
})

router.get('/delivery-log', (req, res) => {
  res.json({
    ok: true,
    provider: 'resend',
    items: getDeliveryLog(),
  })
})

module.exports = router
