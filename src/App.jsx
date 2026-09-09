import Header from './components/Header'
import QRGenerator from './components/QRGenerator'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#generator"
        className="absolute left-4 top-4 z-50 -translate-y-20 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white opacity-0 shadow-lg transition focus:translate-y-0 focus:opacity-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      >
        Skip to content
      </a>

      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-6 pt-8 text-center sm:px-6 sm:pb-8 sm:pt-16">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Free QR Code Generator
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-muted sm:mt-4 sm:text-lg">
            Create and download QR codes instantly. Your data stays in your
            browser.
          </p>
        </section>

        <QRGenerator />
      </main>

      <Footer />
    </div>
  )
}
