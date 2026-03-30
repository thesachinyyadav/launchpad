const { randomUUID } = require('node:crypto')
const {
  isSupabaseStateEnabled,
  loadAuthUsersFromSupabase,
  loadRuntimeState,
  saveRuntimeState,
} = require('./supabaseStateStore')

const roleHomeRoute = {
  admin: '/admin/dashboard',
  faculty: '/faculty/dashboard',
  incubatee: '/incubatee/dashboard',
}

const lifecycleStages = ['Post Prototype', 'Phase Alpha', 'Beta Testing', 'Market Ready']

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isoHoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function hoursSince(isoDate) {
  const delta = Date.now() - new Date(isoDate).getTime()
  return Math.max(0, delta / (1000 * 60 * 60))
}

function formatRelativeTime(isoDate) {
  const hours = hoursSince(isoDate)

  if (hours < 1) {
    const minutes = Math.max(1, Math.round(hours * 60))
    return `${minutes} mins ago`
  }

  if (hours < 24) {
    return `${Math.round(hours)} hours ago`
  }

  const days = Math.round(hours / 24)
  if (days <= 7) {
    return `${days} days ago`
  }

  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function normalizeRole(role) {
  if (role === 'admin' || role === 'faculty' || role === 'incubatee') {
    return role
  }

  return 'admin'
}

function safeStructuredClone(value) {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value))
}

function deepMerge(defaultValue, incomingValue) {
  if (defaultValue instanceof Map) {
    if (incomingValue instanceof Map) {
      return new Map(incomingValue)
    }

    if (Array.isArray(incomingValue)) {
      return new Map(incomingValue)
    }

    return new Map(defaultValue)
  }

  if (Array.isArray(defaultValue)) {
    return Array.isArray(incomingValue) ? incomingValue : safeStructuredClone(defaultValue)
  }

  if (defaultValue && typeof defaultValue === 'object') {
    const incomingObject =
      incomingValue && typeof incomingValue === 'object' && !Array.isArray(incomingValue)
        ? incomingValue
        : {}

    const merged = {}
    const keys = new Set([...Object.keys(defaultValue), ...Object.keys(incomingObject)])

    keys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(defaultValue, key)) {
        merged[key] = deepMerge(defaultValue[key], incomingObject[key])
      } else {
        merged[key] = safeStructuredClone(incomingObject[key])
      }
    })

    return merged
  }

  return incomingValue === undefined ? defaultValue : incomingValue
}

