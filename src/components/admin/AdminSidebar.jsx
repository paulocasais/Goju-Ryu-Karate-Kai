'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard, FileText, Users, Image, Calendar,
  MessageSquare, LogOut, ExternalLink, Menu, X, ClipboardCheck
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Voltar ao ERP', href: '/home', icon: LayoutDashboard },
  { label: 'Dashboard CMS', href: '/admin', icon: LayoutDashboard },
  { label: 'Aprovações', href: '/admin/aprovacoes', icon: ClipboardCheck },
  { label: 'Conteúdo do Site', href: '/admin/conteudo', icon: FileText },
  { label: 'Equipe', href: '/admin/equipe', icon: Users },
  { label: 'Galeria', href: '/admin/galeria', icon: Image },
  { label: 'Eventos', href: '/admin/eventos', icon: Calendar },
  { label: 'Contatos', href: '/admin/contatos', icon: MessageSquare },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/entrar')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
            <span className="font-cinzel text-primary text-xs font-bold">GRKK</span>
          </div>
          <div>
            <p className="font-cinzel text-white text-xs font-semibold">Goju-Ryu Karate Kai</p>
            <p className="text-gray-600 text-xs">Painel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`admin-link ${active ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-border flex flex-col gap-2">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="admin-link text-xs">
          <ExternalLink size={14} /> Ver Site
        </a>
        <button onClick={handleLogout}
          className="admin-link text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs w-full text-left">
          <LogOut size={14} /> Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-dark-card border border-dark-border p-2 text-white">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-dark-card border-r border-dark-border z-40 transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <SidebarContent />
      </aside>
    </>
  )
}
