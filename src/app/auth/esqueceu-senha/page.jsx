'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setEnviado(true);
    } catch (err) {
      setErro(err.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center px-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[120px]" />
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

        <div className="card p-8">
          {enviado ? (

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-ink-100 mb-2">Email enviado!</h1>
              <p className="text-sm text-ink-400 mb-6">
                Se o email <strong className="text-ink-200">{email}</strong> estiver cadastrado,
                você receberá um link de recuperação em breve.
              </p>
              <p className="text-xs text-ink-500 mb-6">
                O link expira em <strong>15 minutos</strong>. Verifique sua caixa de spam.
              </p>
              <Link
                href="/auth/entrar"
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Voltar ao login
              </Link>
            </div>
          ) : (

            <>
              <h1 className="text-xl font-bold text-ink-100 mb-1">Recuperar senha</h1>
              <p className="text-sm text-ink-400 mb-6">
                Informe o email cadastrado. Enviaremos um link para redefinir sua senha.
              </p>

              {erro && (
                <div className="bg-brand-900/30 border border-brand-500/30 text-brand-300 text-sm p-3 rounded-xl mb-4">
                  {erro}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                    <input
                      type="email"
                      required
                      className="input-field pl-10"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>

              <p className="text-center text-sm text-ink-500 mt-6">
                <Link
                  href="/auth/entrar"
                  className="text-brand-400 hover:text-brand-300 font-medium transition inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
