import QRCode from 'qrcode'

/** Preview size presets (canvas width in px). */
export const QR_SIZE_OPTIONS = [
  { id: 200, label: 'Small' },
  { id: 280, label: 'Medium' },
  { id: 360, label: 'Large' },
]

export const DEFAULT_QR_SIZE = 280

/** Fixed high error correction for reliable scanning. */
export const DEFAULT_QR_ECC = 'H'

/** Default client-side QR render options (scannable, high ECC). */
export const QR_RENDER_DEFAULTS = {
  errorCorrectionLevel: DEFAULT_QR_ECC,
  margin: 4,
  width: DEFAULT_QR_SIZE,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
}

/**
 * Draw a QR code onto a canvas element. Entirely client-side.
 * @param {HTMLCanvasElement} canvas
 * @param {string} payload
 * @param {Partial<typeof QR_RENDER_DEFAULTS>} [overrides]
 * @returns {Promise<void>}
 */
export async function renderQrToCanvas(canvas, payload, overrides = {}) {
  if (!canvas) {
    throw new Error('Canvas element is required.')
  }
  if (!payload) {
    throw new Error('QR payload is empty.')
  }

  await QRCode.toCanvas(canvas, payload, {
    ...QR_RENDER_DEFAULTS,
    ...overrides,
    errorCorrectionLevel: DEFAULT_QR_ECC,
    color: {
      ...QR_RENDER_DEFAULTS.color,
      ...(overrides.color ?? {}),
    },
  })
}
