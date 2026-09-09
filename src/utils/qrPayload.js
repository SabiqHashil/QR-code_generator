/**
 * Payload builders for QR types (Phase 2+).
 * Stub exports only — no persistence, no network.
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

/**
 * @param {string} _type
 * @param {Record<string, unknown>} _data
 * @returns {string}
 */
export function buildQrPayload(_type, _data) {
  return ''
}
