import { ALERT_DIRECTIONS, WHATSAPP_NUMBER } from '@/lib/constants'

// The backend creates alerts by parsing an inbound WhatsApp message
// (create_alert_from_message in app.py): it needs an "alert me" phrase, an
// extractable crop and mandi, an above/below keyword, and the target price
// as the first number in the text — hence the fixed word order here.
export function buildAlertMessage({ crop, mandi, direction, targetPrice }) {
  const phrase = { above: 'goes above', below: 'goes below', cross: 'crosses' }[direction] ?? 'crosses'
  return `Alert me when ${crop} at ${mandi} ${phrase} ${targetPrice}`
}

export function buildWhatsAppLink(message) {
  const text = encodeURIComponent(message)
  return WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${text}` : `https://wa.me/?text=${text}`
}

export function directionLabel(direction) {
  return ALERT_DIRECTIONS.find((option) => option.value === direction)?.label ?? 'reaches'
}

// Indian mobile numbers are 10 digits starting 6-9; the +91 prefix is added
// by the UI, so accept it typed either way and normalise.
export function normalisePhone(input) {
  const digits = input.replace(/[^0-9]/g, '')
  return digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits
}

export function isValidPhone(input) {
  return /^[6-9]\d{9}$/.test(normalisePhone(input))
}
