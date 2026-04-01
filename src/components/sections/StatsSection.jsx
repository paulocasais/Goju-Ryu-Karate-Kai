'use client'

import { useEffect, useRef } from 'react'

const statsDefault = [
  { num: '15+', label: 'Anos de Tradição' },
  { num: '200+', label: 'Alunos Formados' },
  { num: '10+', label: 'Títulos Conquistados' },
  { num: '5', label: 'Instrutores' },
]

export default function StatsSection({ stats }) {
  const sectionRef = useRef(null)
  const items = stats || statsDefault

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.2 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 bg-primary/10 border-y border-primary/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((stat, i) => (
            <div key={i}
              className="reveal text-center"
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="font-cinzel text-5xl font-bold text-primary mb-2">{stat.num}</div>
              <div className="text-gray-400 text-sm font-cinzel tracking-wider uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
