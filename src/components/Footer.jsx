export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-panel/50">
      <div className="mx-auto max-w-5xl px-4 py-5 text-center sm:px-6 sm:py-6">
        <p className="text-sm text-ink-muted">
          © 2026{' '}
          <a
            href="https://sabiqhashil.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-ink-muted underline-offset-2 transition hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Sabiq Hashil
          </a>
        </p>
      </div>
    </footer>
  )
}
