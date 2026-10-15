// Client for the FastAPI backend in app.py. Routes are unprefixed
// (/meta, /predict, ...) except /api/nearby-mandis, which is how the
// backend actually exposes them. VITE_API_URL is empty by default:
// production serves this bundle same-origin from static/dashboard/, and
// dev goes through the Vite proxy configured in vite.config.js.

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

// FastAPI returns `detail` as a string for raise HTTPException, but as a
// list of error objects for request-validation failures.
function detailToText(detail) {
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg ?? String(d)).join('; ')
  return null
}

function toQuery(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

async function request(path, { params, signal } = {}) {
  const response = await fetch(`${BASE}${path}${toQuery(params)}`, { signal })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(
      detailToText(body.detail) ?? `Request failed (${response.status})`,
      response.status,
      body,
    )
  }
  return body
}

export const api = {
  meta: (options) => request('/meta', options),
  predict: (crop, mandi, options) => request('/predict', { ...options, params: { crop, mandi } }),
  history: (crop, mandi, days = 45, options) =>
    request('/history', { ...options, params: { crop, mandi, days } }),
  trends: (crops, options) => request('/trends', { ...options, params: { crops } }),
  anomalies: (crop, mandi, zThreshold, options) =>
    request('/anomalies', { ...options, params: { crop, mandi, z_threshold: zThreshold } }),
  compare: (crop, mandis, options) =>
    request('/compare', { ...options, params: { crop, mandis: mandis.join(',') } }),
  compareAdvisory: (crop, mandis, language = 'en', options) =>
    request('/compare-advisory', { ...options, params: { crop, mandis: mandis.join(','), language } }),
  advisory: (crop, mandi, question, language = 'en', options) =>
    request('/advisory', { ...options, params: { crop, mandi, question, language } }),
  nearbyMandis: (lat, lon, limit = 22, crop, options) =>
    request('/api/nearby-mandis', { ...options, params: { lat, lon, limit, crop } }),
}
