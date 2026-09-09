/**
 * Client-side QR image download helpers.
 * Uses browser download only — no upload or persistence.
 */

const TYPE_FILENAME_SLUG = {
  website: 'website',
  maps: 'maps',
  text: 'text',
  email: 'email',
  phone: 'phone',
  sms: 'sms',
  wifi: 'wifi',
  vcard: 'contact',
}

/**
 * @param {string} type
 * @param {'png' | 'jpg' | 'jpeg'} extension
 * @returns {string}
 */
export function getQrFilename(type, extension) {
  const slug = TYPE_FILENAME_SLUG[type] ?? 'qr'
  const ext = extension === 'jpeg' ? 'jpg' : extension
  return `qr-code-${slug}.${ext}`
}

/**
 * Trigger a browser file download from a data URL.
 * @param {string} dataUrl
 * @param {string} filename
 */
function triggerDownload(dataUrl, filename) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

/**
 * Export the current canvas pixels as PNG or JPG and download locally.
 * @param {HTMLCanvasElement} canvas
 * @param {{ format: 'png' | 'jpg', filename: string }} options
 */
export function downloadCanvasImage(canvas, { format, filename }) {
  if (!canvas || typeof canvas.toDataURL !== 'function') {
    throw new Error('QR canvas is not available.')
  }
  if (!canvas.width || !canvas.height) {
    throw new Error('QR canvas is empty.')
  }

  let dataUrl

  if (format === 'png') {
    dataUrl = canvas.toDataURL('image/png')
  } else if (format === 'jpg') {
    const temp = document.createElement('canvas')
    temp.width = canvas.width
    temp.height = canvas.height
    const ctx = temp.getContext('2d')
    if (!ctx) {
      throw new Error('Could not create JPG export canvas.')
    }
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, temp.width, temp.height)
    ctx.drawImage(canvas, 0, 0)
    dataUrl = temp.toDataURL('image/jpeg', 0.92)
  } else {
    throw new Error('Unsupported image format.')
  }

  triggerDownload(dataUrl, filename)
}
