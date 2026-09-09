/**
 * Client-side QR payload builders and validation.
 * No persistence, no network — runtime memory only.
 */

export const QR_TYPES = [
  { id: 'website', label: 'Website' },
  { id: 'maps', label: 'Google Maps' },
  { id: 'text', label: 'Plain Text' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'sms', label: 'SMS' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'vcard', label: 'Contact' },
]

export const WIFI_SECURITY = [
  { id: 'WPA', label: 'WPA/WPA2' },
  { id: 'WEP', label: 'WEP' },
  { id: 'nopass', label: 'None' },
]

/** @returns {Record<string, string | boolean>} */
export function getEmptyFormData(type) {
  switch (type) {
    case 'website':
      return { url: '' }
    case 'maps':
      return { mapsUrl: '' }
    case 'text':
      return { text: '' }
    case 'email':
      return { email: '', subject: '', message: '' }
    case 'phone':
      return { phone: '' }
    case 'sms':
      return { phone: '', message: '' }
    case 'wifi':
      return {
        ssid: '',
        password: '',
        security: 'WPA',
        hidden: false,
      }
    case 'vcard':
      return {
        firstName: '',
        lastName: '',
        organization: '',
        phone: '',
        email: '',
        website: '',
        address: '',
      }
    default:
      return {}
  }
}

/**
 * Escape special characters for Wi-Fi QR payload fields.
 * @param {string} value
 */
