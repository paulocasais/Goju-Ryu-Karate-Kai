import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContatoSection from '@/components/sections/ContatoSection'

export const metadata = { title: 'Contato' }

export default function ContatoPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative pt-40 pb-20 bg-dark-card border-b border-dark-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">Fale Conosco</p>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-white leading-tight mb-6">Contato</h1>
            <div className="w-16 h-0.5 bg-primary mb-6" />
            <p className="text-gray-400 max-w-xl text-lg">
              Tire suas dúvidas, agende uma aula experimental ou venha nos conhecer. Oss!
            </p>
          </div>
        </section>
        <ContatoSection />
      </main>
      <Footer />
    </>
  )
}