const db = {
  users: [
    {
      id: 'u-admin-1',
      name: 'Admin User',
      email: 'admin@launchpadcicf.in',
      role: 'admin',
      password: 'LaunchPad@123',
    },
    {
      id: 'u-faculty-1',
      name: 'Faculty User',
      email: 'faculty@launchpadcicf.in',
      role: 'faculty',
      password: 'LaunchPad@123',
    },
    {
      id: 'u-incubatee-1',
      name: 'Incubatee User',
      email: 'incubatee@launchpadcicf.in',
      role: 'incubatee',
      password: 'LaunchPad@123',
    },
  ],

  authSessions: [],
  passwordResetTokens: new Map(),

  settingsByRole: {
    admin: {
      fullName: 'Admin User',
      displayName: 'Admin',
      email: 'admin@launchpadcicf.in',
      phone: '',
      organization: 'LaunchPad CICF',
      twoFactor: false,
      notifyEmail: true,
      notifyInApp: false,
      notifyDeadline: true,
      notifyWeekly: true,
      quietStart: '22:00',
      quietEnd: '07:00',
      theme: 'light',
      fontSize: 'medium',
      reducedMotion: false,
      highContrast: false,
    },
    faculty: {
      fullName: 'Faculty User',
      displayName: 'Faculty',
      email: 'faculty@launchpadcicf.in',
      phone: '',
      organization: 'LaunchPad CICF Faculty',
      twoFactor: false,
      notifyEmail: true,
      notifyInApp: false,
      notifyDeadline: true,
      notifyWeekly: true,
      quietStart: '21:00',
      quietEnd: '06:00',
      theme: 'light',
      fontSize: 'medium',
      reducedMotion: false,
      highContrast: false,
    },
    incubatee: {
      fullName: 'Incubatee User',
      displayName: 'Incubatee',
      email: 'incubatee@launchpadcicf.in',
      phone: '',
      organization: '',
      twoFactor: false,
      notifyEmail: true,
      notifyInApp: false,
      notifyDeadline: true,
      notifyWeekly: false,
      quietStart: '22:00',
      quietEnd: '07:00',
      theme: 'light',
      fontSize: 'medium',
      reducedMotion: false,
      highContrast: false,
    },
  },

  sessionsByRole: {
    admin: [],
    faculty: [],
    incubatee: [],
  },

  notifications: [],

  emailLog: [],

  incubateeProfile: {
    startupName: '',
    cicfId: '',
    founderName: '',
    founderEmail: 'incubatee@launchpadcicf.in',
    phone: '',
    domain: '',
    headquarters: '',
    overview: '',
    teamMembers: [],
  },

  incubateeDashboard: {
    stageLabel: 'Not Started',
    stageProgressPercent: 0,
    stats: [],
    quickActions: [
      'Submit Presentation',
      'Upload Progress PPT',
      'Request Interns',
      'Raise Claim',
      'View Documents',
    ],
  },

  projects: [],

  submissions: [],

  facultyReviews: [],

  presentations: {
    activeStage: 'stage2',
    status: 'Draft',
    attemptNumber: 0,
    uploads: {
      stage2: {
        boardDeck: null,
        rubricReadiness: null,
        financialBriefing: null,
      },
    },
  },

  progress: {
    activeQuarter: 'Q1',
    records: {
      Q1: {
        submissionId: '#Q1-DRAFT',
        status: 'Draft',
        submittedAt: '',
        reviewer: '',
        fileName: null,
      },
      Q2: {
        submissionId: '#Q2-DRAFT',
        status: 'Draft',
        submittedAt: '',
        reviewer: '',
        fileName: null,
      },
      Q3: {
        submissionId: '#Q3-DRAFT',
        status: 'Draft',
        submittedAt: '',
        reviewer: '',
        fileName: null,
      },
      Q4: {
        submissionId: '#Q4-DRAFT',
        status: 'Draft',
        submittedAt: '',
        reviewer: '',
        fileName: null,
      },
    },
  },

  internshipData: {
    openings: [],
    interns: [],
    pipeline: {
      Applied: [],
      Screening: [],
      Interview: [],
      Offer: [],
      Joined: [],
    },
    mentorAssignments: [],
    complianceChecklist: [],
  },

  claims: [],

  payoutSchedule: [],

  budgetBands: [],

  supportTickets: [],

  supportKnowledge: [],

  mentorship: {
    mentees: [],
    logs: [],
  },

  adminIncubatees: [],

  facultyDirectory: [],

  facultySessions: [],

  incubateeMeetingRequests: [],

  incubateeFeedbackTimeline: [],

  systemTemplates: [],
}

const initialDbState = safeStructuredClone(db)
let hasHydratedDb = false
let hydratePromise = null
let persistPromise = Promise.resolve()

function serializeDbState() {
  const snapshot = safeStructuredClone(db)

  if (db.passwordResetTokens instanceof Map) {
    snapshot.passwordResetTokens = Array.from(db.passwordResetTokens.entries())
  }

  return snapshot
}

function normalizePersistedDbState(state) {
  const merged = deepMerge(initialDbState, state || {})

  if (!(merged.passwordResetTokens instanceof Map)) {
    if (Array.isArray(merged.passwordResetTokens)) {
      merged.passwordResetTokens = new Map(merged.passwordResetTokens)
    } else {
      merged.passwordResetTokens = new Map()
    }
  }

  return merged
}

