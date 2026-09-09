import { useCallback, useState } from 'react'
import QRTypeSelector from './QRTypeSelector'
import QRFormFields from './QRFormFields'
import QRPreview from './QRPreview'
import {
  getEmptyFormData,
  validateQrForm,
  buildQrPayload,
  getPayloadSummary,
} from '../utils/qrPayload'
import {
  QR_SIZE_OPTIONS,
  QR_ECC_OPTIONS,
  DEFAULT_QR_SIZE,
  DEFAULT_QR_ECC,
} from '../utils/qrRender'

const selectClass =
  'w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'

/**
 * QR generator workspace with preview UX controls (size, ECC, Generate New).
 * No persistence, upload, or downloads in this phase.
 */
export default function QRGenerator() {
  const [qrType, setQrType] = useState('website')
  const [formData, setFormData] = useState(() => getEmptyFormData('website'))
  const [errors, setErrors] = useState({})
  const [payload, setPayload] = useState(null)
  const [summary, setSummary] = useState(null)
  const [generateError, setGenerateError] = useState(null)
  const [qrSize, setQrSize] = useState(DEFAULT_QR_SIZE)
  const [errorCorrection, setErrorCorrection] = useState(DEFAULT_QR_ECC)

  const handleRenderError = useCallback((message) => {
    setGenerateError(message || 'Failed to generate QR code.')
    setPayload(null)
    setSummary(null)
  }, [])

  function clearPreview() {
    setPayload(null)
    setSummary(null)
    setGenerateError(null)
  }

  function handleTypeChange(nextType) {
    setQrType(nextType)
    setFormData(getEmptyFormData(nextType))
    setErrors({})
    clearPreview()
  }

  function handleFieldChange(nextValues) {
    setFormData(nextValues)
    if (Object.keys(errors).length > 0) {
      const { errors: nextErrors } = validateQrForm(qrType, nextValues)
      setErrors(nextErrors)
    }
    if (payload !== null || generateError) {
      clearPreview()
    }
  }

  function handleGenerate(event) {
    event.preventDefault()
    const { valid, errors: nextErrors } = validateQrForm(qrType, formData)
    setErrors(nextErrors)

    if (!valid) {
      clearPreview()
      return
    }

    try {
      const nextPayload = buildQrPayload(qrType, formData)
      if (!nextPayload) {
        setGenerateError('Could not build QR payload from the form data.')
        setPayload(null)
        setSummary(null)
        return
      }
      setGenerateError(null)
      setPayload(nextPayload)
      setSummary(getPayloadSummary(qrType, formData, nextPayload))
    } catch (err) {
      setPayload(null)
      setSummary(null)
      setGenerateError(
        err instanceof Error ? err.message : 'Failed to generate QR code.',
      )
    }
  }

  function handleReset() {
    setFormData(getEmptyFormData(qrType))
    setErrors({})
    clearPreview()
  }

  function handleGenerateNew() {
    clearPreview()
  }

  return (
    <section
      id="generator"
      className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6"
      aria-labelledby="generator-heading"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="generator-heading" className="sr-only">
          QR Generator Workspace
        </h2>
        <p className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink-muted shadow-sm">
          <span aria-hidden="true">🔒</span>
          Generated locally in your browser
        </p>
        <p className="max-w-md text-sm text-ink-muted sm:text-right">
          Your QR code is generated directly in your browser. We don&apos;t
          upload or store your data.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-sm shadow-slate-900/5">
        <div className="grid lg:grid-cols-2">
          <div className="border-b border-line p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Configuration
            </h3>

            <form onSubmit={handleGenerate} className="space-y-5" noValidate>
              <QRTypeSelector value={qrType} onChange={handleTypeChange} />

              <div>
                <p className="mb-3 text-sm font-medium text-ink">Input</p>
                <QRFormFields
                  type={qrType}
                  values={formData}
                  errors={errors}
                  onChange={handleFieldChange}
                />
              </div>

              <div className="space-y-4 rounded-xl border border-line bg-surface/60 p-4">
                <p className="text-sm font-medium text-ink">QR options</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="qr-size" className="block text-sm font-medium text-ink">
                      Size
                    </label>
                    <select
                      id="qr-size"
                      name="qr-size"
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                      className={selectClass}
                    >
                      {QR_SIZE_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="qr-ecc"
                      className="block text-sm font-medium text-ink"
                    >
                      Error correction
                    </label>
                    <select
                      id="qr-ecc"
                      name="qr-ecc"
                      value={errorCorrection}
                      onChange={(e) => setErrorCorrection(e.target.value)}
                      className={selectClass}
                    >
                      {QR_ECC_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:min-w-[10rem]"
                >
                  Generate QR
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-ink-muted transition hover:border-ink/20 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:min-w-[8rem]"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="bg-surface/40 p-5 sm:p-6">
            <QRPreview
              payload={payload}
              summary={summary}
              error={generateError}
              qrType={qrType}
              size={qrSize}
              errorCorrection={errorCorrection}
              onRenderError={handleRenderError}
              onGenerateNew={handleGenerateNew}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
