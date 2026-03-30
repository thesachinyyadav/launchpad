const express = require('express')
const {
  createAuthSession,
  createNotification,
  createResetToken,
  roleHomeRoute,
  updatePassword,
  validateAndConsumeResetToken,
  verifyUserCredentials,
} = require('../data/store')
const { processForgotPassword } = require('../services/workflowService')

const router = express.Router()

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'Email and password are required.',
    })
  }

  const user = verifyUserCredentials(email, password)
  if (!user) {
    return res.status(401).json({
      ok: false,
      error: 'invalid_credentials',
      message: 'Invalid credentials. Please check your email or password.',
    })
  }

  const token = createAuthSession(user.id)

  return res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    redirectTo: roleHomeRoute[user.role],
    notifications: {
      deliveryChannel: 'email',
      provider: 'resend',
    },
  })
})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {}

  if (!email || !String(email).includes('@')) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_email',
      message: 'Please provide a valid email address.',
    })
  }

  const token = createResetToken(String(email).trim().toLowerCase())
  const user = await processForgotPassword({ email, token })

  return res.json({
    ok: true,
    message:
      'If the address is registered, a password reset email has been sent through Resend.',
    channel: 'email',
    provider: 'resend',
    tokenPreview: process.env.NODE_ENV === 'production' ? undefined : token,
    recipientRole: user?.role || null,
  })
})

router.post('/reset-password', (req, res) => {
  const { email, newPassword, token, tokenMode = 'valid' } = req.body || {}

  if (!email || !newPassword) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_payload',
      message: 'Email and new password are required.',
    })
  }

  if (tokenMode === 'invalid') {
    return res.status(400).json({
      ok: false,
      error: 'invalid_token',
      message: 'Invalid reset token. Please request a new recovery link.',
    })
  }

  if (tokenMode === 'expired') {
    return res.status(400).json({
      ok: false,
      error: 'expired_token',
      message: 'Reset token expired. Please generate a fresh reset email.',
    })
  }

  if (token) {
    const tokenValidation = validateAndConsumeResetToken(email, token)
    if (!tokenValidation.ok) {
      return res.status(400).json({
        ok: false,
        error: tokenValidation.code,
        message:
          tokenValidation.code === 'expired_token'
            ? 'Reset token expired. Please generate a fresh reset email.'
            : 'Invalid reset token. Please request a new recovery link.',
      })
    }
  }

  const updated = updatePassword(email, newPassword)

  if (!updated) {
    return res.status(404).json({
      ok: false,
      error: 'user_not_found',
      message: 'No account found for this email.',
    })
  }

  createNotification({
    title: 'Password Updated',
    message: `Credentials updated successfully for ${email}.`,
    source: 'system',
    priority: 'low',
    category: 'system',
    audienceRoles: ['admin'],
  })

  return res.json({
    ok: true,
    message: 'Password updated successfully.',
  })
})

module.exports = router
