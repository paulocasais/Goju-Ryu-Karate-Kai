"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function Header() {
  const { usuario, autenticado, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-dark-400/80 backdrop-blur-xl shadow-xl shadow-black/30 border-b border-white/[0.05]"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg">
              <Image src="/logo.png" alt="GRKK Logo" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" priority loading="eager" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight leading-none">{APP_NAME}</span>
              <div className="text-[9px] font-bold text-gold-500 uppercase tracking-[0.2em] leading-none mt-0.5">
                Karatê Goju-Ryu
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-dark-300/90 backdrop-blur-sm border border-cobalt-500/10 rounded-2xl px-2 py-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${isActive(link.href)
                  ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                  : "text-ink-300 hover:text-ink-100 hover:bg-cobalt-500/[0.07]"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {usuario ? (
              <>
                <Link
                  href="/home"
                  className="text-sm font-medium text-ink-300 hover:text-ink-100 px-4 py-2 rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  Minha Área
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-ink-500 hover:text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/contato" className="text-sm font-medium text-ink-400 hover:text-ink-200 px-4 py-2 rounded-xl hover:bg-white/[0.05] transition-all">
                  Contato
                </Link>
                <Link
                  href="/auth/entrar?tab=atleta"
                  className="group relative overflow-hidden bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                >
                  Área do Atleta
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu btn */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} className="text-ink-100" /> : <Menu size={18} className="text-ink-100" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/[0.06] py-4 flex flex-col gap-1 bg-dark-400/95 backdrop-blur-xl -mx-4 px-4 pb-6 page-enter">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 text-sm rounded-xl transition-all ${isActive(link.href)
                  ? "text-brand-300 bg-brand-500/10 font-semibold border border-brand-500/20"
                  : "text-ink-200 hover:bg-white/[0.05] hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/[0.05] mt-3 pt-4 flex flex-col gap-2">
              {usuario ? (
                <>
                  <Link href="/home" onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 text-sm text-gold-400 font-medium hover:bg-gold-500/10 rounded-xl transition">
                    Minha Área
                  </Link>
                  <button onClick={handleLogout}
                    className="px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl text-left transition">
                    Sair
                  </button>
                </>
              ) : (
                <Link href="/auth/entrar?tab=atleta" onClick={() => setMenuOpen(false)}
                  className="mx-1 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold py-3 px-5 rounded-xl text-center shadow-lg shadow-brand-500/25">
                  Área do Atleta
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
