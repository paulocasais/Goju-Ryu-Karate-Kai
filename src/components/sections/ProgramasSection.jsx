'use client'

import { useEffect, useRef } from 'react'
import { Users, BookOpen, Globe } from 'lucide-react'

const programasDefault = [
  {
    icon: BookOpen,
    title: 'Treinamento Tradicional',
    desc: 'Aprimore suas habilidades com aulas focadas na disciplina e nos fundamentos do currículo de Karatê da IOGKF Brasil. Técnica, kata e kumite em cada sessão.',
    badge: 'Todos os níveis',
  },
  {
    icon: Users,
    title: 'Aulas para Todas as Idades',
    desc: 'Programas adaptados para crianças, jovens e adultos, garantindo aprendizado inclusivo e respeitoso às fases de desenvolvimento de cada aluno.',
    badge: 'Crianças a adultos',
  },
  {
    icon: Globe,
    title: 'Gasshukus e Seminários',
    desc: 'Participação em workshops para aprofundar conhecimento e fortalecer a comunidade IOGKF Brasil, com instrutores renomados nacionais e internacionais.',
    badge: 'IOGKF Brasil',
  },
]

export default function ProgramasSection({ programas }) {
  const sectionRef = useRef(null)
  const items = programas || programasDefault

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="section-pad bg-dark">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="reveal text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">O que Oferecemos</p>
          <h2 className="reveal font-cinzel text-4xl md:text-5xl font-bold text-white leading-tight">
            Tradição e Excelência
          </h2>
          <div className="reveal w-16 h-0.5 bg-primary mx-auto mt-6 mb-5" />
          <p className="reveal text-gray-400 max-w-xl mx-auto">
            Explore nossos programas de Karatê Goju-Ryu, combinando tradição e técnica para seu desenvolvimento pessoal.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((p, i) => {
            const Icon = p.icon || BookOpen
            return (
              <div key={i}
                className="reveal card-hover border border-dark-border bg-dark-card p-8 flex flex-col gap-6"
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 border border-primary/30 flex items-center justify-center">
                    <Icon size={24} className="text-primary" />
                  </div>
                  {p.badge && (
                    <span className="text-xs font-cinzel text-primary border border-primary/30 px-3 py-1 uppercase tracking-wider">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-cinzel text-white text-xl font-semibold mb-3">{p.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{p.desc}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-dark-border">
                  <a href="/contato"
                    className="text-primary text-xs font-cinzel tracking-widest uppercase hover:text-white transition-colors duration-200 flex items-center gap-2 hover:gap-4 transition-all">
                    Saiba mais →
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
