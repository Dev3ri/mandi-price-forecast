export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
]

// Punjab's rough geographic centre — used to pull the full mandi list (with
// districts) out of /api/nearby-mandis when the user hasn't shared location.
export const PUNJAB_CENTRE = { lat: 30.9, lon: 75.5 }

export const HISTORY_RANGES = [
  { days: 7, label: '7D' },
  { days: 30, label: '30D' },
  { days: 45, label: '45D' },
  { days: 90, label: '90D' },
]

export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/[^0-9]/g, '')

export const ALERT_DIRECTIONS = [
  { value: 'above', label: 'rises above' },
  { value: 'below', label: 'falls below' },
  { value: 'cross', label: 'reaches' },
]
