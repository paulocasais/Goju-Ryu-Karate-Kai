'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Instagram, Facebook, Twitter } from 'lucide-react'

const navLinks = [
  { label: 'A Academia', href: '/sobre' },
  { label: 'Equipe', href: '/equipe' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Galeria', href: '/galeria' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Contato', href: '/contato' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isHome = pathname === '/'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome || isOpen
          ? 'bg-dark/95 backdrop-blur-md border-b border-dark-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Goju-Ryu Karate-Kai"
              className="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-cinzel text-white text-sm font-semibold tracking-widest uppercase">Goju-Ryu</span>
              <span className="font-cinzel text-primary text-xs tracking-[0.15em] uppercase">Karate Kai</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-xs font-cinzel tracking-widest uppercase transition-all duration-200 hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200">
                <Instagram size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200">
                <Facebook size={16} />
              </a>
            </div>
            <Link
              href="/auth/entrar"
              className="border border-primary text-primary text-xs font-cinzel tracking-widest uppercase px-5 py-2 hover:bg-primary hover:text-white transition-all duration-300"
            >
              Área do Membro
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="bg-dark/98 border-t border-dark-border px-4 py-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 text-sm font-cinzel tracking-widest uppercase border-b border-dark-border transition-colors duration-200 ${
                pathname === link.href ? 'text-primary' : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/entrar"
            className="mt-4 text-center border border-primary text-primary text-xs font-cinzel tracking-widest uppercase px-5 py-3 hover:bg-primary hover:text-white transition-all duration-300"
          >
            Área do Membro
          </Link>
          <div className="flex items-center justify-center gap-4 mt-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors">
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
