'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Shield, Heart, Star } from 'lucide-react'

const valores = [
  { icon: Shield, label: 'Disciplina', desc: 'Compromisso com a prática diária e o crescimento pessoal.' },
  { icon: Heart, label: 'Respeito', desc: 'Tradição milenar baseada no respeito mútuo e à arte.' },
  { icon: Star, label: 'Excelência', desc: 'Busca constante pelo aprimoramento técnico e humano.' },
]

export default function SobreSection({ content = {} }) {
  const sectionRef = useRef(null)

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <p className="reveal text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">
              {content.eyebrow || 'Honrando a Arte'}
            </p>
            <h2 className="reveal font-cinzel text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              {content.title || 'Karatê Goju-Ryu Okinawano'}
            </h2>
            <div className="reveal w-16 h-0.5 bg-primary mb-8" />
            <p className="reveal text-gray-300 leading-relaxed mb-5">
              {content.paragraph1 || 'Nosso compromisso é preservar a disciplina, a tradição e o respeito do Karatê Goju-Ryu Okinawano, promovendo um aprendizado autêntico e inspirador para todos os praticantes.'}
            </p>
            <p className="reveal text-gray-400 leading-relaxed mb-8">
              {content.paragraph2 || 'Através da prática do karatê, trabalhamos valores fundamentais como respeito, disciplina, autocontrole, perseverança e responsabilidade, formando cidadãos preparados para os desafios dentro e fora do tatame.'}
            </p>
            <div className="reveal">
              <Link href="/sobre"
                className="inline-flex items-center gap-2 text-primary font-cinzel text-xs tracking-widest uppercase hover:gap-4 transition-all duration-300">
                Conheça Nossa História
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Values */}
          <div className="flex flex-col gap-5">
            {valores.map(({ icon: Icon, label, desc }, i) => (
              <div key={i}
                className="reveal flex items-start gap-5 p-6 border border-dark-border bg-dark-card hover:border-primary/40 transition-all duration-300"
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-cinzel text-white text-sm tracking-wider uppercase mb-2">{label}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
