'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export default function HeroVideo({ title, subtitle, description, ctaLabel, ctaHref, videoUrl }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={videoUrl || 'https://videos.pexels.com/video-files/4441001/4441001-hd_1920_1080_25fps.mp4'}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Red accent lines */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
          <div className="w-16 h-px bg-primary opacity-60" />
          <span className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase">
            {subtitle || 'IOGKF Brasil · Salvador, Bahia'}
          </span>
          <div className="w-16 h-px bg-primary opacity-60" />
        </div>

        {/* Main title */}
        <h1 className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6 animate-fade-up">
          {title ? (
            <span dangerouslySetInnerHTML={{ __html: title }} />
          ) : (
            <>
              Karatê{' '}
              <span className="text-primary">Goju-Ryu</span>
              <br />
              Tradicional
            </>
          )}
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-fade-up">
          {description || 'Onde o caminho começa e nunca termina. Tradição, disciplina e respeito do Karatê Goju-Ryu Okinawano.'}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
          <Link
            href={ctaHref || '/sobre'}
            className="bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-8 py-4 hover:bg-primary-dark transition-all duration-300 min-w-[200px] text-center"
          >
            {ctaLabel || 'Conheça a Academia'}
          </Link>
          <Link
            href="/contato"
            className="border border-white text-white font-cinzel text-xs tracking-widest uppercase px-8 py-4 hover:bg-white hover:text-dark transition-all duration-300 min-w-[200px] text-center"
          >
            Agende uma Aula
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors animate-bounce"
        aria-label="Rolar para baixo"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  )
}
