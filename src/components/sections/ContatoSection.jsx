'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function ContatoSection() {
  const sectionRef = useRef(null)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('contacts').insert([{
        name: form.nome,
        email: form.email,
        phone: form.telefone,
        message: form.mensagem,
      }])
      if (err) throw err
      setSuccess(true)
      setForm({ nome: '', email: '', telefone: '', mensagem: '' })
    } catch {
      setError('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section ref={sectionRef} id="contato" className="section-pad bg-dark">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="reveal text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">Fale Conosco</p>
          <h2 className="reveal font-cinzel text-4xl md:text-5xl font-bold text-white">Entre em Contato</h2>
          <div className="reveal w-16 h-0.5 bg-primary mx-auto mt-6 mb-5" />
          <p className="reveal text-gray-400 max-w-lg mx-auto">
            Tire suas dúvidas, agende uma aula experimental ou venha nos conhecer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="reveal p-6 border border-dark-border bg-dark-card">
              <div className="flex items-center gap-4 mb-2">
                <MapPin size={18} className="text-primary flex-shrink-0" />
                <h4 className="font-cinzel text-white text-sm tracking-wider">Localização</h4>
              </div>
              <p className="text-gray-400 text-sm pl-8">Salvador, Bahia, Brasil</p>
            </div>
            <div className="reveal p-6 border border-dark-border bg-dark-card">
              <div className="flex items-center gap-4 mb-2">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <h4 className="font-cinzel text-white text-sm tracking-wider">Telefone</h4>
              </div>
              <a href="tel:+55" className="text-gray-400 text-sm pl-8 hover:text-primary transition-colors">
                (71) 9 0000-0000
              </a>
            </div>
            <div className="reveal p-6 border border-dark-border bg-dark-card">
              <div className="flex items-center gap-4 mb-2">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <h4 className="font-cinzel text-white text-sm tracking-wider">E-mail</h4>
              </div>
              <a href="mailto:contato@gojoryukaratekai.com.br"
                className="text-gray-400 text-sm pl-8 hover:text-primary transition-colors break-all">
                contato@gojoryukaratekai.com.br
              </a>
            </div>

            {/* Horários */}
            <div className="reveal p-6 border border-dark-border bg-dark-card">
              <h4 className="font-cinzel text-white text-sm tracking-wider mb-4">Horários de Treino</h4>
              <div className="flex flex-col gap-2">
                {[
                  { dia: 'Segunda e Quarta', hora: '19:00 — 21:00' },
                  { dia: 'Sábado', hora: '09:00 — 11:00' },
                ].map((h, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-500">{h.dia}</span>
                    <span className="text-white font-cinzel">{h.hora}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 reveal">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 py-20">
                <CheckCircle size={48} className="text-green-500" />
                <h3 className="font-cinzel text-white text-xl">Mensagem enviada!</h3>
                <p className="text-gray-400 text-center">Entraremos em contato em breve. Onegai shimasu!</p>
                <button onClick={() => setSuccess(false)}
                  className="text-primary font-cinzel text-xs tracking-widest uppercase hover:text-white transition-colors">
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Nome *</label>
                    <input
                      type="text" name="nome" value={form.nome} onChange={handleChange} required
                      className="bg-dark-card border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">E-mail *</label>
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange} required
                      className="bg-dark-card border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Telefone</label>
                  <input
                    type="tel" name="telefone" value={form.telefone} onChange={handleChange}
                    className="bg-dark-card border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="(71) 9 0000-0000"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Mensagem *</label>
                  <textarea
                    name="mensagem" value={form.mensagem} onChange={handleChange} required rows={5}
                    className="bg-dark-card border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Sua mensagem, dúvida ou interesse..."
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit" disabled={loading}
                  className="flex items-center justify-center gap-3 bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-8 py-4 hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : (<><Send size={14} /> Enviar Mensagem</>)}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
