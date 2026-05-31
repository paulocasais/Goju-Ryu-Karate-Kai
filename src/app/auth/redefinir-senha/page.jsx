'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [tokenValido, setTokenValido] = useState(null); // null=carregando
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValido(false);
      return;
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => setTokenValido(data.valido))
      .catch(() => setTokenValido(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha, confirmarSenha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setSucesso(true);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => router.push('/auth/entrar'), 3000);
    } catch (err) {
      toast.error(err.message || 'Erro ao redefinir senha.');
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
          {tokenValido === null && (
            <div className="text-center text-ink-400 py-8">Verificando link...</div>
          )}

          {tokenValido === false && (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-brand-400" />
              </div>
              <h1 className="text-xl font-bold text-ink-100 mb-2">Link inválido</h1>
              <p className="text-sm text-ink-400 mb-6">
                Este link de recuperação é inválido ou expirou. Solicite um novo.
              </p>
              <Link href="/auth/esqueceu-senha" className="btn-primary w-full flex justify-center">
                Solicitar novo link
              </Link>
            </div>
          )}

          {tokenValido === true && !sucesso && (
            <>
              <h1 className="text-xl font-bold text-ink-100 mb-1">Nova senha</h1>
              <p className="text-sm text-ink-400 mb-6">Defina sua nova senha de acesso.</p>


              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-1.5">Nova senha</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="input-field pl-10 pr-10"
                      placeholder="Mínimo 6 caracteres"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-1.5">Confirmar senha</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      className="input-field pl-10"
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Salvando...' : 'Redefinir senha'}
                </button>
              </form>
            </>
          )}

          {sucesso && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-ink-100 mb-2">Senha redefinida!</h1>
              <p className="text-sm text-ink-400 mb-6">
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
              <Link href="/auth/entrar" className="btn-primary w-full flex justify-center">
                Ir para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-300 flex items-center justify-center text-ink-400">Carregando...</div>}>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
