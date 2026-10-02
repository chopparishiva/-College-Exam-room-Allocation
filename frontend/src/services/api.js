// ExamOpt API client.
//
// The backend base URL is configurable through VITE_API_URL (frontend/.env).
// Every call throws a readable Error on failure so the UI can show
// "Backend unavailable" instead of pretending the request succeeded.

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    })
    if (!response.ok) {
      let detail = `Request failed (${response.status})`
      try {
        const body = await response.json()
        if (body?.errors?.length) detail = body.errors.join('; ')
        else if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
      } catch {
        /* keep the default message */
      }
      throw new Error(detail)
    }
    return response.json()
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Backend request timed out')
    if (error instanceof TypeError) throw new Error('Backend unavailable')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export const apiUrl = API_URL

export function getHealth() {
  return request('/api/health')
}

export function getDemoData(dataset = 'normal') {
  return request(`/api/demo-data?dataset=${encodeURIComponent(dataset)}`)
}

export function allocate(exams, rooms) {
  return request('/api/allocate', {
    method: 'POST',
    body: JSON.stringify({ exams, rooms }),
  })
}

export function validateExam(exam) {
  return request('/api/exams', { method: 'POST', body: JSON.stringify(exam) })
}

export function validateRoom(room) {
  return request('/api/rooms', { method: 'POST', body: JSON.stringify(room) })
}
