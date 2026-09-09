export default function Header() {
  return (
    <header className="border-b border-line/80 bg-panel/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <a
          href="/"
          className="text-sm font-semibold tracking-tight text-ink transition hover:text-accent"
        >
          QR Code Generator
        </a>
        <span className="hidden text-xs font-medium text-ink-muted sm:inline">
          Private · Client-side
        </span>
      </div>
    </header>
  )
}