function applyDbState(nextState) {
  Object.keys(db).forEach((key) => {
    delete db[key]
  })

  Object.assign(db, nextState)
}

async function ensureDbHydrated() {
  if (hasHydratedDb) {
    return
  }

  if (hydratePromise) {
    await hydratePromise
    return
  }

  hydratePromise = (async () => {
    if (!isSupabaseStateEnabled()) {
      hasHydratedDb = true
      return
    }

    try {
      const runtimeState = await loadRuntimeState(serializeDbState())
      const normalized = normalizePersistedDbState(runtimeState)
      applyDbState(normalized)

      const authUsers = await loadAuthUsersFromSupabase()
      if (authUsers.length) {
        db.users = authUsers.map((item) => ({
          id: item.id,
          name: item.full_name || item.email,
          email: item.email,
          role: item.role,
          password: item.password_hash,
        }))
      }
    } catch (error) {
      console.error('[store] Supabase runtime state load failed, using in-memory fallback:', error.message)
    } finally {
      hasHydratedDb = true
    }
  })()

  await hydratePromise
  hydratePromise = null
}

function persistDbState() {
  if (!isSupabaseStateEnabled()) {
    return Promise.resolve(false)
  }

  const snapshot = serializeDbState()

  persistPromise = persistPromise
    .then(() => saveRuntimeState(snapshot))
    .catch((error) => {
      console.error('[store] Supabase runtime state persist failed:', error.message)
      return false
    })

  return persistPromise
}

async function flushDbState() {
  await persistPromise
}

function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase()
  return db.users.find((item) => item.email.toLowerCase() === normalized) || null
}

function verifyUserCredentials(email, password) {
  const user = findUserByEmail(email)

  if (!user) {
    return null
  }

  if (user.password !== password) {
    return null
  }

  return clone(user)
}

function createAuthSession(userId) {
  const token = randomUUID()

  db.authSessions.push({
    token,
    userId,
    issuedAt: new Date().toISOString(),
  })

  return token
}

function createResetToken(email) {
  const token = randomUUID().slice(0, 8)

  db.passwordResetTokens.set(token, {
    email: email.toLowerCase(),
    expiresAt: Date.now() + 30 * 60 * 1000,
  })

  return token
}

function validateAndConsumeResetToken(email, token) {
  const tokenState = db.passwordResetTokens.get(token)

  if (!tokenState) {
    return { ok: false, code: 'invalid_token' }
  }

  if (tokenState.expiresAt < Date.now()) {
    db.passwordResetTokens.delete(token)
    return { ok: false, code: 'expired_token' }
  }

  if (tokenState.email !== String(email).trim().toLowerCase()) {
    return { ok: false, code: 'invalid_token' }
  }

  db.passwordResetTokens.delete(token)
  return { ok: true }
}

function updatePassword(email, password) {
  const user = findUserByEmail(email)

  if (!user) {
    return false
  }

  user.password = password
  return true
}

function addDeliveryLog({ emailType, audienceRole, recipients, result }) {
  const record = {
    id: `dl-${randomUUID().slice(0, 8)}`,
    emailType,
    audienceRole,
    recipients,
    provider: 'resend',
    result,
    sentAt: new Date().toLocaleString('en-IN'),
  }

  db.emailLog.unshift(record)
  return clone(record)
}

function getDeliveryLog() {
  return clone(db.emailLog)
}

function createNotification({
  title,
  message,
  source = 'system',
  priority = 'low',
  category = 'update',
  audienceRoles = ['admin', 'faculty', 'incubatee'],
}) {
  const record = {
    id: `n-${randomUUID().slice(0, 8)}`,
    title,
    message,
    source,
    priority,
    category,
    createdAt: new Date().toISOString(),
    audienceRoles,
    readByRole: {
      admin: false,
      faculty: false,
      incubatee: false,
    },
    dismissedByRole: {
      admin: false,
      faculty: false,
      incubatee: false,
    },
  }

  db.notifications.unshift(record)
  return clone(record)
}

