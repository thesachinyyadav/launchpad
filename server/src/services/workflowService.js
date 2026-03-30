const {
  db,
  addDeliveryLog,
  createNotification,
  findUserByEmail,
  getSubmissionById,
  updateClaimStatus,
  updateFacultyReview,
  updateSubmissionStatus,
} = require('../data/store')
const { sendEmail } = require('./resendService')

function mapEmailResult(status) {
  if (status === 'sent') {
    return 'Delivered'
  }

  if (status === 'failed') {
    return 'Failed'
  }

  return 'Queued'
}

function htmlTemplate(title, message) {
  return `
    <div style="font-family:Arial,sans-serif;padding:16px;line-height:1.5;">
      <h2 style="margin:0 0 8px;">${title}</h2>
      <p style="margin:0 0 12px;">${message}</p>
      <p style="margin:0;color:#666;font-size:12px;">LaunchPad CICF notification service</p>
    </div>
  `
}

async function dispatchRoleEmail({ emailType, audienceRoles, subject, message }) {
  const distinctRoles = [...new Set(audienceRoles)]
  const records = []

  for (const role of distinctRoles) {
    const recipients = db.users.filter((user) => user.role === role).map((user) => user.email)

    if (!recipients.length) {
      continue
    }

    const response = await sendEmail({
      to: recipients,
      subject,
      text: message,
      html: htmlTemplate(subject, message),
    })

    const log = addDeliveryLog({
      emailType,
      audienceRole: role,
      recipients: recipients.length,
      result: mapEmailResult(response.status),
    })

    records.push(log)
  }

  return records
}

async function dispatchDirectEmail({ emailType, email, audienceRole, subject, message }) {
  const response = await sendEmail({
    to: [email],
    subject,
    text: message,
    html: htmlTemplate(subject, message),
  })

  return addDeliveryLog({
    emailType,
    audienceRole,
    recipients: 1,
    result: mapEmailResult(response.status),
  })
}

async function processReviewDecision({ reviewId, decision, comment, reviewerName }) {
  const decisionMap = {
    approve: 'Approved',
    rework: 'Rework Requested',
    pending: 'Pending',
  }

  const normalized = decisionMap[decision] || decisionMap.pending
  const review = updateFacultyReview(reviewId, normalized, comment || '')

  if (!review) {
    return null
  }

  const submissionStatus =
    normalized === 'Approved'
      ? 'Approved'
      : normalized === 'Rework Requested'
        ? 'Rework Requested'
        : 'Submitted'

  const submission = updateSubmissionStatus(review.submissionId, submissionStatus, comment || '')

  const title =
    normalized === 'Approved'
      ? 'Submission Approved'
      : normalized === 'Rework Requested'
        ? 'Submission Rework Requested'
        : 'Submission Review Updated'

  const message = `${review.artifact} for ${review.startup} is now ${normalized} by ${reviewerName}.`

  createNotification({
    title,
    message,
    source: 'faculty',
    priority: normalized === 'Rework Requested' ? 'high' : 'medium',
    category: 'update',
    audienceRoles: ['incubatee', 'admin'],
  })

  await dispatchRoleEmail({
    emailType: 'Review Decision Update',
    audienceRoles: ['incubatee', 'admin'],
    subject: title,
    message,
  })

  return {
    review,
    submission,
  }
}

async function processClaimDecision({ claimId, decision, actorName }) {
  const statusMap = {
    approve: 'Approved',
    reject: 'Rejected',
  }

  const status = statusMap[decision] || 'In Review'
  const claim = updateClaimStatus(claimId, status)

  if (!claim) {
    return null
  }

  const title = `Claim ${status}`
  const message = `${claim.category} (${claim.reference}) for ${claim.startup} is ${status.toLowerCase()} by ${actorName}.`

  createNotification({
    title,
    message,
    source: 'admin',
    priority: status === 'Rejected' ? 'high' : 'medium',
    category: 'update',
    audienceRoles: ['incubatee', 'faculty'],
  })

  await dispatchRoleEmail({
    emailType: 'Claim Decision Update',
    audienceRoles: ['incubatee', 'faculty'],
    subject: title,
    message,
  })

  return claim
}

async function processSystemCampaign({ template, audience, subject }) {
  const audienceMap = {
    Faculty: ['faculty'],
    Incubatees: ['incubatee'],
    Admin: ['admin'],
    All: ['admin', 'faculty', 'incubatee'],
  }

  const audienceRoles = audienceMap[audience] || audienceMap.All
  const message = `Campaign ${template} has been queued for ${audience}.`

  createNotification({
    title: 'Campaign Queued',
    message,
    source: 'system',
    priority: 'low',
    category: 'system',
    audienceRoles,
  })

  const logs = await dispatchRoleEmail({
    emailType: template,
    audienceRoles,
    subject,
    message,
  })

  return {
    audienceRoles,
    logs,
  }
}

async function processForgotPassword({ email, token }) {
  const user = findUserByEmail(email)

  if (!user) {
    return null
  }

  const subject = 'LaunchPad CICF Password Reset'
  const message = `Use token ${token} to complete password reset. Token expires in 30 minutes.`

  await dispatchDirectEmail({
    emailType: 'Password Reset',
    email: user.email,
    audienceRole: user.role,
    subject,
    message,
  })

  return {
    email: user.email,
    role: user.role,
  }
}

module.exports = {
  dispatchRoleEmail,
  dispatchDirectEmail,
  processReviewDecision,
  processClaimDecision,
  processSystemCampaign,
  processForgotPassword,
}
