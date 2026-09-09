/**
 * Phase 1 empty preview placeholder — no QR rendering yet.
 */
export default function QRPreview() {
  return (
    <div className="flex h-full min-h-[240px] flex-col">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Preview
      </h2>
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/80 px-6 py-10 text-center">
        <div
          className="mb-4 grid h-28 w-28 grid-cols-4 gap-1 opacity-30"
          aria-hidden="true"
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className={`rounded-sm bg-ink ${
                [0, 1, 2, 4, 8, 10, 12, 13, 14].includes(i) ? 'opacity-100' : 'opacity-20'
              }`}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-ink">QR Preview</p>
        <p className="mt-1 max-w-[16rem] text-xs text-ink-muted">
          Your generated QR code will appear here.
        </p>
      </div>
    </div>
  )
}
