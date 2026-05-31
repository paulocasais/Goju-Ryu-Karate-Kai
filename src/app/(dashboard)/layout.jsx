"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, Bell, ArrowUpRight, Check, X, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePageTransition } from "@/components/TransitionWrapper";
import Link from "next/link";
import "../globals.css";

function DashTopBar({ onMenuOpen }) {
  const { usuario } = useAuth();
  const { navigateTo } = usePageTransition();
  const nomeExibido = usuario?.nome ?? usuario?.name ?? "Usuário";

  const [notifs, setNotifs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const carregarNotificacoes = async () => {
    try {
      const res = await fetch("/api/notificacoes");
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notificacoes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
    // Polling a cada 20 segundos
    const interval = setInterval(carregarNotificacoes, 20000);
    return () => clearInterval(interval);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalNaoLidas = notifs.filter((n) => !n.lida).length;

  const marcarComoLida = async (id) => {
    try {
      const res = await fetch(`/api/notificacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lida: true }),
      });
      if (res.ok) {
        setNotifs((prev) =>
          prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const res = await fetch("/api/notificacoes", {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-14 bg-dark-400/70 backdrop-blur-xl border-b border-white/[0.05] flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuOpen}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/[0.06] text-ink-500 hover:text-ink-100 transition-all"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1" />

      <button
        onClick={() => navigateTo('/')}
        className="hidden sm:flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
      >
        <ArrowUpRight size={12} /> Ver site
      </button>

      {/* Sino / Dropdown de Notificações */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
            isOpen ? "bg-white/[0.08] text-ink-100" : "hover:bg-white/[0.06] text-ink-500 hover:text-ink-100"
          }`}
        >
          <Bell size={16} />
          {totalNaoLidas > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-dark-200 border border-dark-50/70 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-scale">
            {/* Header Dropdown */}
            <div className="p-4 border-b border-dark-50/60 flex items-center justify-between bg-dark-250/20">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-ink-200">Notificações</h3>
                <p className="text-[10px] text-ink-600 mt-0.5">{totalNaoLidas} novas alertas</p>
              </div>
              {totalNaoLidas > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="text-[10px] font-bold text-gold-400 hover:text-gold-300 transition"
                >
                  Marcar todas lidas
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-dark-50/30">
              {notifs.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-dark-350 border border-dark-50/50 rounded-xl flex items-center justify-center text-ink-700 mb-3">
                    <Bell size={18} />
                  </div>
                  <p className="text-xs font-semibold text-ink-400">Nenhum aviso novo</p>
                  <p className="text-[10px] text-ink-600 mt-0.5">Você está atualizado com o sistema.</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.lida && marcarComoLida(n.id)}
                    className={`p-4 flex gap-3 cursor-pointer transition ${
                      n.lida ? "opacity-60 bg-transparent hover:bg-white/[0.01]" : "bg-gold-500/[0.02] hover:bg-gold-500/[0.04]"
                    }`}
                  >
                    <div className="mt-0.5">
                      {n.tipo === "sucesso" ? (
                        <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center border border-green-500/20 text-green-400">
                          <Check size={11} />
                        </div>
                      ) : n.tipo === "alerta" ? (
                        <div className="w-5 h-5 rounded-full bg-yellow-500/15 flex items-center justify-center border border-yellow-500/20 text-yellow-400">
                          <AlertCircle size={11} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center border border-blue-500/20 text-blue-400">
                          <Clock size={11} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-xs font-bold ${n.lida ? "text-ink-300" : "text-ink-100"}`}>{n.titulo}</p>
                        <span className="text-[9px] font-mono text-ink-650 shrink-0">
                          {new Date(n.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-600 mt-0.5 leading-relaxed">{n.mensagem}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2">
        <div className="w-5 h-5 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white text-[9px] font-black">
          {nomeExibido.charAt(0).toUpperCase()}
        </div>
        <span className="text-[13px] font-medium text-ink-300 hidden sm:block truncate max-w-[110px]">
          {nomeExibido}
        </span>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-300 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        <DashTopBar onMenuOpen={() => setSidebarOpen(true)} />
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
