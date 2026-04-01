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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border p-6">
          <h3 className="font-cinzel text-white text-sm tracking-wider uppercase mb-5">Ações Rápidas</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Editar texto do Hero', href: '/admin/conteudo' },
              { label: 'Adicionar membro à equipe', href: '/admin/equipe' },
              { label: 'Adicionar fotos à galeria', href: '/admin/galeria' },
              { label: 'Criar novo evento', href: '/admin/eventos' },
              { label: 'Ver mensagens recebidas', href: '/admin/contatos' },
            ].map((a, i) => (
              <a key={i} href={a.href}
                className="flex items-center justify-between text-sm text-gray-400 hover:text-primary transition-colors py-2 border-b border-dark-border last:border-0">
                {a.label}
                <span className="text-xs">→</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border p-6">
          <h3 className="font-cinzel text-white text-sm tracking-wider uppercase mb-5">Status do Sistema</h3>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Site público', status: 'Online', ok: true },
              { label: 'Banco de dados', status: 'Configurar .env', ok: false },
              { label: 'Formulário de contato', status: 'Aguardando DB', ok: false },
              { label: 'Galeria', status: 'Aguardando DB', ok: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{s.label}</span>
                <span className={`text-xs font-cinzel px-2 py-0.5 border ${s.ok ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-dark border border-dark-border text-xs text-gray-500 leading-relaxed">
            Configure o arquivo <code className="text-primary">.env.local</code> com as credenciais do Supabase para ativar todas as funcionalidades.
          </div>
        </div>
      </div>
    </div>
  )
}
