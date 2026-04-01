'use client'

import { useEffect, useRef } from 'react'

const preceitos = [
  { jp: 'Hitotsu — Reigi o omonzuru koto', pt: 'Respeitar os outros' },
  { jp: 'Hitotsu — Yuki o yashinau koto', pt: 'Ser corajoso' },
  { jp: 'Hitotsu — Dento karate o mamori hibi no tanren o okotarazu', pt: 'Praticar diariamente e proteger o Karate-Do tradicional' },
  { jp: 'Hitotsu — Shinshin o renma shi Goju-Ryu Karate no shinzui o kiwameru koto', pt: 'Treinar a mente e o corpo e esforçar-se por alcançar a essência do Goju-Ryu' },
  { jp: 'Hitotsu — Futo fukutsu no seishin o yashinau koto', pt: 'Nunca desistir ou dar-se por vencido' },
]

export default function DojoKunSection() {
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
    <section ref={sectionRef} className="relative py-24 overflow-hidden bg-dark-card border-l-4 border-primary">
      {/* Background pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c41e2a' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="reveal text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">Preceitos do Dojo</p>
          <h2 className="reveal font-cinzel text-5xl md:text-6xl font-bold text-primary mb-2">
            道場訓
          </h2>
          <p className="reveal font-cinzel text-2xl text-gray-400 tracking-widest">DOJO KUN</p>
          <div className="reveal w-16 h-0.5 bg-primary mx-auto mt-6" />
        </div>

        {/* Preceitos */}
        <div className="flex flex-col gap-0">
          {preceitos.map((p, i) => (
            <div key={i}
              className="reveal flex items-start gap-6 py-7 border-b border-dark-border last:border-b-0 group hover:bg-dark/40 transition-colors duration-300 px-4"
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="flex-shrink-0 w-8 h-8 border border-primary/30 group-hover:border-primary flex items-center justify-center transition-all duration-300">
                <span className="font-cinzel text-primary text-xs">{i + 1}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm italic">{p.jp}</p>
                <p className="text-white font-cinzel text-base md:text-lg tracking-wide group-hover:text-primary transition-colors duration-300">{p.pt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
