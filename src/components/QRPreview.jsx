import { useEffect, useRef, useState } from 'react'
import { renderQrToCanvas, DEFAULT_QR_SIZE } from '../utils/qrRender'
import { downloadQrImage, downloadQrPdf, getQrFilename } from '../utils/qrDownload'
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
  onRenderError,
  onGenerateNew,
}) {
  const canvasRef = useRef(null)
  const [isRendering, setIsRendering] = useState(false)
  const [hasImage, setHasImage] = useState(false)
  const [downloadError, setDownloadError] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

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
  }, [payload, size, onRenderError])

  async function handleDownloadSelect(format) {
    if (!payload || isDownloading) return

    setDownloadError(null)
    setIsDownloading(true)
    try {
      const filename = getQrFilename(qrType, format)
      if (format === 'pdf') {
        await downloadQrPdf(payload, {
          filename,
          typeLabel: summary?.typeLabel ?? '',
          detail: summary?.detail ?? '',
        })
      } else {
        await downloadQrImage(payload, { format, filename })
      }
    } catch (err) {
      setDownloadError(
        err instanceof Error
          ? err.message
          : format === 'pdf'
            ? 'Failed to download PDF.'
            : 'Failed to download QR image.',
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const showEmpty = !payload && !error && !isRendering
  const showQr = Boolean(payload) && hasImage && !error
  const downloadDisabled = isRendering || !showQr || isDownloading || !payload

  return (
    <div className="flex h-full min-h-[260px] flex-col">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Preview
      </h2>

      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-accent-soft/40 px-4 py-8 text-center sm:px-6">
        <div
          className={`w-full max-w-full overflow-hidden transition-opacity duration-300 ${
            showQr ? 'block opacity-100' : 'hidden opacity-0'
          }`}
        >
          <div
            className={`mx-auto inline-block max-w-full rounded-xl border border-line bg-white p-3 shadow-sm ${
              isRendering ? 'animate-pulse' : ''
            }`}
          >
            <canvas
              ref={canvasRef}
              className="mx-auto block h-auto max-w-full"
              aria-label={
                summary
                  ? `QR code for ${summary.typeLabel}`
                  : 'Generated QR code'
              }
            />
          </div>
        </div>

        {isRendering && !showQr && (
          <div className="flex flex-col items-center gap-3" role="status">
            <div
              className="h-28 w-28 animate-pulse rounded-xl border border-line bg-panel/80"
              aria-hidden="true"
            />
            <p className="text-sm text-ink-muted">Generating QR code…</p>
          </div>
        )}

        {error && (
          <p
            className="max-w-[18rem] rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center transition-opacity duration-300">
            <div
              className="mb-4 grid h-28 w-28 grid-cols-4 gap-1.5 rounded-xl border border-line/80 bg-panel/70 p-3 opacity-50"
              aria-hidden="true"
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className={`rounded-sm bg-ink ${
                    [0, 1, 2, 4, 8, 10, 12, 13, 14].includes(i)
                      ? 'opacity-80'
                      : 'opacity-20'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-ink">Your QR will appear here</p>
            <p className="mt-1.5 max-w-[17rem] text-xs leading-relaxed text-ink-muted">
              Fill in the form and press Generate QR. Everything stays in your
              browser.
            </p>
          </div>
        )}

        {showQr && summary && (
          <div className="relative z-10 mt-6 w-full max-w-sm space-y-5 overflow-visible transition-opacity duration-300">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                {summary.typeLabel}
              </p>
              {summary.detail ? (
                <p className="break-words text-sm leading-relaxed text-ink-muted">
                  {summary.detail}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 overflow-visible">
              <DownloadMenu
                disabled={downloadDisabled}
                onSelect={handleDownloadSelect}
              />
              {onGenerateNew && (
                <button
                  type="button"
                  onClick={onGenerateNew}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-line bg-transparent px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:border-ink/20 hover:bg-panel hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
