import { createClient } from '@/lib/supabase-server'
import { Users, MessageSquare, Calendar, Image } from 'lucide-react'

export default async function AdminDashboard() {
  // Fetch stats when Supabase is connected
  // const supabase = createClient()
  // const [contacts, events] = await Promise.all([...])

  const stats = [
    { label: 'Mensagens', value: '—', icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Membros da Equipe', value: '—', icon: Users, color: 'text-green-400' },
    { label: 'Eventos', value: '—', icon: Calendar, color: 'text-gold' },
    { label: 'Fotos na Galeria', value: '—', icon: Image, color: 'text-primary' },
  ]

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-2">Painel de Controle</p>
        <h1 className="font-cinzel text-3xl text-white font-bold">Dashboard</h1>
        <div className="w-10 h-0.5 bg-primary mt-4" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-dark-card border border-dark-border p-6 flex items-center gap-5">
              <div className="w-12 h-12 border border-dark-border flex items-center justify-center">
                <Icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-cinzel uppercase tracking-wider">{stat.label}</p>
                <p className="text-white text-2xl font-cinzel font-bold mt-1">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-dark-card border border-dark-border p-8">
        <h3 className="font-cinzel text-white text-base tracking-wider uppercase mb-8 flex items-center gap-3">
          <div className="w-8 h-px bg-primary" />
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
          {[
            { label: 'Editar texto do Hero', href: '/admin/conteudo' },
            { label: 'Adicionar membro à equipe', href: '/admin/equipe' },
            { label: 'Adicionar fotos à galeria', href: '/admin/galeria' },
            { label: 'Criar novo evento', href: '/admin/eventos' },
            { label: 'Ver mensagens recebidas', href: '/admin/contatos' },
          ].map((a, i) => (
            <a key={i} href={a.href}
              className="group flex items-center justify-between text-sm text-gray-400 hover:text-white transition-all py-4 border-b border-dark-border/50 hover:border-primary/50">
              <span className="group-hover:translate-x-1 transition-transform">{a.label}</span>
              <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs">ACESSAR →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
