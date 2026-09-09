import { useState } from 'react'
import QRTypeSelector from './QRTypeSelector'
import QRPreview from './QRPreview'

/**
 * Phase 1 workspace shell: layout, privacy note, placeholder controls.
 * Generate is a no-op until Phase 3.
 */
export default function QRGenerator() {
  const [qrType, setQrType] = useState('website')

  function handleGenerate(event) {
    event.preventDefault()
    // Phase 3: validate → build payload → render QR
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
          {/* Configuration */}
          <div className="border-b border-line p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Configuration
            </h3>

            <form onSubmit={handleGenerate} className="space-y-5">
              <QRTypeSelector value={qrType} onChange={setQrType} />

              <div className="space-y-2">
                <label
                  htmlFor="website-url"
                  className="block text-sm font-medium text-ink"
                >
                  Input
                </label>
                <input
                  id="website-url"
                  name="website-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com"
                  autoComplete="url"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <p className="text-xs text-ink-muted">
                  Website URL form — full type forms arrive in Phase 2.
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:min-w-[10rem]"
              >
                Generate QR
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-surface/40 p-5 sm:p-6">
            <QRPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
