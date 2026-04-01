import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Calendar, MapPin, Clock } from 'lucide-react'

export const metadata = { title: 'Eventos' }

const eventosDefault = [
  {
    id: 1,
    title: 'Exame de Graduação — 2024',
    date: '2024-12-15',
    time: '09:00',
    location: 'Dojo Central, Salvador-BA',
    type: 'Graduação',
    description: 'Exame de faixa para os alunos que cumpriram os requisitos técnicos e de presença. Seguindo os critérios da IOGKF Brasil.',
  },
  {
    id: 2,
    title: 'Gasshuku Regional IOGKF',
    date: '2025-02-22',
    time: '08:00',
    location: 'A definir',
    type: 'Seminário',
    description: 'Curso intensivo com instrutores da IOGKF Brasil. Kata avançado, bunkai e metodologia de ensino.',
  },
  {
    id: 3,
    title: 'Campeonato Baiano de Karatê',
    date: '2025-04-12',
    time: '08:00',
    location: 'Ginásio Municipal, Salvador-BA',
    type: 'Competição',
    description: 'Campeonato estadual de kata e kumite. Categorias infantil, juvenil e adulto.',
  },
]

const typeColors = {
  'Graduação': 'text-gold border-gold/30',
  'Seminário': 'text-blue-400 border-blue-400/30',
  'Competição': 'text-primary border-primary/30',
}

export default function EventosPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative pt-40 pb-20 bg-dark-card border-b border-dark-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">Calendário</p>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-white leading-tight mb-6">Eventos</h1>
            <div className="w-16 h-0.5 bg-primary" />
          </div>
        </section>

        <section className="section-pad bg-dark">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col gap-6">
              {eventosDefault.map((evento) => {
                const date = new Date(evento.date + 'T00:00:00')
                const day = date.getDate().toString().padStart(2, '0')
                const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()
                const year = date.getFullYear()
                const typeClass = typeColors[evento.type] || 'text-gray-400 border-gray-400/30'

                return (
                  <div key={evento.id}
                    className="flex flex-col md:flex-row gap-6 p-6 md:p-8 border border-dark-border bg-dark-card hover:border-primary/40 transition-all duration-300">
                    {/* Date */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 border border-dark-border bg-dark text-center">
                      <span className="font-cinzel text-primary text-2xl font-bold leading-none">{day}</span>
                      <span className="font-cinzel text-gray-500 text-xs tracking-wider">{month}</span>
                      <span className="font-cinzel text-gray-600 text-xs">{year}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-cinzel text-white text-xl font-bold">{evento.title}</h3>
                        <span className={`flex-shrink-0 text-xs font-cinzel border px-3 py-1 uppercase tracking-wider ${typeClass}`}>
                          {evento.type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">{evento.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> {evento.time}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {evento.location}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
