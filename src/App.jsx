import Header from './components/Header'
import QRGenerator from './components/QRGenerator'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-10 pt-12 text-center sm:px-6 sm:pt-16">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            QR Code Generator
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
            Create QR codes instantly in your browser.
          </p>
        </section>

        <QRGenerator />
      </main>

      <Footer />
    </div>
  )
}
