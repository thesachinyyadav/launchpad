const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const SESSION_KEY = 'lp-session'

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function setStoredSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('lp-active-role')
}

function getAuthToken() {
  return getStoredSession()?.token || null
}

async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await response.json().catch(() => ({
    ok: false,
    message: 'Unable to parse server response.',
  }))

  if (!response.ok || payload.ok === false) {
    const error = new Error(payload.message || 'Request failed.')
    error.statusCode = response.status
    error.code = payload.error || 'request_failed'
    throw error
  }

  return payload
}

function getActiveRole() {
  const roleFromSession = getStoredSession()?.user?.role

  if (roleFromSession) {
    return roleFromSession
  }

  return localStorage.getItem('lp-active-role') || null
}

function setActiveRole(role) {
  if (!role) {
    return
  }

  const currentSession = getStoredSession()
  if (currentSession) {
    const updated = {
      ...currentSession,
      user: {
        ...(currentSession.user || {}),
        role,
      },
    }

    setStoredSession(updated)
  }

  localStorage.setItem('lp-active-role', role)
}

function saveAuthSession(authPayload) {
  if (!authPayload || !authPayload.token || !authPayload.user) {
    return
  }

  const session = {
    token: authPayload.token,
    user: authPayload.user,
    redirectTo: authPayload.redirectTo || null,
    loggedInAt: new Date().toISOString(),
  }

  setStoredSession(session)
  setActiveRole(authPayload.user.role)
}

function getAuthSession() {
  return getStoredSession()
}

function clearAuthSession() {
  clearStoredSession()
}

export {
  API_BASE,
  apiRequest,
  clearAuthSession,
  getActiveRole,
  getAuthSession,
  saveAuthSession,
  setActiveRole,
}
