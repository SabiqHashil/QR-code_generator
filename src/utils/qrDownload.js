import { jsPDF } from 'jspdf'

/**
 * Client-side QR image/PDF download helpers.
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
 * @param {'png' | 'jpg' | 'jpeg' | 'pdf'} extension
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
 * @param {HTMLCanvasElement} canvas
 */
function assertCanvas(canvas) {
  if (!canvas || typeof canvas.toDataURL !== 'function') {
    throw new Error('QR canvas is not available.')
  }
  if (!canvas.width || !canvas.height) {
    throw new Error('QR canvas is empty.')
  }
}

/**
 * Export the current canvas pixels as PNG or JPG and download locally.
 * @param {HTMLCanvasElement} canvas
 * @param {{ format: 'png' | 'jpg', filename: string }} options
 */
export function downloadCanvasImage(canvas, { format, filename }) {
  assertCanvas(canvas)

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

/**
 * Build a simple A4 PDF with the QR image and metadata, then download locally.
 * @param {HTMLCanvasElement} canvas
 * @param {{ filename: string, typeLabel?: string, detail?: string }} options
 */
export function downloadQrPdf(canvas, { filename, typeLabel = '', detail = '' }) {
  assertCanvas(canvas)

  const imageData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  const maxQrWidth = 100
  const aspect = canvas.height / canvas.width
  const qrWidth = Math.min(maxQrWidth, pageWidth - margin * 2)
  const qrHeight = qrWidth * aspect
  const qrX = (pageWidth - qrWidth) / 2
  let cursorY = 36

  pdf.addImage(imageData, 'PNG', qrX, cursorY, qrWidth, qrHeight)
  cursorY += qrHeight + 16

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.setTextColor(15, 23, 42)
  pdf.text('QR Code Generator', pageWidth / 2, cursorY, { align: 'center' })
  cursorY += 10

  if (typeLabel) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    pdf.setTextColor(71, 85, 105)
    pdf.text(`Type: ${typeLabel}`, pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 8
  }

  if (detail) {
    const truncated =
      detail.length > 180 ? `${detail.slice(0, 177)}…` : detail
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(71, 85, 105)
    const lines = pdf.splitTextToSize(truncated, pageWidth - margin * 2)
    pdf.text(lines, pageWidth / 2, cursorY, { align: 'center' })
  }

  pdf.save(filename)
}