function mapNotificationForRole(item, role) {
  return {
    id: item.id,
    title: item.title,
    message: item.message,
    source: item.source,
    priority: item.priority,
    category: item.category,
    read: Boolean(item.readByRole[role]),
    createdAt: item.createdAt,
    timeLabel: formatRelativeTime(item.createdAt),
    hoursAgo: Number(hoursSince(item.createdAt).toFixed(2)),
  }
}

function getNotificationsForRole(roleInput) {
  const role = normalizeRole(roleInput)

  return db.notifications
    .filter((item) => item.audienceRoles.includes(role))
    .filter((item) => !item.dismissedByRole[role])
    .map((item) => mapNotificationForRole(item, role))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

function updateNotificationReadState(roleInput, notificationId, read) {
  const role = normalizeRole(roleInput)
  const item = db.notifications.find((entry) => entry.id === notificationId)

  if (!item) {
    return null
  }

  item.readByRole[role] = Boolean(read)
  return mapNotificationForRole(item, role)
}

function dismissNotificationForRole(roleInput, notificationId) {
  const role = normalizeRole(roleInput)
  const item = db.notifications.find((entry) => entry.id === notificationId)

  if (!item) {
    return null
  }

  item.dismissedByRole[role] = true
  return true
}

function markAllNotificationsRead(roleInput) {
  const role = normalizeRole(roleInput)

  db.notifications.forEach((item) => {
    if (item.audienceRoles.includes(role) && !item.dismissedByRole[role]) {
      item.readByRole[role] = true
    }
  })

  return getNotificationsForRole(role)
}

function clearReadNotifications(roleInput) {
  const role = normalizeRole(roleInput)

  db.notifications.forEach((item) => {
    if (item.audienceRoles.includes(role) && item.readByRole[role]) {
      item.dismissedByRole[role] = true
    }
  })

  return getNotificationsForRole(role)
}

function getNotificationStats(roleInput) {
  const role = normalizeRole(roleInput)
  const items = getNotificationsForRole(role)

  return {
    total: items.length,
    unread: items.filter((item) => !item.read).length,
    highPriority: items.filter((item) => item.priority === 'high' && !item.read).length,
  }
}

function getSettingsByRole(roleInput) {
  const role = normalizeRole(roleInput)
  return clone(db.settingsByRole[role])
}

function updateSettingsByRole(roleInput, patch) {
  const role = normalizeRole(roleInput)
  const current = db.settingsByRole[role]

  if (!current) {
    return null
  }

  const allowedFields = [
    'fullName',
    'displayName',
    'phone',
    'organization',
    'twoFactor',
    'notifyEmail',
    'notifyDeadline',
    'notifyWeekly',
    'quietStart',
    'quietEnd',
    'theme',
    'fontSize',
    'reducedMotion',
    'highContrast',
  ]

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(patch, field)) {
      current[field] = patch[field]
    }
  })

  current.notifyInApp = false
  return clone(current)
}

function getSessionsByRole(roleInput) {
  const role = normalizeRole(roleInput)
  return clone(db.sessionsByRole[role])
}

function revokeSessionByRole(roleInput, sessionId) {
  const role = normalizeRole(roleInput)

  db.sessionsByRole[role] = db.sessionsByRole[role].filter((item) => item.id !== sessionId)
  return clone(db.sessionsByRole[role])
}

function signOutOtherSessions(roleInput) {
  const role = normalizeRole(roleInput)

  db.sessionsByRole[role] = db.sessionsByRole[role].filter((item) => item.current)
  return clone(db.sessionsByRole[role])
}

function getIncubateeBundle() {
  return {
    dashboard: clone(db.incubateeDashboard),
    profile: clone(db.incubateeProfile),
    projects: clone(db.projects),
    submissions: clone(db.submissions),
    presentations: clone(db.presentations),
    progress: clone(db.progress),
    interns: clone(db.internshipData),
    finance: {
      claims: clone(db.claims),
      payoutSchedule: clone(db.payoutSchedule),
      budgetBands: clone(db.budgetBands),
    },
    support: {
      tickets: clone(db.supportTickets),
      knowledgeArticles: clone(db.supportKnowledge),
    },
  }
}

