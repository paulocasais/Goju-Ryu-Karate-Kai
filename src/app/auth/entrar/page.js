'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function EntrarPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (err) throw err
      router.push('/home')
      router.refresh()
    } catch (err) {
      setError(err.message || 'E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-card" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c41e2a 0%, transparent 70%)' }} />
        <div className="relative flex flex-col justify-center items-center text-center p-16 w-full">
          <div className="w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center mb-8">
            <span className="font-cinzel text-primary text-2xl font-bold">GRKK</span>
          </div>
          <h1 className="font-cinzel text-4xl text-white font-bold mb-4">Goju-Ryu<br />Karate Kai</h1>
          <div className="w-12 h-0.5 bg-primary mx-auto my-5" />
          <p className="text-gray-500 font-cinzel text-xs tracking-widest uppercase">Área Restrita</p>
          <p className="text-gray-600 text-sm mt-4 max-w-xs">
            Acesso exclusivo para administradores e membros da academia.
          </p>
          {/* Dojo Kun quote */}
          <div className="mt-16 border border-dark-border p-6 max-w-xs">
            <p className="text-gray-500 italic text-sm leading-relaxed">
              "Hitotsu – Dento karate o mamori hibi no tanren o okotarazu"
            </p>
            <p className="text-primary text-xs mt-3 font-cinzel">Praticar diariamente</p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-12">
            ← Voltar ao site
          </Link>

          <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-3">Área do Membro</p>
          <h2 className="font-cinzel text-4xl text-white font-bold mb-2">Entrar</h2>
          <div className="w-8 h-0.5 bg-primary mb-8" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">E-mail</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange} required
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="admin@academia.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} required
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-8 py-4 hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-6">
            Ainda não possui cadastro?{' '}
            <Link href="/auth/cadastro" className="text-primary hover:underline font-semibold transition-all">
              Filie-se aqui (Academia ou Aluno)
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
