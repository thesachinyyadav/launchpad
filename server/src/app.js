require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { ensureDbHydrated, persistDbState } = require('./data/store')

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const healthRoutes = require('./routes/healthRoutes')
const authRoutes = require('./routes/authRoutes')
const notificationsRoutes = require('./routes/notificationsRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const incubateeRoutes = require('./routes/incubateeRoutes')
const facultyRoutes = require('./routes/facultyRoutes')
const adminRoutes = require('./routes/adminRoutes')

const app = express()

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)

app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

app.use(async (req, res, next) => {
  try {
    await ensureDbHydrated()
    next()
  } catch (error) {
    next(error)
  }
})

app.use((req, res, next) => {
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      persistDbState()
    })
  }

  next()
})

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'LaunchPad CICF Backend',
    docs: '/api/health',
    notificationChannel: 'email_only_resend',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/incubatee', incubateeRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