function getIncubateeFacultyDesk() {
  const facultyMembers = db.facultyDirectory.map((item) => {
    const openSlots = Math.max(0, Number(item.capacity || 0) - Number(item.activeReviews || 0))

    return {
      id: item.id,
      name: item.name,
      role: item.role,
      expertise: item.specialization,
      availability: `Open Slots: ${openSlots}`,
    }
  })

  return {
    facultyMembers: clone(facultyMembers),
    meetingRequests: clone(db.incubateeMeetingRequests),
    feedbackTimeline: clone(db.incubateeFeedbackTimeline),
  }
}

function createIncubateeMeetingRequest(payload) {
  const record = {
    id: `mr-${randomUUID().slice(0, 8)}`,
    mentor: payload.mentor,
    topic: payload.topic,
    date: payload.date,
    status: 'Pending',
  }

  db.incubateeMeetingRequests.unshift(record)
  return clone(record)
}

function updateIncubateeProfile(patch) {
  const mutable = [
    'startupName',
    'founderName',
    'founderEmail',
    'phone',
    'domain',
    'headquarters',
    'overview',
    'teamMembers',
  ]

  mutable.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(patch, field)) {
      db.incubateeProfile[field] = patch[field]
    }
  })

  return clone(db.incubateeProfile)
}

function updateSubmissionStatus(submissionId, status, feedback = '') {
  const item = db.submissions.find((entry) => entry.id === submissionId)

  if (!item) {
    return null
  }

  item.status = status
  if (feedback) {
    item.feedback = feedback
  }

  if (status === 'Submitted') {
    item.attempt += 1
  }

  return clone(item)
}

function getSubmissionById(submissionId) {
  const item = db.submissions.find((entry) => entry.id === submissionId)
  return item ? clone(item) : null
}

function getFacultyBundle() {
  return {
    dashboard: {
      reviewQueue: clone(db.facultyReviews),
      sessions: clone(db.facultySessions),
    },
    reviews: clone(db.facultyReviews),
    mentorship: clone(db.mentorship),
    interns: clone(db.internshipData.interns),
  }
}

function updateFacultyReview(reviewId, status, comment = '') {
  const item = db.facultyReviews.find((entry) => entry.id === reviewId)

  if (!item) {
    return null
  }

  item.status = status
  if (comment) {
    item.comment = comment
  }

  return clone(item)
}

function addMentorshipLog(payload) {
  const record = {
    id: `sl-${randomUUID().slice(0, 8)}`,
    startup: payload.startup,
    title: payload.title,
    date: new Date().toLocaleDateString('en-IN'),
    action: payload.action,
  }

  db.mentorship.logs.unshift(record)
  return clone(record)
}

function updateInternStatus(internId, status) {
  const item = db.internshipData.interns.find((entry) => entry.id === internId)

  if (!item) {
    return null
  }

  item.status = status
  return clone(item)
}

function getAdminBundle() {
  return {
    dashboard: {
      activeIncubatees: db.adminIncubatees.length,
      facultyReviewers: db.facultyDirectory.length,
      openClaims: db.claims.filter((item) => item.status === 'In Review' || item.status === 'Pending').length,
      emailDeliveryRate: `${Math.round(getDeliverySuccessRate())}%`,
    },
    incubatees: clone(db.adminIncubatees),
    faculty: clone(db.facultyDirectory),
    claims: clone(db.claims),
    systemTemplates: clone(db.systemTemplates),
    emailLog: clone(db.emailLog),
  }
}

function getDeliverySuccessRate() {
  if (!db.emailLog.length) {
    return 0
  }

  const delivered = db.emailLog.filter((item) => item.result === 'Delivered').length
  return (delivered / db.emailLog.length) * 100
}

