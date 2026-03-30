const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`
  const headers = {
    'Content-Type': 'application/json',
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
  return localStorage.getItem('lp-active-role') || 'admin'
}

function setActiveRole(role) {
  localStorage.setItem('lp-active-role', role)
}

export { API_BASE, apiRequest, getActiveRole, setActiveRole }
