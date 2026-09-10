const inrFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const inrPreciseFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function inr(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  if (Math.abs(value) > 0 && Math.abs(value) < 1) return inrPreciseFormatter.format(value)
  return inrFormatter.format(Math.round(value))
}

export function rupees(value) {
  return `₹${inr(value)}`
}

export function shortDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function longDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function signedPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const rounded = Math.abs(value) < 0.05 ? 0 : value
  return `${rounded > 0 ? '+' : rounded < 0 ? '−' : ''}${Math.abs(rounded).toFixed(1)}%`
}

// A move under 1% of the price (or under ₹1) reads as flat, matching the
// threshold the backend itself uses to call a forecast rising/falling.
export function movementOf(current, previous) {
  if (current == null || previous == null) return { direction: 'flat', delta: 0, pct: 0 }
  const delta = current - previous
  const pct = previous ? (delta / previous) * 100 : 0
  const threshold = Math.max(1, Math.abs(previous) * 0.01)
  const direction = delta > threshold ? 'up' : delta < -threshold ? 'down' : 'flat'
  return { direction, delta, pct }
}

export function directionOfTrend(trend) {
  if (trend === 'rising') return 'up'
  if (trend === 'falling') return 'down'
  return 'flat'
}

export function daysAgo(iso) {
  if (!iso) return null
  const then = new Date(`${iso}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today - then) / 86_400_000)
}

export function freshnessLabel(iso) {
  const days = daysAgo(iso)
  if (days === null) return ''
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}