function escapeWifiValue(value) {
  return String(value).replace(/([\\;,:"])/g, '\\$1')
}

/**
 * @param {string} value
 * @returns {string | null} normalized URL or null if invalid
 */
export function normalizeWebsiteUrl(value) {
  const trimmed = String(value).trim()
  if (!trimmed) return null

  let candidate = trimmed
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
    candidate = `https://${candidate}`
  }

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Basic email check (Phase 2; polished messages in Phase 8).
 * @param {string} email
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

/**
 * Allow digits, spaces, +, -, (), and common separators.
 * @param {string} phone
 */
export function isValidPhone(phone) {
  const trimmed = String(phone).trim()
  if (!trimmed) return false
  if (!/^[+\d][\d\s().-]{2,}$/.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

/**
 * Normalize phone for tel:/sms: payloads (keep leading +).
 * @param {string} phone
 */
export function normalizePhone(phone) {
  const trimmed = String(phone).trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

/**
 * Validate form data for a QR type.
 * @param {string} type
 * @param {Record<string, unknown>} data
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateQrForm(type, data) {
  /** @type {Record<string, string>} */
  const errors = {}

  switch (type) {
    case 'website': {
      if (!String(data.url ?? '').trim()) {
        errors.url = 'Please enter a website URL.'
      } else if (!normalizeWebsiteUrl(String(data.url))) {
        errors.url = 'Please enter a valid website URL.'
      }
      break
    }
    case 'maps': {
      const mapsUrl = String(data.mapsUrl ?? '').trim()
      if (!mapsUrl) {
        errors.mapsUrl = 'Please enter a Google Maps link.'
      } else {
        try {
          const parsed = new URL(mapsUrl)
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            errors.mapsUrl = 'Please enter a valid Google Maps link.'
          }
        } catch {
          errors.mapsUrl = 'Please enter a valid Google Maps link.'
        }
      }
      break
    }
    case 'text': {
      if (!String(data.text ?? '').trim()) {
        errors.text = 'Please enter some text.'
      }
      break
    }
    case 'email': {
      const email = String(data.email ?? '').trim()
      if (!email) {
        errors.email = 'Please enter an email address.'
      } else if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address.'
      }
      break
    }
    case 'phone': {
      const phone = String(data.phone ?? '').trim()
      if (!phone) {
        errors.phone = 'Please enter a phone number.'
      } else if (!isValidPhone(phone)) {
        errors.phone = 'Please enter a valid phone number.'
      }
      break
    }
    case 'sms': {
      const phone = String(data.phone ?? '').trim()
      if (!phone) {
        errors.phone = 'Please enter a phone number.'
      } else if (!isValidPhone(phone)) {
        errors.phone = 'Please enter a valid phone number.'
      }
      break
    }
    case 'wifi': {
      if (!String(data.ssid ?? '').trim()) {
        errors.ssid = 'Network name is required.'
      }
      if (data.security !== 'nopass' && !String(data.password ?? '').length) {
        errors.password = 'Password is required for this security type.'
      }
      break
    }
    case 'vcard': {
      const first = String(data.firstName ?? '').trim()
      const last = String(data.lastName ?? '').trim()
      if (!first && !last) {
        const nameError = 'Please enter a first or last name.'
        errors.firstName = nameError
        errors.lastName = nameError
      }
      const email = String(data.email ?? '').trim()
      if (email && !isValidEmail(email)) {
        errors.email = 'Please enter a valid email address.'
      }
      const phone = String(data.phone ?? '').trim()
      if (phone && !isValidPhone(phone)) {
        errors.phone = 'Please enter a valid phone number.'
      }
      const website = String(data.website ?? '').trim()
      if (website && !normalizeWebsiteUrl(website)) {
        errors.website = 'Please enter a valid website URL.'
      }
      break
    }
    default:
      errors.type = 'Unknown QR type.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Map validation error keys to DOM input ids used in QRFormFields.
 * Order defines focus priority on failed submit.
 */
const FIELD_FOCUS_IDS = {
  website: { url: 'website-url' },
  maps: { mapsUrl: 'maps-url' },
  text: { text: 'plain-text' },
  email: { email: 'email-address' },
  phone: { phone: 'phone-number' },
  sms: { phone: 'sms-phone' },
  wifi: { ssid: 'wifi-ssid', password: 'wifi-password' },
  vcard: {
    firstName: 'vcard-first',
    lastName: 'vcard-last',
    phone: 'vcard-phone',
    email: 'vcard-email',
    website: 'vcard-website',
  },
}

/**
 * @param {string} type
 * @param {Record<string, string>} errors
 * @returns {string | null}
 */
export function getFirstInvalidFieldId(type, errors) {
  const map = FIELD_FOCUS_IDS[type]
  if (!map) return null
  for (const key of Object.keys(map)) {
    if (errors[key]) return map[key]
  }
  return null
}

/**
 * Build the QR string payload for a validated form.
 * @param {string} type
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
export function buildQrPayload(type, data) {
  switch (type) {
    case 'website': {
      return normalizeWebsiteUrl(String(data.url)) ?? ''
    }
    case 'maps': {
      return String(data.mapsUrl).trim()
    }
    case 'text': {
      return String(data.text)
    }
    case 'email': {
      const email = String(data.email).trim()
      const subject = String(data.subject ?? '').trim()
      const body = String(data.message ?? '').trim()
      const params = new URLSearchParams()
      if (subject) params.set('subject', subject)
      if (body) params.set('body', body)
      const query = params.toString()
      return query ? `mailto:${email}?${query}` : `mailto:${email}`
    }
    case 'phone': {
      return `tel:${normalizePhone(String(data.phone))}`
    }
    case 'sms': {
      const phone = normalizePhone(String(data.phone))
      const message = String(data.message ?? '')
      if (message) {
        return `sms:${phone}?body=${encodeURIComponent(message)}`
      }
      return `sms:${phone}`
    }
    case 'wifi': {
      const ssid = escapeWifiValue(String(data.ssid).trim())
      const security = data.security === 'nopass' ? 'nopass' : String(data.security)
      const password =
        security === 'nopass' ? '' : escapeWifiValue(String(data.password ?? ''))
      const hidden = data.hidden ? 'true' : 'false'
      let payload = `WIFI:T:${security};S:${ssid};`
      if (security !== 'nopass') {
        payload += `P:${password};`
      }
      payload += `H:${hidden};;`
      return payload
    }
    case 'vcard': {
      const firstName = String(data.firstName ?? '').trim()
      const lastName = String(data.lastName ?? '').trim()
      const organization = String(data.organization ?? '').trim()
      const phone = String(data.phone ?? '').trim()
      const email = String(data.email ?? '').trim()
      const websiteRaw = String(data.website ?? '').trim()
      const website = websiteRaw ? normalizeWebsiteUrl(websiteRaw) : ''
      const address = String(data.address ?? '').trim()
      const fullName = [firstName, lastName].filter(Boolean).join(' ')

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
        `FN:${escapeVCard(fullName)}`,
      ]
      if (organization) lines.push(`ORG:${escapeVCard(organization)}`)
      if (phone) lines.push(`TEL:${escapeVCard(normalizePhone(phone))}`)
      if (email) lines.push(`EMAIL:${escapeVCard(email)}`)
      if (website) lines.push(`URL:${escapeVCard(website)}`)
      if (address) lines.push(`ADR:;;${escapeVCard(address)};;;;`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
    default:
      return ''
  }
}

/**
 * @param {string} value
 */
function escapeVCard(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

/**
 * Human-readable summary for preview (no persistence).
 * @param {string} type
 * @param {Record<string, unknown>} data
 * @param {string} payload
 */
export function getPayloadSummary(type, data, payload) {
  const label = QR_TYPES.find((t) => t.id === type)?.label ?? type
  switch (type) {
    case 'website':
      return { typeLabel: label, detail: payload }
    case 'maps':
      return { typeLabel: label, detail: payload }
    case 'text': {
      const text = String(data.text ?? '')
      const preview = text.length > 120 ? `${text.slice(0, 120)}…` : text
      return { typeLabel: label, detail: preview }
    }
    case 'email':
      return { typeLabel: label, detail: String(data.email ?? '') }
    case 'phone':
      return { typeLabel: label, detail: normalizePhone(String(data.phone ?? '')) }
    case 'sms':
      return { typeLabel: label, detail: normalizePhone(String(data.phone ?? '')) }
    case 'wifi':
      return { typeLabel: label, detail: String(data.ssid ?? '') }
    case 'vcard': {
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ')
      return { typeLabel: label, detail: name || 'Contact' }
    }
    default:
      return { typeLabel: label, detail: '' }
  }
}
