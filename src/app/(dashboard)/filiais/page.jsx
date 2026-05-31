'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Clock3, Search, XCircle, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STATUS_META = {
  pendente: { label: 'Pendente', className: 'text-gold-400 bg-gold-400/10 border-gold-400/20', icon: Clock3 },
  aprovado: { label: 'Aprovada', className: 'text-green-400 bg-green-400/10 border-green-400/20', icon: CheckCircle2 },
  reprovado: { label: 'Reprovada', className: 'text-brand-400 bg-brand-400/10 border-brand-400/20', icon: XCircle },
};

export default function FiliaisAdminPage() {
  const { isAdmin, carregando } = useAuth();
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [erro, setErro] = useState('');
  const [salvandoId, setSalvandoId] = useState('');
  const [justificativas, setJustificativas] = useState({});

  const carregarFiliais = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const query = filtro !== 'todas' ? `?status=${filtro}` : '';
      const res = await fetch(`/api/filiais${query}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao carregar filiais');
      setFiliais(data.filiais || []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    if (isAdmin) carregarFiliais();
  }, [isAdmin, carregarFiliais]);

  const filiaisFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return filiais;
    return filiais.filter((filial) =>
      [filial.nome, filial.email, filial.telefone]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(termo))
    );
  }, [filiais, busca]);

  async function atualizarStatus(filial, status) {
    const motivo = (justificativas[filial.id] || '').trim();
    if (status === 'reprovado' && !motivo) {
      setErro(`Informe a justificativa para reprovar a filial "${filial.nome}".`);
      return;
    }

    setSalvandoId(filial.id);
    setErro('');
    try {
      const res = await fetch(`/api/filiais/${filial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          motivo_reprovacao: status === 'reprovado' ? motivo : '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao atualizar status');

      setFiliais((prev) =>
        prev.map((item) => (item.id === filial.id ? data.filial : item))
      );

      if (status === 'aprovado') {
        setJustificativas((prev) => ({ ...prev, [filial.id]: '' }));
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvandoId('');
    }
  }

  if (carregando) {
    return (
      <main className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-brand-400" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="p-6">
        <div className="card p-6">
          <h1 className="text-xl font-bold text-ink-100 mb-2">Acesso restrito</h1>
          <p className="text-sm text-ink-400">Somente o administrador geral pode gerenciar filiais.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center">
          <Building2 size={20} className="text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-ink-100">Gerenciamento de Filiais</h1>
          <p className="text-sm text-ink-500">Aprove ou reprove cadastros e acompanhe o status das filiais.</p>
        </div>
      </div>

      {erro && (
        <div className="bg-brand-900/30 border border-brand-500/30 text-brand-300 text-sm p-3 rounded-xl">
          {erro}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            className="input-field pl-10"
            placeholder="Buscar por nome, email ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          className="input-field lg:w-48"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="pendente">Pendentes</option>
          <option value="aprovado">Aprovadas</option>
          <option value="reprovado">Reprovadas</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-brand-400" />
        </div>
      ) : filiaisFiltradas.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink-400">Nenhuma filial encontrada para este filtro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filiaisFiltradas.map((filial) => {
            const meta = STATUS_META[filial.status] || STATUS_META.pendente;
            const StatusIcon = meta.icon;
            const salvando = salvandoId === filial.id;

            return (
              <div key={filial.id} className="card p-5 space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-bold text-ink-100">{filial.nome}</h2>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${meta.className}`}>
                        <StatusIcon size={13} />
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-sm text-ink-400 space-y-1">
                      <p>{filial.email}</p>
                      <p>{filial.telefone || 'Telefone não informado'}</p>
                      <p>Cadastrada em {new Date(filial.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:w-[320px]">
                    <button
                      onClick={() => atualizarStatus(filial, 'aprovado')}
                      disabled={salvando}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      {salvando ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                      Aprovar
                    </button>
                    <button
                      onClick={() => atualizarStatus(filial, 'reprovado')}
                      disabled={salvando}
                      className="btn-outline flex items-center justify-center gap-2 border-brand-500/30 text-brand-300 hover:bg-brand-500/10"
                    >
                      {salvando ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      Reprovar
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider">
                    Justificativa para reprovação
                  </label>
                  <textarea
                    className="input-field min-h-28 resize-y"
                    placeholder="Informe o motivo que será enviado por email para a filial em caso de reprovação."
                    value={justificativas[filial.id] ?? filial.motivo_reprovacao ?? ''}
                    onChange={(e) =>
                      setJustificativas((prev) => ({ ...prev, [filial.id]: e.target.value }))
                    }
                  />
                  {filial.status === 'reprovado' && filial.motivo_reprovacao && (
                    <p className="text-xs text-ink-500">
                      Última justificativa enviada: {filial.motivo_reprovacao}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
