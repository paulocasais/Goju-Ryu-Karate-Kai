'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, User, Mail, Lock, Phone, ArrowRight,
  Eye, EyeOff, CheckCircle2, Loader2, Calendar, MapPin, CreditCard, Building2, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { validateCPF } from '@/lib/utils';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

export default function CadastroAtletaPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setFormatado = (field, formatter) => (e) =>
    setForm((prev) => ({ ...prev, [field]: formatter(e.target.value) }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (form.senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/atletas/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.replace(/\D/g, ''),
          senha: form.senha,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao realizar cadastro.');

      setSucesso(true);
      toast.success('Cadastro concluído! Aguardando aprovação.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4 animate-fade-in">
              <span className="font-cinzel text-gold text-2xl font-bold">GRKK</span>
            </div>
            <h1 className="font-cinzel text-2xl text-white font-bold tracking-wider">Goju-Ryu Karate Kai</h1>
          </div>

          <div className="bg-dark-card border border-dark-border p-8 text-center animate-fade-up">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
              <UserCheck size={32} className="text-gold" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-white mb-3">Solicitação Enviada!</h2>
            <p className="text-sm text-gray-400 mb-4 font-body leading-relaxed">
              Olá <strong className="text-white">{form.nome}</strong>! Seus dados básicos foram recebidos.
            </p>
            <p className="text-sm text-gray-500 mb-6 font-body leading-relaxed">
              Sua solicitação de cadastro de atleta está aguardando aprovação pela administração. Assim que for aprovado, você poderá fazer o login e preencher seus dados completos.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/auth/entrar" className="bg-gold text-white font-cinzel text-xs tracking-widest uppercase px-6 py-3.5 hover:bg-gold-dark transition-all duration-300 text-center font-bold">
                Ir para o login
              </Link>
              <Link href="/" className="border border-dark-border text-gray-400 hover:text-white font-cinzel text-xs tracking-widest uppercase px-6 py-3.5 hover:bg-dark-muted transition-all duration-300 text-center">
                Voltar para o site
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-card" />
        <div className="absolute inset-0 opacity-10 animate-fade-in"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c8a96e 0%, transparent 70%)' }} />
        <div className="relative flex flex-col justify-center items-center text-center p-16 w-full animate-fade-up">
          <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mb-8">
            <span className="font-cinzel text-gold text-2xl font-bold">GRKK</span>
          </div>
          <h1 className="font-cinzel text-4xl text-white font-bold mb-4">Goju-Ryu<br />Karate Kai</h1>
          <div className="w-12 h-0.5 bg-gold mx-auto my-5" />
          <p className="text-gray-500 font-cinzel text-xs tracking-widest uppercase">Cadastro de Atleta</p>
          <p className="text-gray-400 text-sm mt-4 max-w-xs font-body animate-fade-in">
            Faça sua matrícula como aluno ou atleta individual federado e conecte-se com a sua academia filiada.
          </p>
          {/* Dojo Kun quote */}
          <div className="mt-16 border border-dark-border p-6 max-w-xs">
            <p className="text-gray-500 italic text-sm leading-relaxed font-body">
              "Hitotsu – Dento karate o mamori hibi no tanren o okotarazu"
            </p>
            <p className="text-gold text-xs mt-3 font-cinzel">Praticar diariamente sem esmorecer</p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 animate-fade-in overflow-y-auto max-h-screen">
        <div className="w-full max-w-md">
          <Link href="/auth/cadastro" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-8">
            ← Voltar
          </Link>

          <p className="text-gold font-cinzel text-xs tracking-[0.3em] uppercase mb-3">Cadastro de Aluno</p>
          <h2 className="font-cinzel text-4xl text-white font-bold mb-2">Matrícula de Atleta</h2>
          <div className="w-8 h-0.5 bg-gold mb-8" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Nome completo *</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  required
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={set('nome')}
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  required
                  type="email"
                  placeholder="exemplo@email.com"
                  value={form.email}
                  onChange={set('email')}
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

             <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Telefone celular *</label>
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  required
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={setFormatado('telefone', formatarTelefone)}
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-dark-border pt-5">
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Senha *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    required
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={form.senha}
                    onChange={set('senha')}
                    className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                  >
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Confirmar senha *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    required
                    type={showConfirmPwd ? 'text' : 'password'}
                    placeholder="Repita sua senha"
                    value={form.confirmarSenha}
                    onChange={set('confirmarSenha')}
                    className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                  >
                    {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-dark-border">
              <Link href="/auth/cadastro" className="border border-dark-border text-gray-400 hover:text-white font-cinzel text-xs tracking-widest uppercase px-6 py-4 hover:bg-dark-muted transition-all duration-300 flex-1 text-center">
                Voltar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-gold text-white font-cinzel text-xs tracking-widest uppercase px-6 py-4 hover:bg-gold-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex-1 text-center flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                ) : (
                  <>Cadastrar <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