function progressIncubateeStage(incubateeId) {
  const item = db.adminIncubatees.find((entry) => entry.id === incubateeId)

  if (!item) {
    return null
  }

  const currentIndex = lifecycleStages.findIndex((stage) => stage === item.stage)
  const nextStage = lifecycleStages[Math.min(currentIndex + 1, lifecycleStages.length - 1)]
  item.stage = nextStage

  return clone(item)
}

function rebalanceFacultyLoad(facultyId) {
  const item = db.facultyDirectory.find((entry) => entry.id === facultyId)

  if (!item) {
    return null
  }

  item.activeReviews = Math.max(0, item.activeReviews - 1)
  return clone(item)
}

function updateClaimStatus(claimId, status) {
  const item = db.claims.find((entry) => entry.id === claimId)

  if (!item) {
    return null
  }

  item.status = status
  return clone(item)
}

function toggleTemplateStatus(templateId) {
  const item = db.systemTemplates.find((entry) => entry.id === templateId)

  if (!item) {
    return null
  }

  item.status = item.status === 'Active' ? 'Draft' : 'Active'
  return clone(item)
}

function queueSupportTicket(payload) {
  const record = {
    id: `tk-${randomUUID().slice(0, 8)}`,
    title: payload.title,
    category: payload.category,
    priority: payload.priority || 'Medium',
    stage: 'Open',
    updatedAt: new Date().toLocaleString('en-IN'),
  }

  db.supportTickets.unshift(record)
  return clone(record)
}

function advanceSupportTicket(ticketId) {
  const item = db.supportTickets.find((entry) => entry.id === ticketId)

  if (!item) {
    return null
  }

  if (item.stage === 'Open') {
    item.stage = 'In Progress'
  } else if (item.stage === 'In Progress') {
    item.stage = 'Resolved'
  }

  item.updatedAt = new Date().toLocaleString('en-IN')
  return clone(item)
}

function createClaim(payload) {
  const record = {
    id: `cl-${randomUUID().slice(0, 8)}`,
    startup: payload.startup || db.incubateeProfile.startupName || 'Incubatee Startup',
    category: payload.category,
    amount: payload.amount,
    submittedAt: new Date().toLocaleDateString('en-IN'),
    status: 'In Review',
    reference: payload.reference || `REF-${randomUUID().slice(0, 5).toUpperCase()}`,
  }

  db.claims.unshift(record)
  return clone(record)
}

function updatePresentationUpload({ stage, fileKey, fileName }) {
  if (!stage || !fileKey) {
    return null
  }

  if (!db.presentations.uploads[stage]) {
    db.presentations.uploads[stage] = {}
  }

  db.presentations.uploads[stage][fileKey] = fileName || null
  return clone(db.presentations)
}

module.exports = {
  clone,
  roleHomeRoute,
  db,
  ensureDbHydrated,
  persistDbState,
  flushDbState,
  findUserByEmail,
  verifyUserCredentials,
  createAuthSession,
  createResetToken,
  validateAndConsumeResetToken,
  updatePassword,
  addDeliveryLog,
  getDeliveryLog,
  createNotification,
  getNotificationsForRole,
  updateNotificationReadState,
  dismissNotificationForRole,
  markAllNotificationsRead,
  clearReadNotifications,
  getNotificationStats,
  getSettingsByRole,
  updateSettingsByRole,
  getSessionsByRole,
  revokeSessionByRole,
  signOutOtherSessions,
  getIncubateeBundle,
  getIncubateeFacultyDesk,
  createIncubateeMeetingRequest,
  updateIncubateeProfile,
  getSubmissionById,
  updateSubmissionStatus,
  getFacultyBundle,
  updateFacultyReview,
  addMentorshipLog,
  updateInternStatus,
  getAdminBundle,
  progressIncubateeStage,
  rebalanceFacultyLoad,
  updateClaimStatus,
  toggleTemplateStatus,
  queueSupportTicket,
  advanceSupportTicket,
  createClaim,
  updatePresentationUpload,
}
