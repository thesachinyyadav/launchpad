const { randomUUID } = require('node:crypto')

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

const db = {
  users: [
    {
      id: 'u-admin-1',
      name: 'CICF Operations Admin',
      email: 'admin@launchpadcicf.in',
      role: 'admin',
      password: 'LaunchPad@123',
    },
    {
      id: 'u-faculty-1',
      name: 'Dr. Sarah Vance',
      email: 'faculty@launchpadcicf.in',
      role: 'faculty',
      password: 'LaunchPad@123',
    },
    {
      id: 'u-incubatee-1',
      name: 'Aanya Sen',
      email: 'incubatee@launchpadcicf.in',
      role: 'incubatee',
      password: 'LaunchPad@123',
    },
  ],

  authSessions: [],
  passwordResetTokens: new Map(),

  settingsByRole: {
    admin: {
      fullName: 'CICF Operations Admin',
      displayName: 'Admin Ops',
      email: 'admin@launchpadcicf.in',
      phone: '+91 90000 11111',
      organization: 'LaunchPad CICF',
      twoFactor: true,
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
      fullName: 'Dr. Sarah Vance',
      displayName: 'Dr. Vance',
      email: 'faculty@launchpadcicf.in',
      phone: '+91 90000 22222',
      organization: 'LaunchPad CICF Faculty',
      twoFactor: true,
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
      fullName: 'Aanya Sen',
      displayName: 'A. Sen',
      email: 'incubatee@launchpadcicf.in',
      phone: '+91 90000 33333',
      organization: 'NeuroGrid Labs',
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
    admin: [
      {
        id: 'as-1',
        device: 'Windows Workstation',
        location: 'Bangalore, India',
        lastActive: 'Just now',
        current: true,
      },
      {
        id: 'as-2',
        device: 'MacBook Air',
        location: 'Remote',
        lastActive: '1 hour ago',
        current: false,
      },
    ],
    faculty: [
      {
        id: 'fs-1',
        device: 'MacBook Pro 16"',
        location: 'Chennai, India',
        lastActive: 'Just now',
        current: true,
      },
      {
        id: 'fs-2',
        device: 'iPad Pro',
        location: 'Chennai, India',
        lastActive: 'Yesterday',
        current: false,
      },
    ],
    incubatee: [
      {
        id: 'is-1',
        device: 'MacBook Pro 14"',
        location: 'Bangalore, India',
        lastActive: 'Just now',
        current: true,
      },
      {
        id: 'is-2',
        device: 'iPhone 15',
        location: 'Bangalore, India',
        lastActive: '2 hours ago',
        current: false,
      },
    ],
  },

  notifications: [
    {
      id: 'n-1',
      title: 'Review Window Closing Soon',
      message: 'Two Stage-2 submissions must be finalized within 48 hours.',
      source: 'system',
      priority: 'high',
      category: 'system',
      createdAt: isoHoursAgo(2),
      audienceRoles: ['admin', 'faculty'],
      readByRole: { admin: false, faculty: false, incubatee: true },
      dismissedByRole: { admin: false, faculty: false, incubatee: false },
    },
    {
      id: 'n-2',
      title: 'Submission Rework Requested',
      message: 'Quarterly Progress PPT needs projection split updates.',
      source: 'faculty',
      priority: 'medium',
      category: 'update',
      createdAt: isoHoursAgo(5),
      audienceRoles: ['incubatee', 'admin'],
      readByRole: { admin: false, faculty: true, incubatee: false },
      dismissedByRole: { admin: false, faculty: false, incubatee: false },
    },
    {
      id: 'n-3',
      title: 'Claim Decision Posted',
      message: 'Prototype components claim has been approved by admin finance.',
      source: 'admin',
      priority: 'low',
      category: 'update',
      createdAt: isoHoursAgo(18),
      audienceRoles: ['incubatee', 'faculty'],
      readByRole: { admin: true, faculty: false, incubatee: false },
      dismissedByRole: { admin: false, faculty: false, incubatee: false },
    },
    {
      id: 'n-4',
      title: 'System Maintenance Schedule',
      message: 'Platform maintenance scheduled Sunday 02:00 AM to 03:00 AM.',
      source: 'system',
      priority: 'low',
      category: 'system',
      createdAt: isoHoursAgo(42),
      audienceRoles: ['admin', 'faculty', 'incubatee'],
      readByRole: { admin: true, faculty: true, incubatee: true },
      dismissedByRole: { admin: false, faculty: false, incubatee: false },
    },
  ],

  emailLog: [
    {
      id: 'dl-1',
      emailType: 'Review Reminder',
      audienceRole: 'faculty',
      recipients: 18,
      provider: 'resend',
      result: 'Delivered',
      sentAt: new Date(isoHoursAgo(1)).toLocaleString('en-IN'),
    },
    {
      id: 'dl-2',
      emailType: 'Submission Received',
      audienceRole: 'admin',
      recipients: 4,
      provider: 'resend',
      result: 'Delivered',
      sentAt: new Date(isoHoursAgo(3)).toLocaleString('en-IN'),
    },
  ],

  incubateeProfile: {
    startupName: 'NeuroGrid Labs',
    cicfId: 'CICF-2024-118',
    founderName: 'Aanya Sen',
    founderEmail: 'incubatee@launchpadcicf.in',
    phone: '+91 90000 33333',
    domain: 'Predictive Diagnostics',
    headquarters: 'Bangalore, India',
    overview:
      'AI-driven diagnostics platform focused on early disease pattern detection for clinical partners.',
    teamMembers: [
      { id: 'tm-1', name: 'Aanya Sen', role: 'Founder and CEO', email: 'aanya@neurogrid.ai' },
      { id: 'tm-2', name: 'Rohit Nair', role: 'CTO', email: 'rohit@neurogrid.ai' },
      { id: 'tm-3', name: 'Zara Khan', role: 'Product Lead', email: 'zara@neurogrid.ai' },
    ],
  },

  incubateeDashboard: {
    stageLabel: 'Beta Testing',
    stageProgressPercent: 75,
    stats: [
      { id: 'st-1', label: 'Pending Submissions', value: 3 },
      { id: 'st-2', label: 'Intern Requests', value: 8 },
      { id: 'st-3', label: 'Claims In Review', value: 2 },
      { id: 'st-4', label: 'Documents Available', value: 14 },
    ],
    quickActions: [
      'Submit Presentation',
      'Upload Progress PPT',
      'Request Interns',
      'Raise Claim',
      'View Documents',
    ],
  },

  projects: [
    {
      id: 'pj-1',
      name: 'Predictive Diagnostics Engine',
      owner: 'Felix Alpha Team',
      stage: 'Beta Testing',
      health: 'Healthy',
      budgetUsed: 72,
      progress: 68,
      nextMilestone: 'Clinical pilot batch-2',
    },
    {
      id: 'pj-2',
      name: 'Low-Power Device Firmware',
      owner: 'Embedded Pod',
      stage: 'Phase Alpha',
      health: 'Watch',
      budgetUsed: 54,
      progress: 49,
      nextMilestone: 'Integration test report',
    },
    {
      id: 'pj-3',
      name: 'B2B Market Expansion Program',
      owner: 'Growth Pod',
      stage: 'Market Ready',
      health: 'At Risk',
      budgetUsed: 85,
      progress: 58,
      nextMilestone: 'Channel partner onboarding',
    },
  ],

  submissions: [
    {
      id: 'sb-1',
      startup: 'NeuroGrid Labs',
      asset: 'Quarterly Progress PPT',
      stage: 'Stage 2',
      owner: 'Felix Alpha Team',
      dueDate: 'Apr 04, 2026',
      status: 'Rework Requested',
      attempt: 3,
      feedback: 'Add detailed revenue segment split in slides 14 and 15.',
    },
    {
      id: 'sb-2',
      startup: 'NeuroGrid Labs',
      asset: 'Financial Briefing',
      stage: 'Stage 2',
      owner: 'Finance Pod',
      dueDate: 'Apr 06, 2026',
      status: 'Submitted',
      attempt: 2,
      feedback: '',
    },
    {
      id: 'sb-3',
      startup: 'NeuroGrid Labs',
      asset: 'Internship Compliance Pack',
      stage: 'Operations',
      owner: 'Ops Pod',
      dueDate: 'Apr 09, 2026',
      status: 'Draft',
      attempt: 1,
      feedback: '',
    },
    {
      id: 'sb-4',
      startup: 'NeuroGrid Labs',
      asset: 'Milestone Evidence Log',
      stage: 'Stage 3',
      owner: 'Engineering Pod',
      dueDate: 'Apr 11, 2026',
      status: 'Approved',
      attempt: 2,
      feedback: 'Well structured evidence references.',
    },
  ],

  facultyReviews: [
    {
      id: 'rv-1',
      submissionId: 'sb-1',
      startup: 'NeuroGrid Labs',
      artifact: 'Quarterly Progress PPT',
      stage: 'Stage 2',
      submittedAt: 'Mar 29, 2026',
      status: 'Pending',
      reviewer: 'Dr. Sarah Vance',
      comment: '',
    },
    {
      id: 'rv-2',
      submissionId: 'sb-2',
      startup: 'AgriPulse',
      artifact: 'Financial Readiness Brief',
      stage: 'Stage 2',
      submittedAt: 'Mar 28, 2026',
      status: 'Pending',
      reviewer: 'Marcus Chen',
      comment: '',
    },
    {
      id: 'rv-3',
      submissionId: 'sb-3',
      startup: 'AstraFlow',
      artifact: 'Market Validation Deck',
      stage: 'Stage 3',
      submittedAt: 'Mar 26, 2026',
      status: 'Rework Requested',
      reviewer: 'Dr. Sarah Vance',
      comment: 'Need stronger validation evidence by segment.',
    },
  ],

  presentations: {
    activeStage: 'stage2',
    status: 'Rework Requested',
    attemptNumber: 2,
    uploads: {
      stage2: {
        boardDeck: null,
        rubricReadiness: 'Rubric_Readiness_v2.xlsx',
        financialBriefing: 'Financial_Briefing_Q2.xlsx',
      },
    },
  },

  progress: {
    activeQuarter: 'Q3',
    records: {
      Q1: {
        submissionId: '#ST-2024-Q1-02',
        status: 'Approved',
        submittedAt: 'Mar 08, 2026 10:15 AM',
        reviewer: 'Dr. Sarah Vance',
        fileName: 'Q1_Progress_StatureElite.pptx',
      },
      Q2: {
        submissionId: '#ST-2024-Q2-05',
        status: 'Approved',
        submittedAt: 'Jun 14, 2026 02:22 PM',
        reviewer: 'Dr. Sarah Vance',
        fileName: 'Q2_Progress_StatureElite.pptx',
      },
      Q3: {
        submissionId: '#ST-2024-Q3-08',
        status: 'Rework Requested',
        submittedAt: 'Aug 24, 2026 11:42 AM',
        reviewer: 'Dr. Sarah Vance',
        fileName: 'Q3_Progress_Report_StatureElite.pptx',
      },
      Q4: {
        submissionId: '#ST-2024-Q4-DRAFT',
        status: 'Draft',
        submittedAt: 'Not submitted',
        reviewer: 'Pending assignment',
        fileName: null,
      },
    },
  },

  internshipData: {
    openings: [
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
    ],
    interns: [
      {
        id: 'in-1',
        name: 'Riya Nair',
        university: 'IIT Madras',
        startup: 'NeuroGrid Labs',
        mentor: 'Dr. Sarah Vance',
        startDate: 'Apr 02, 2026',
        endDate: 'Jul 22, 2026',
        progress: 62,
        attendance: 92,
        score: 8.4,
        status: 'On Track',
      },
      {
        id: 'in-2',
        name: 'Harsh Patel',
        university: 'BITS Pilani',
        startup: 'AgriPulse',
        mentor: 'Marcus Chen',
        startDate: 'Mar 17, 2026',
        endDate: 'Jun 15, 2026',
        progress: 43,
        attendance: 78,
        score: 6.9,
        status: 'Needs Attention',
      },
      {
        id: 'in-3',
        name: 'Ananya Das',
        university: 'NIT Trichy',
        startup: 'AstraFlow',
        mentor: 'Elaine Park',
        startDate: 'Jan 08, 2026',
        endDate: 'Apr 05, 2026',
        progress: 100,
        attendance: 97,
        score: 9.1,
        status: 'Completed',
      },
    ],
    pipeline: {
      Applied: [
        { id: 'ap-1', name: 'Krish Verma', role: 'AI Product Intern' },
        { id: 'ap-2', name: 'Farah Khan', role: 'Embedded Systems Intern' },
      ],
      Screening: [{ id: 'sc-1', name: 'Noor Ali', role: 'AI Product Intern' }],
      Interview: [{ id: 'iv-1', name: 'Priya Menon', role: 'AI Product Intern' }],
      Offer: [{ id: 'of-1', name: 'Kabir Shah', role: 'Embedded Systems Intern' }],
      Joined: [{ id: 'jd-1', name: 'Meera Jain', role: 'AI Product Intern' }],
    },
    mentorAssignments: [
      { id: 'ma-1', internName: 'Riya Nair', mentor: 'Dr. Sarah Vance', capacity: '4 / 6' },
      { id: 'ma-2', internName: 'Harsh Patel', mentor: 'Marcus Chen', capacity: '3 / 5' },
      { id: 'ma-3', internName: 'Ananya Das', mentor: 'Elaine Park', capacity: '2 / 4' },
    ],
    complianceChecklist: [
      { id: 'c1', label: 'Offer letter', complete: true },
      { id: 'c2', label: 'NDA', complete: true },
      { id: 'c3', label: 'Internship agreement', complete: true },
      { id: 'c4', label: 'Attendance policy acknowledgement', complete: false },
      { id: 'c5', label: 'Monthly report submitted', complete: false },
    ],
  },

  claims: [
    {
      id: 'cl-1',
      startup: 'NeuroGrid Labs',
      category: 'Intern Reimbursement',
      amount: 'INR 28,400',
      submittedAt: 'Mar 25, 2026',
      status: 'In Review',
      reference: 'EXP-2840',
    },
    {
      id: 'cl-2',
      startup: 'NeuroGrid Labs',
      category: 'Prototype Components',
      amount: 'INR 1,12,000',
      submittedAt: 'Mar 20, 2026',
      status: 'Approved',
      reference: 'HW-1102',
    },
    {
      id: 'cl-3',
      startup: 'NeuroGrid Labs',
      category: 'Cloud Credits Adjustment',
      amount: 'INR 32,000',
      submittedAt: 'Mar 18, 2026',
      status: 'Settled',
      reference: 'CC-309',
    },
  ],

  payoutSchedule: [
    {
      id: 'ps-1',
      date: 'Apr 02, 2026',
      title: 'Intern stipend cycle - Week 1',
      amount: 'INR 54,000',
    },
    {
      id: 'ps-2',
      date: 'Apr 06, 2026',
      title: 'Prototype procurement disbursement',
      amount: 'INR 80,000',
    },
  ],

  budgetBands: [
    { id: 'bb-1', name: 'R&D Budget', used: 62 },
    { id: 'bb-2', name: 'Operations Budget', used: 49 },
    { id: 'bb-3', name: 'Marketing Budget', used: 71 },
  ],

  supportTickets: [
    {
      id: 'tk-1',
      title: 'Unable to upload large PPT file',
      category: 'Submissions',
      priority: 'High',
      stage: 'Open',
      updatedAt: 'Mar 30, 2026 10:18 AM',
    },
    {
      id: 'tk-2',
      title: 'Intern attendance export mismatch',
      category: 'Interns',
      priority: 'Medium',
      stage: 'In Progress',
      updatedAt: 'Mar 29, 2026 04:22 PM',
    },
    {
      id: 'tk-3',
      title: 'Claim settlement receipt not downloadable',
      category: 'Finance',
      priority: 'Low',
      stage: 'Resolved',
      updatedAt: 'Mar 27, 2026 12:01 PM',
    },
  ],

  supportKnowledge: [
    {
      id: 'ka-1',
      title: 'How to submit rework version for progress PPT',
      tag: 'Submissions',
    },
    {
      id: 'ka-2',
      title: 'Mentor reassignment workflow for active interns',
      tag: 'Interns',
    },
    {
      id: 'ka-3',
      title: 'Finance claim references and settlement timeline',
      tag: 'Finance',
    },
  ],

  mentorship: {
    mentees: [
      {
        id: 'm-1',
        startup: 'NeuroGrid Labs',
        founder: 'Aanya Sen',
        focus: 'Financial projection clarity',
        progress: 72,
        nextSession: 'Apr 02, 2026',
      },
      {
        id: 'm-2',
        startup: 'AgriPulse',
        founder: 'Rahul Menon',
        focus: 'Pilot conversion playbook',
        progress: 56,
        nextSession: 'Apr 03, 2026',
      },
      {
        id: 'm-3',
        startup: 'AstraFlow',
        founder: 'Ira Jain',
        focus: 'Go-to-market experiment quality',
        progress: 64,
        nextSession: 'Apr 06, 2026',
      },
    ],
    logs: [
      {
        id: 'sl-1',
        startup: 'NeuroGrid Labs',
        title: 'Projection assumptions walkthrough',
        date: 'Mar 29, 2026',
        action: 'Upload revised CAC model by Apr 01',
      },
      {
        id: 'sl-2',
        startup: 'AgriPulse',
        title: 'Pilot funnel diagnostics',
        date: 'Mar 27, 2026',
        action: 'Run two pricing tests with SME cohort',
      },
    ],
  },

  adminIncubatees: [
    {
      id: 'ai-1',
      startup: 'NeuroGrid Labs',
      founder: 'Aanya Sen',
      stage: 'Beta Testing',
      compliance: 'Good',
      status: 'Active',
    },
    {
      id: 'ai-2',
      startup: 'AgriPulse',
      founder: 'Rahul Menon',
      stage: 'Phase Alpha',
      compliance: 'Watch',
      status: 'Active',
    },
    {
      id: 'ai-3',
      startup: 'AstraFlow',
      founder: 'Ira Jain',
      stage: 'Market Ready',
      compliance: 'Good',
      status: 'Graduating',
    },
  ],

  facultyDirectory: [
    {
      id: 'af-1',
      name: 'Dr. Sarah Vance',
      role: 'Lead Mentor',
      specialization: 'Venture strategy',
      activeReviews: 5,
      capacity: 7,
    },
    {
      id: 'af-2',
      name: 'Marcus Chen',
      role: 'Venture Partner',
      specialization: 'Financial models',
      activeReviews: 4,
      capacity: 5,
    },
    {
      id: 'af-3',
      name: 'Elaine Park',
      role: 'Innovation Advisor',
      specialization: 'Pilot operations',
      activeReviews: 2,
      capacity: 6,
    },
  ],

  systemTemplates: [
    { id: 'tp-1', name: 'Review Reminder', audience: 'Faculty', status: 'Active' },
    { id: 'tp-2', name: 'Submission Received', audience: 'Incubatee', status: 'Active' },
    { id: 'tp-3', name: 'Claim Decision Update', audience: 'Incubatee', status: 'Draft' },
  ],
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
      sessions: [
        {
          id: 's-1',
          startup: 'NeuroGrid Labs',
          topic: 'Projection assumptions review',
          time: '11:00 AM - 11:45 AM',
        },
        {
          id: 's-2',
          startup: 'AgriPulse',
          topic: 'Pilot conversion strategy',
          time: '02:30 PM - 03:15 PM',
        },
      ],
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
    startup: payload.startup || 'NeuroGrid Labs',
    category: payload.category,
    amount: payload.amount,
    submittedAt: new Date().toLocaleDateString('en-IN'),
    status: 'In Review',
    reference: payload.reference || `REF-${randomUUID().slice(0, 5).toUpperCase()}`,
  }

  db.claims.unshift(record)
  return clone(record)
}

module.exports = {
  clone,
  roleHomeRoute,
  db,
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
}
