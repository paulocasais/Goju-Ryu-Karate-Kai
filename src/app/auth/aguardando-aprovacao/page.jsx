'use client';

import Link from 'next/link';
import { Shield, Clock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AguardandoAprovacaoPage() {
  const { logout, usuario } = useAuth();
  const tipoCadastro = usuario?.tipo === 'filial' ? 'de filial' : usuario?.tipo === 'atleta' ? 'de atleta' : '';

  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center px-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Shield size={24} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gold-500 rounded-full" />
            </div>
            <div>
              <span className="text-2xl font-black text-ink-100">GRKKK</span>
              <div className="text-[10px] font-medium text-gold-500 uppercase tracking-widest">Karatê Goju-Ryu</div>
            </div>
          </Link>
        </div>

        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="text-gold-500" />
          </div>

          <h1 className="text-2xl font-bold text-ink-100 mb-2">Aguardando Aprovação</h1>
          <p className="text-ink-400 mb-6">
            Seu cadastro {tipoCadastro || 'de membro'} foi recebido e está sendo analisado pela nossa equipe.
            Você será notificado por e-mail assim que for aprovado.
          </p>

          <div className="bg-dark-400 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 shrink-0" />
              <p className="text-sm text-ink-300">Prazo de análise: <strong className="text-ink-100">até 2 dias úteis</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 shrink-0" />
              <p className="text-sm text-ink-300">Você receberá um e-mail de confirmação após a aprovação.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 shrink-0" />
              <p className="text-sm text-ink-300">Em caso de dúvidas, entre em contato com a federação.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/contato"
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <Mail size={16} />
              Entrar em contato
            </Link>
            <button
              onClick={logout}
              className="text-sm text-ink-500 hover:text-ink-300 transition flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
