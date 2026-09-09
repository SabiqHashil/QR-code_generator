/**
 * Phase 12 automated QA — payload validation, QR encoding, filenames, PDF smoke.
 * Run: npm run qa
 */
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'
import {
  validateQrForm,
  buildQrPayload,
} from '../src/utils/qrPayload.js'
import { getQrFilename } from '../src/utils/qrDownload.js'

let failures = 0

function assert(condition, message) {
  if (!condition) {
    failures += 1
    console.error(`FAIL: ${message}`)
  } else {
    console.log(`PASS: ${message}`)
  }
}

/** @type {Array<{ name: string, type: string, data: Record<string, unknown>, check: (payload: string) => boolean }>} */
const cases = [
  {
    name: 'website',
    type: 'website',
    data: { url: 'https://example.com' },
    check: (p) => p.startsWith('https://example.com'),
  },
  {
    name: 'maps',
    type: 'maps',
    data: { mapsUrl: 'https://maps.google.com/?q=Riyadh' },
    check: (p) => p === 'https://maps.google.com/?q=Riyadh',
  },
  {
    name: 'text-unicode',
    type: 'text',
    data: { text: 'Hello World\nمرحبا\nനമസ്കാരം\n😀' },
    check: (p) =>
      p.includes('Hello World') &&
      p.includes('مرحبا') &&
      p.includes('നമസ്കാരം') &&
      p.includes('😀'),
  },
  {
    name: 'email',
    type: 'email',
    data: {
      email: 'test@example.com',
      subject: 'Hello',
      message: 'Test body',
    },
    check: (p) =>
      p.startsWith('mailto:test@example.com?') &&
      p.includes('subject=Hello') &&
      p.includes('body=Test'),
  },
  {
    name: 'phone',
    type: 'phone',
    data: { phone: '+966 50 123 4567' },
    check: (p) => p === 'tel:+966501234567',
  },
  {
    name: 'sms',
    type: 'sms',
    data: { phone: '+966501234567', message: 'Hello' },
    check: (p) =>
      p.startsWith('sms:+966501234567') && p.includes('body=Hello'),
  },
  {
    name: 'wifi-wpa-special',
    type: 'wifi',
    data: {
      ssid: 'Cafe;Net',
      password: 'p@ss;1',
      security: 'WPA',
      hidden: true,
    },
    check: (p) =>
      p.startsWith('WIFI:T:WPA;S:Cafe\\;Net;P:p@ss\\;1;H:true;;'),
  },
  {
    name: 'wifi-wep',
    type: 'wifi',
    data: {
      ssid: 'OldNet',
      password: 'abc12',
      security: 'WEP',
      hidden: false,
    },
    check: (p) => p.includes('T:WEP') && p.includes('S:OldNet') && p.includes('P:abc12'),
  },
  {
    name: 'wifi-open',
    type: 'wifi',
    data: {
      ssid: 'OpenNet',
      password: '',
      security: 'nopass',
      hidden: false,
    },
    check: (p) => p === 'WIFI:T:nopass;S:OpenNet;H:false;;',
  },
  {
    name: 'vcard',
    type: 'vcard',
    data: {
      firstName: 'Sabiq',
      lastName: 'Hashil',
      organization: 'Dev',
      phone: '+966501234567',
      email: 'test@example.com',
      website: 'https://example.com',
      address: 'Riyadh',
    },
    check: (p) =>
      p.includes('BEGIN:VCARD') &&
      p.includes('END:VCARD') &&
      p.includes('FN:Sabiq Hashil') &&
      p.includes('TEL:+966501234567') &&
      p.includes('EMAIL:test@example.com') &&
      p.includes('ORG:Dev') &&
      p.includes('ADR:;;Riyadh;;;;'),
  },
]

async function runPayloadCases() {
  console.log('\n--- Payload + encode ---')
  for (const testCase of cases) {
    const { valid, errors } = validateQrForm(testCase.type, testCase.data)
    assert(valid, `${testCase.name} validates (${JSON.stringify(errors)})`)
    if (!valid) continue

    const payload = buildQrPayload(testCase.type, testCase.data)
    assert(
      Boolean(payload) && testCase.check(payload),
      `${testCase.name} payload shape: ${JSON.stringify(payload).slice(0, 120)}`,
    )

    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 280,
      })
      assert(
        dataUrl.startsWith('data:image/png;base64,') && dataUrl.length > 100,
        `${testCase.name} encodes to PNG data URL`,
      )
    } catch (err) {
      assert(false, `${testCase.name} encode error: ${err.message}`)
    }
  }
}

function runFilenameCases() {
  console.log('\n--- Filenames ---')
  const expectations = [
    ['website', 'png', 'qr-code-website.png'],
    ['maps', 'pdf', 'qr-code-maps.pdf'],
    ['text', 'jpg', 'qr-code-text.jpg'],
    ['email', 'png', 'qr-code-email.png'],
    ['phone', 'png', 'qr-code-phone.png'],
    ['sms', 'png', 'qr-code-sms.png'],
    ['wifi', 'png', 'qr-code-wifi.png'],
    ['vcard', 'jpg', 'qr-code-contact.jpg'],
    ['vcard', 'pdf', 'qr-code-contact.pdf'],
  ]
  for (const [type, ext, expected] of expectations) {
    const actual = getQrFilename(type, ext)
    assert(actual === expected, `filename ${type}.${ext} → ${actual}`)
  }
}

async function runPdfSmoke() {
  console.log('\n--- PDF smoke ---')
  const dataUrl = await QRCode.toDataURL('https://example.com/', {
    errorCorrectionLevel: 'H',
    margin: 4,
    width: 280,
  })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  pdf.addImage(dataUrl, 'PNG', (pageWidth - 80) / 2, 40, 80, 80)
  pdf.text('QR Code Generator', pageWidth / 2, 140, { align: 'center' })
  pdf.text('Type: Website', pageWidth / 2, 150, { align: 'center' })
  const bytes = pdf.output('arraybuffer')
  assert(bytes.byteLength > 1000, `jsPDF output size ${bytes.byteLength}`)
}

async function main() {
  console.log('Phase 12 QA')
  await runPayloadCases()
  runFilenameCases()
  await runPdfSmoke()

  console.log(`\n${failures === 0 ? 'ALL PASSED' : `${failures} FAILED`}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
