'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Building2, Mail, Lock, Phone, ArrowRight,
  Eye, EyeOff, CheckCircle2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CadastroFilialPage() {
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
      const res = await fetch('/api/filiais', {
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
      if (!res.ok) throw new Error(data.erro || 'Erro ao cadastrar filial.');

      setSucesso(true);
      toast.success('Cadastro enviado com sucesso!');
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
            <div className="w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-4 animate-fade-in">
              <span className="font-cinzel text-primary text-2xl font-bold">GRKK</span>
            </div>
            <h1 className="font-cinzel text-2xl text-white font-bold tracking-wider">Goju-Ryu Karate Kai</h1>
          </div>

          <div className="bg-dark-card border border-dark-border p-8 text-center animate-fade-up">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-white mb-3">Cadastro Enviado!</h2>
            <p className="text-sm text-gray-400 mb-4 font-body leading-relaxed">
              Sua filial <strong className="text-white">{form.nome}</strong> foi cadastrada com sucesso.
            </p>
            <p className="text-sm text-gray-500 mb-6 font-body leading-relaxed">
              Nossa equipe irá analisar seu cadastro em breve. Você receberá uma notificação no e-mail cadastrado assim que for aprovado.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/auth/entrar" className="bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-6 py-3.5 hover:bg-primary-dark transition-all duration-300 text-center font-bold">
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
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c41e2a 0%, transparent 70%)' }} />
        <div className="relative flex flex-col justify-center items-center text-center p-16 w-full animate-fade-up">
          <div className="w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center mb-8">
            <span className="font-cinzel text-primary text-2xl font-bold">GRKK</span>
          </div>
          <h1 className="font-cinzel text-4xl text-white font-bold mb-4">Goju-Ryu<br />Karate Kai</h1>
          <div className="w-12 h-0.5 bg-primary mx-auto my-5" />
          <p className="text-gray-500 font-cinzel text-xs tracking-widest uppercase">Cadastro de Filial</p>
          <p className="text-gray-400 text-sm mt-4 max-w-xs font-body">
            Registre sua academia, dojo, clube ou projeto social e passe a fazer parte da nossa associação oficial.
          </p>
          {/* Dojo Kun quote */}
          <div className="mt-16 border border-dark-border p-6 max-w-xs">
            <p className="text-gray-500 italic text-sm leading-relaxed font-body">
              "Hitotsu – Reigi o omonzuru koto"
            </p>
            <p className="text-primary text-xs mt-3 font-cinzel">Respeitar a cortesia e a etiqueta</p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 animate-fade-in">
        <div className="w-full max-w-md">
          <Link href="/auth/cadastro" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-10">
            ← Voltar
          </Link>

          <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-3">Filiação & Cadastro</p>
          <h2 className="font-cinzel text-4xl text-white font-bold mb-2">Cadastrar Filial</h2>
          <div className="w-8 h-0.5 bg-primary mb-8" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">
                Nome da academia / clube <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  required
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="Ex: Academia Fight Club"
                  value={form.nome}
                  onChange={set('nome')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">
                E-mail <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  required
                  type="email"
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="contato@academia.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
              <p className="text-[10px] text-gray-500">Será usado para login e comunicações</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Telefone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="tel"
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={set('telefone')}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">
                Senha <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  required
                  type={showPwd ? 'text' : 'password'}
                  className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="Mínimo 6 caracteres"
                  value={form.senha}
                  onChange={set('senha')}
                  autoComplete="new-password"
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
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">
                Confirmar senha <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  required
                  type={showConfirmPwd ? 'text' : 'password'}
                  className={`w-full bg-dark-card border text-white pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors ${
                    form.confirmarSenha && form.confirmarSenha !== form.senha
                      ? 'border-primary'
                      : 'border-dark-border'
                  }`}
                  placeholder="Repita a senha"
                  value={form.confirmarSenha}
                  onChange={set('confirmarSenha')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.confirmarSenha && form.confirmarSenha !== form.senha && (
                <p className="text-xs text-primary mt-1">As senhas não coincidem</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-8 py-4 hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Enviando...' : 'Cadastrar filial'}
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-6">
            Já possui cadastro?{' '}
            <Link href="/auth/entrar" className="text-primary hover:underline font-semibold font-cinzel tracking-wider transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
