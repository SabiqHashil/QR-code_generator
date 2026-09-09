export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-panel/50">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center sm:px-6">
        <p className="text-sm text-ink-muted">
          © 2026{' '}
          <a
            href="https://sabiqhashil.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted underline-offset-2 transition hover:text-ink hover:underline"
          >
            Sabiq Hashil
          </a>
        </p>
      </div>
    </footer>
  )
}
