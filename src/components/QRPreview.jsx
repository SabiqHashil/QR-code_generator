import { useEffect, useRef, useState } from 'react'
import { renderQrToCanvas, DEFAULT_QR_SIZE, DEFAULT_QR_ECC } from '../utils/qrRender'
import { downloadCanvasImage, downloadQrPdf, getQrFilename } from '../utils/qrDownload'
import DownloadMenu from './DownloadMenu'

/**
 * Polished client-side QR preview with metadata, downloads, and Generate New.
 */
export default function QRPreview({
  payload = null,
  summary = null,
  error = null,
  qrType = 'website',
  size = DEFAULT_QR_SIZE,
  errorCorrection = DEFAULT_QR_ECC,
  onRenderError,
  onGenerateNew,
}) {
  const canvasRef = useRef(null)
  const [isRendering, setIsRendering] = useState(false)
  const [hasImage, setHasImage] = useState(false)
  const [downloadError, setDownloadError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function draw() {
      const canvas = canvasRef.current
      setDownloadError(null)

      if (!payload || !canvas) {
        setHasImage(false)
        setIsRendering(false)
        if (canvas) {
          const ctx = canvas.getContext('2d')
          ctx?.clearRect(0, 0, canvas.width, canvas.height)
        }
        return
      }

      setIsRendering(true)
      try {
        await renderQrToCanvas(canvas, payload, {
          width: size,
          errorCorrectionLevel: errorCorrection,
        })
        if (!cancelled) {
          setHasImage(true)
          setIsRendering(false)
        }
      } catch (err) {
        if (!cancelled) {
          setHasImage(false)
          setIsRendering(false)
          onRenderError?.(
            err instanceof Error ? err.message : 'Failed to generate QR code.',
          )
        }
      }
    }

    draw()

    return () => {
      cancelled = true
    }
  }, [payload, size, errorCorrection, onRenderError])

  function handleDownload(format) {
    setDownloadError(null)
    try {
      const canvas = canvasRef.current
      const filename = getQrFilename(qrType, format)
      downloadCanvasImage(canvas, { format, filename })
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : 'Failed to download QR image.',
      )
    }
  }

  function handleDownloadPdf() {
    setDownloadError(null)
    try {
      const canvas = canvasRef.current
      const filename = getQrFilename(qrType, 'pdf')
      downloadQrPdf(canvas, {
        filename,
        typeLabel: summary?.typeLabel ?? '',
        detail: summary?.detail ?? '',
      })
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : 'Failed to download PDF.',
      )
    }
  }

  function handleDownloadSelect(format) {
    if (format === 'pdf') {
      handleDownloadPdf()
      return
    }
    handleDownload(format)
  }

  const showEmpty = !payload && !error
  const showQr = Boolean(payload) && hasImage && !error
  const downloadDisabled = isRendering || !showQr

  return (
    <div className="flex h-full min-h-[240px] flex-col">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Preview
      </h2>

      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/80 px-4 py-8 text-center sm:px-6">
        <canvas
          ref={canvasRef}
          className={`mx-auto h-auto max-w-full rounded-lg bg-white shadow-sm ${
            showQr ? 'block' : 'hidden'
          }`}
          aria-label={
            summary
              ? `QR code for ${summary.typeLabel}`
              : 'Generated QR code'
          }
        />

        {isRendering && (
          <p className="text-sm text-ink-muted" role="status">
            Generating QR code…
          </p>
        )}

        {error && (
          <p className="max-w-[18rem] text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {showEmpty && (
          <>
            <div
              className="mb-4 grid h-28 w-28 grid-cols-4 gap-1 opacity-30"
              aria-hidden="true"
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className={`rounded-sm bg-ink ${
                    [0, 1, 2, 4, 8, 10, 12, 13, 14].includes(i)
                      ? 'opacity-100'
                      : 'opacity-20'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-ink">QR Preview</p>
            <p className="mt-1 max-w-[16rem] text-xs text-ink-muted">
              Fill in the form and press Generate QR to create a local QR code.
            </p>
          </>
        )}

        {showQr && summary && (
          <div className="mt-5 w-full max-w-sm space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {summary.typeLabel}
              </p>
              {summary.detail ? (
                <p className="break-words text-sm text-ink-muted">
                  {summary.detail}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <DownloadMenu
                disabled={downloadDisabled}
                onSelect={handleDownloadSelect}
              />
              {onGenerateNew && (
                <button
                  type="button"
                  onClick={onGenerateNew}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-ink/20 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Generate New QR
                </button>
              )}
            </div>

            {downloadError && (
              <p className="text-xs text-red-600" role="alert">
                {downloadError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
