'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePageTransition } from '@/components/TransitionWrapper';
import {
  LayoutDashboard, Trophy, CalendarDays,
  FileText, LogOut, ChevronRight, X,
  Building2, UserCheck, ClipboardList, Newspaper, Settings,
  Medal, CreditCard,
} from 'lucide-react';

const NAV_ADMIN = [
  { href: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/filiais', label: 'Filiais', icon: Building2 },
  { href: '/atletas', label: 'Atletas', icon: UserCheck },
  { href: '/eventos-dash', label: 'Eventos', icon: CalendarDays },
  { href: '/noticias', label: 'Notícias', icon: Newspaper },
  { href: '/exames', label: 'Exames de Faixa', icon: Trophy },
  { href: '/ranking', label: 'Ranking Interno', icon: Medal },
  { href: '/financeiro', label: 'Financeiro', icon: CreditCard },
  { href: '/documentos', label: 'Documentos', icon: FileText },
  { href: '/auditoria', label: 'Auditoria', icon: ClipboardList },
  { href: '/admin', label: 'Gerenciar Site (CMS)', icon: Settings },
];

const NAV_FILIAL = [
  { href: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/filial', label: 'Minha Filial', icon: Building2 },
  { href: '/atletas', label: 'Atletas', icon: UserCheck },
  { href: '/eventos-dash', label: 'Eventos', icon: CalendarDays },
  { href: '/exames', label: 'Exames de Faixa', icon: Trophy },
  { href: '/ranking', label: 'Ranking Interno', icon: Medal },
  { href: '/financeiro', label: 'Financeiro', icon: CreditCard },
  { href: '/documentos', label: 'Documentos', icon: FileText },
  { href: '/auditoria', label: 'Auditoria', icon: ClipboardList },
];

const NAV_ATLETA = [
  { href: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/eventos-dash', label: 'Eventos', icon: CalendarDays },
  { href: '/exames', label: 'Exames de Faixa', icon: Trophy },
  { href: '/ranking', label: 'Ranking Interno', icon: Medal },
  { href: '/financeiro', label: 'Financeiro', icon: CreditCard },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { usuario, tipo, isAdmin, isFilial, isAtleta, logout } = useAuth();
  const { navigateTo } = usePageTransition();

  const handleLogout = async () => {
    await navigateTo('/', { delay: 0 });
    await logout();
  };

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + '/');

  let navItems = NAV_ATLETA;
  if (isAdmin) navItems = NAV_ADMIN;
  if (isFilial) navItems = NAV_FILIAL;
  if (isAtleta) navItems = NAV_ATLETA;

  const nomeExibido = usuario?.nome ?? usuario?.name ?? 'Usuário';
  const papelExibido = tipo === 'admin' ? 'Administrador' : tipo === 'filial' ? 'Filial' : 'Atleta';
  const inicial = nomeExibido.charAt(0).toUpperCase();

  const accentColor = isAdmin ? 'from-brand-500 to-brand-700' : isFilial ? 'from-gold-500 to-gold-700' : 'from-cobalt-500 to-cobalt-700';
  const accentText = isAdmin ? 'text-brand-400' : isFilial ? 'text-gold-400' : 'text-cobalt-400';
  const activeItemClass = isAdmin
    ? 'bg-gradient-to-r from-brand-500/15 to-brand-500/5 text-brand-400 border border-brand-500/20'
    : isFilial
      ? 'bg-gradient-to-r from-gold-500/15 to-gold-500/5 text-gold-400 border border-gold-500/20'
      : 'bg-gradient-to-r from-brand-500/15 to-brand-500/5 text-brand-400 border border-brand-500/20';
  const activeBarClass = isAdmin ? 'bg-brand-500' : isFilial ? 'bg-gold-500' : 'bg-brand-500';
  const activeIconClass = isAdmin ? 'text-brand-400' : isFilial ? 'text-gold-400' : 'text-cobalt-400';
  const activeChevronClass = isAdmin ? 'text-brand-400/50' : isFilial ? 'text-gold-400/50' : 'text-cobalt-400/50';

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        bg-dark-400 border-r border-white/[0.05]`}>

        {/* Fundo decorativo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute top-0 left-0 w-48 h-48 bg-gradient-to-br ${accentColor} opacity-[0.04] rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2`} />
        </div>

        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.05] relative">
          <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
            <div className="relative w-9 h-9 group-hover:scale-105 transition-transform shrink-0">
              <Image src="/logo.png" alt="GRKK" fill sizes="36px" className="object-contain drop-shadow-md" priority loading="eager" />
            </div>
            <div>
              <span className="text-base font-black text-ink-100 tracking-tight">GRKK</span>
              <div className={`text-[9px] font-bold uppercase tracking-[0.2em] -mt-0.5 ${accentText}`}>
                {papelExibido}
              </div>
            </div>
          </Link>
          <button onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/[0.06] text-ink-500 hover:text-ink-100 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="sport-label text-ink-700 px-3 py-2 mt-1">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${active ? activeItemClass : 'text-ink-400 hover:bg-brand-500/[0.06] hover:text-ink-100'}`}
              >
                {active && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 ${activeBarClass} rounded-full`} />
                )}
                <Icon size={16} className={active ? activeIconClass : 'text-ink-600 group-hover:text-ink-300 transition-colors'} />
                <span className="flex-1 text-[13px]">{item.label}</span>
                {active && <ChevronRight size={12} className={activeChevronClass} />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.02] mb-1">
            <div className={`w-8 h-8 bg-gradient-to-br ${accentColor} rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm`}>
              {inicial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-ink-100 truncate leading-none">{nomeExibido}</p>
              <p className="text-[10px] text-ink-600 capitalize mt-0.5">{papelExibido}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut size={15} className="group-hover:rotate-12 transition-transform duration-200" />
            <span className="text-[13px]">Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  );
}
