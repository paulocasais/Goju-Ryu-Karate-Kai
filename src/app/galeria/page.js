import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Galeria' }

const categorias = ['Todos', 'Treinos', 'Eventos', 'Gasshukus', 'Graduações']

export default function GaleriaPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative pt-40 pb-20 bg-dark-card border-b border-dark-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">Memórias e Momentos</p>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-white leading-tight mb-6">Galeria</h1>
            <div className="w-16 h-0.5 bg-primary" />
          </div>
        </section>

        <section className="section-pad bg-dark">
          <div className="max-w-7xl mx-auto">
            {/* Filter */}
            <div className="flex flex-wrap gap-3 mb-12">
              {categorias.map((cat) => (
                <button key={cat}
                  className={`font-cinzel text-xs tracking-widest uppercase px-5 py-2 border transition-all duration-200 ${cat === 'Todos' ? 'bg-primary text-white border-primary' : 'border-dark-border text-gray-400 hover:border-primary hover:text-primary'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Placeholder grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-dark-card border border-dark-border flex items-center justify-center group hover:border-primary/40 transition-all duration-300 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <span className="font-cinzel text-gray-600 text-xs tracking-wider">Foto {i + 1}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-cinzel">Ver foto</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-600 text-sm mt-12 font-cinzel">
              As fotos serão adicionadas pelo administrador no painel de controle.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
