import { renderQrToCanvas } from './qrRender.js'

/**
 * Client-side QR image/PDF download helpers.
 * Uses browser download only — no upload or persistence.
 */

/** Offscreen export size for sharp HD downloads with small B/W file size. */
export const DOWNLOAD_QR_SIZE = 1024

const JPG_QUALITY = 0.85

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
 * Render a fresh high-resolution QR onto an offscreen canvas.
 * @param {string} payload
 * @returns {Promise<HTMLCanvasElement>}
 */
async function renderDownloadCanvas(payload) {
  if (!payload) {
    throw new Error('QR payload is empty.')
  }

  const canvas = document.createElement('canvas')
  await renderQrToCanvas(canvas, payload, { width: DOWNLOAD_QR_SIZE })

  if (!canvas.width || !canvas.height) {
    throw new Error('QR canvas is empty.')
  }

  return canvas
}

/**
 * Export a high-resolution PNG or JPG from the QR payload and download locally.
 * @param {string} payload
 * @param {{ format: 'png' | 'jpg', filename: string }} options
 */
export async function downloadQrImage(payload, { format, filename }) {
  const canvas = await renderDownloadCanvas(payload)
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
    dataUrl = temp.toDataURL('image/jpeg', JPG_QUALITY)
  } else {
    throw new Error('Unsupported image format.')
  }

  triggerDownload(dataUrl, filename)
}

/**
 * Build a simple A4 PDF with a high-res QR image and metadata, then download locally.
 * @param {string} payload
 * @param {{ filename: string, typeLabel?: string, detail?: string }} options
 */
export async function downloadQrPdf(payload, { filename, typeLabel = '', detail = '' }) {
  const canvas = await renderDownloadCanvas(payload)
  const imageData = canvas.toDataURL('image/png')
  const { jsPDF } = await import('jspdf')
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
