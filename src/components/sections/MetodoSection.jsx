'use client'

import { useEffect, useRef } from 'react'

const passosDefault = [
  {
    num: '01',
    title: 'Introdução',
    subtitle: 'Primeiro Passo',
    desc: 'Aprenda os fundamentos do Karatê Goju-Ryu Okinawano, estabelecendo as bases essenciais para seu desenvolvimento marcial. Postura, respiração e kihon.',
  },
  {
    num: '02',
    title: 'Prática',
    subtitle: 'Segundo Passo',
    desc: 'Aprofunde-se nos treinamentos técnicos e físicos, avançando com dedicação e foco em cada movimento. Kata, bunkai e aplicações práticas.',
  },
  {
    num: '03',
    title: 'Evolução',
    subtitle: 'Terceiro Passo',
    desc: 'Vivencie a transformação através do aprimoramento contínuo, incorporando tradição e disciplina em sua rotina. Competições e gasshukus.',
  },
]

export default function MetodoSection({ passos }) {
  const sectionRef = useRef(null)
  const items = passos || passosDefault

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative section-pad overflow-hidden">
      {/* Background with subtle texture */}
      <div className="absolute inset-0 bg-dark-card" />
      <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent opacity-20" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="reveal text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">Sua Jornada</p>
          <h2 className="reveal font-cinzel text-4xl md:text-5xl font-bold text-white">Nosso Método</h2>
          <div className="reveal w-16 h-0.5 bg-primary mx-auto mt-6 mb-5" />
          <p className="reveal text-gray-400 max-w-xl mx-auto">
            Descubra o caminho do Karatê Goju-Ryu, passo a passo, para iniciar sua jornada com disciplina e respeito.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-px bg-dark-border">
          {items.map((passo, i) => (
            <div key={i}
              className="reveal bg-dark-card p-10 flex flex-col gap-5 group hover:bg-dark transition-colors duration-300"
              style={{ transitionDelay: `${i * 150}ms` }}>
              {/* Number */}
              <span className="font-cinzel text-6xl font-bold text-primary/15 group-hover:text-primary/40 transition-colors duration-500 leading-none">
                {passo.num}
              </span>
              <div>
                <p className="text-primary font-cinzel text-xs tracking-widest uppercase mb-2">{passo.subtitle}</p>
                <h3 className="font-cinzel text-2xl font-bold text-white mb-4">{passo.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{passo.desc}</p>
              </div>
              {/* Progress bar */}
              <div className="h-0.5 bg-dark-border mt-auto">
                <div
                  className="h-full bg-primary transition-all duration-700 group-hover:w-full"
                  style={{ width: `${((i + 1) / items.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
