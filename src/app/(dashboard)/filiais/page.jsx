'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Clock3, Search, XCircle, Loader2, Send, Plus, X, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

function formatarTelefone(valor) {
  if (!valor) return '';
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

const STATUS_META = {
  pendente: { label: 'Pendente', className: 'text-gold-400 bg-gold-400/10 border-gold-400/20', icon: Clock3 },
  aprovado: { label: 'Aprovada', className: 'text-green-400 bg-green-400/10 border-green-400/20', icon: CheckCircle2 },
  ativo: { label: 'Aprovada', className: 'text-green-400 bg-green-400/10 border-green-400/20', icon: CheckCircle2 },
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
  const [mostrarForm, setMostrarForm] = useState(false);

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
      toast.error(`Informe a justificativa para reprovar a filial "${filial.nome}".`);
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

      // Se o filtro atual não for "todas", removemos o registro da tela caso ele mude de status
      setFiliais((prev) => {
        if (filtro !== 'todas') {
          const matchesFilter =
            (filtro === 'aprovado' && data.filial.status === 'ativo') ||
            (filtro === data.filial.status);

          if (!matchesFilter) {
            return prev.filter((item) => item.id !== filial.id);
          }
        }
        return prev.map((item) => (item.id === filial.id ? data.filial : item));
      });

      if (status === 'aprovado') {
        setJustificativas((prev) => ({ ...prev, [filial.id]: '' }));
        toast.success(`Filial "${filial.nome}" aprovada com sucesso!`);
      } else if (status === 'reprovado') {
        toast.success(`Filial "${filial.nome}" reprovada com sucesso!`);
      }
    } catch (err) {
      setErro(err.message);
      toast.error(err.message || 'Erro ao atualizar filial.');
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
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative">
      {/* Hero Banner Premium */}
      <div className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-gold-900/25 via-dark-200 to-dark-200 border border-gold-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute inset-0 bg-arena-grid opacity-[0.08] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-gold-500/[0.04] to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gold-500/25 to-gold-700/10 rounded-2xl flex items-center justify-center border border-gold-500/20 shrink-0">
              <Building2 size={24} className="text-gold-400" />
            </div>
            <div>
              <p className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.2em] mb-0.5">Painel Administrativo</p>
              <h1 className="text-2xl font-black text-ink-100 font-cinzel tracking-wide">GERENCIAMENTO DE FILIAIS</h1>
              <p className="text-xs text-ink-500 mt-0.5">
                Aprove ou reprove cadastros e acompanhe o status das filiais.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setMostrarForm(true)}
              className="bg-gradient-to-r from-gold-500 to-amber-600 hover:scale-[1.02] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition duration-300 flex items-center gap-2 shadow-lg shadow-gold-500/5"
            >
              <Plus size={14} />
              Nova filial
            </button>
          </div>
        </div>
      </div>

      {erro && (
        <div className="bg-brand-900/30 border border-brand-500/30 text-brand-300 text-sm p-3 rounded-xl">
          {erro}
        </div>
      )}

      {/* Barra de Filtro e Busca Premium */}
      <div className="relative bg-dark-200/50 backdrop-blur-xl border border-white/[0.04] p-4 rounded-2xl grid gap-4 md:grid-cols-[1fr_auto] shadow-xl">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            className="w-full bg-dark-300/80 border border-white/[0.06] hover:border-white/[0.12] focus:border-gold-500/80 focus:ring-1 focus:ring-gold-500/20 text-ink-100 placeholder-ink-600 text-sm px-4 py-3 pl-11 rounded-xl transition duration-300 outline-none"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          className="bg-dark-300/80 border border-white/[0.06] hover:border-white/[0.12] focus:border-gold-500/80 focus:ring-1 focus:ring-gold-500/20 text-ink-100 text-sm px-4 py-3 rounded-xl transition duration-300 outline-none md:w-48 cursor-pointer"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="todas">Todas as filiais</option>
          <option value="pendente">Pendentes</option>
          <option value="aprovado">Aprovadas</option>
          <option value="reprovado">Reprovadas</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-500 flex items-center justify-center gap-2.5">
          <Loader2 size={20} className="animate-spin text-gold-400" /> Carregando filiais...
        </div>
      ) : filiaisFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-dark-200/20 border border-white/[0.04] rounded-2xl">
          <p className="text-ink-400 text-sm font-medium">Nenhuma filial encontrada para este filtro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filiaisFiltradas.map((filial) => {
            const meta = STATUS_META[filial.status] || STATUS_META.pendente;
            const StatusIcon = meta.icon;
            const salvando = salvandoId === filial.id;

            const borderStatusClass = (filial.status === 'aprovado' || filial.status === 'ativo')
              ? 'border-green-500/20 hover:border-green-500/30 shadow-green-950/[0.01]'
              : filial.status === 'reprovado'
                ? 'border-brand-500/20 hover:border-brand-500/30 shadow-brand-950/[0.01]'
                : 'border-gold-500/20 hover:border-gold-500/30 shadow-gold-950/[0.01]';

            return (
              <div key={filial.id} className={`group/card border bg-dark-200/30 backdrop-blur-sm p-6 rounded-2xl space-y-4 hover:-translate-y-0.5 hover:bg-dark-200/50 hover:shadow-xl transition-all duration-300 ${borderStatusClass}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-bold text-ink-100 group-hover/card:text-gold-400 transition-colors duration-300">{filial.nome}</h2>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${meta.className}`}>
                        <StatusIcon size={12} />
                        {meta.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-dark-300/40 p-4 rounded-xl border border-white/[0.02] text-xs text-ink-300">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-ink-600" />
                        <span className="truncate" title={filial.email}>{filial.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-ink-600" />
                        <span>{formatarTelefone(filial.telefone || '') || 'Telefone não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-ink-600" />
                        <span>Cadastrada em {new Date(filial.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:w-[320px] lg:mt-1">
                    {filial.status === 'pendente' && (
                      <>
                        <button
                          onClick={() => atualizarStatus(filial, 'aprovado')}
                          disabled={salvando}
                          className="bg-green-500/10 border border-green-500/25 hover:bg-green-500 hover:text-white text-green-400 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                          {salvando ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          Aprovar filial
                        </button>
                        <button
                          onClick={() => atualizarStatus(filial, 'reprovado')}
                          disabled={salvando}
                          className="border border-brand-500/20 bg-brand-500/5 hover:bg-brand-600 hover:text-white text-brand-300 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                          {salvando ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                          Reprovar filial
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {filial.status === 'pendente' && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-[9px] font-black text-ink-600 uppercase tracking-widest">
                      Justificativa para reprovação
                    </label>
                    <textarea
                      className="w-full bg-dark-300/80 border border-white/[0.06] hover:border-white/[0.12] focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-ink-100 placeholder-ink-600 text-sm px-4 py-3 rounded-xl transition duration-300 outline-none min-h-24 resize-y"
                      placeholder="Informe o motivo que será enviado por e-mail para a filial em caso de reprovação..."
                      value={justificativas[filial.id] ?? filial.motivo_reprovacao ?? ''}
                      onChange={(e) =>
                        setJustificativas((prev) => ({ ...prev, [filial.id]: e.target.value }))
                      }
                    />
                  </div>
                )}
                {filial.status === 'reprovado' && filial.motivo_reprovacao && (
                  <div className="pt-2">
                    <p className="text-[10px] text-brand-400 italic bg-brand-950/20 border border-brand-500/20 p-2.5 rounded-xl inline-block">
                      Motivo da reprovação: {filial.motivo_reprovacao}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-overlay" onClick={() => setMostrarForm(false)} />
          <div className="relative w-full max-w-lg z-10 page-enter">
            <FormFilial
              onSalvo={() => { setMostrarForm(false); carregarFiliais(); }}
              onCancelar={() => setMostrarForm(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function FormFilial({ onSalvo, onCancelar }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(null);

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const res = await fetch('/api/filiais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.replace(/\D/g, ''),
          senha: form.senha,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao cadastrar filial');

      setSucesso(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-dark-200/95 border border-green-500/25 p-6 sm:p-8 shadow-2xl w-full text-left">
        <div className="h-[3px] absolute top-0 left-0 right-0 bg-green-500" />
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 text-green-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black font-cinzel text-ink-100 uppercase tracking-wide">Filial cadastrada!</h3>
            <p className="text-xs text-ink-400 mt-0.5">{sucesso.nome}</p>
          </div>
        </div>
        <div className="bg-dark-300/60 border border-white/[0.03] rounded-xl p-4 mb-5 space-y-2 text-xs">
          <div>
            <span className="text-ink-500 font-semibold block uppercase tracking-wider text-[9px] mb-0.5">Login (e-mail)</span>
            <strong className="text-ink-100 font-mono text-sm">{sucesso.email}</strong>
          </div>
          <div className="h-px bg-white/[0.04] my-2" />
          <div>
            <span className="text-ink-500 font-semibold block uppercase tracking-wider text-[9px] mb-0.5">Status do Cadastro</span>
            <strong className="text-green-400 font-bold uppercase tracking-wider text-xs">Aprovado e Registrado</strong>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setForm({ nome: '', email: '', telefone: '', senha: '' });
              setSucesso(null);
            }}
            className="btn-outline flex-1"
          >
            Cadastrar outra
          </button>
          <button onClick={onSalvo} className="btn-primary flex-1 bg-gradient-to-r from-gold-500 to-amber-600 text-white font-bold border-none uppercase tracking-wider text-xs py-3 rounded-xl">
            Concluir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-dark-200/95 border border-white/[0.08] shadow-2xl backdrop-blur-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto w-full text-left">
      <div className="h-[3px] absolute top-0 left-0 right-0 tricolor-bar" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black font-cinzel text-ink-100 uppercase tracking-wider">Nova Filial</h3>
        </div>
        <button onClick={onCancelar} className="p-2 rounded-xl hover:bg-white/[0.06] text-ink-400 hover:text-ink-200 transition">
          <X size={18} />
        </button>
      </div>

      {erro && (
        <div className="bg-brand-900/30 border border-brand-500/30 text-brand-300 text-sm p-3 rounded-xl mb-4">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">
            Nome da Academia / Dojo <span className="text-brand-400">*</span>
          </label>
          <input
            required
            className="input-field"
            placeholder="Nome da filial"
            value={form.nome}
            onChange={(e) => atualizarCampo('nome', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">
            E-mail de Login <span className="text-brand-400">*</span>
          </label>
          <input
            required
            type="email"
            className="input-field"
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={(e) => atualizarCampo('email', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">
            Telefone
          </label>
          <input
            type="tel"
            className="input-field"
            placeholder="(11) 99999-9999"
            value={form.telefone}
            onChange={(e) => atualizarCampo('telefone', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">
            Senha <span className="text-brand-400">*</span>
          </label>
          <input
            required
            type="password"
            className="input-field"
            placeholder="Mínimo 6 caracteres"
            value={form.senha}
            onChange={(e) => atualizarCampo('senha', e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancelar} className="btn-outline flex-1">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !form.nome || !form.email || !form.senha}
            className="bg-gradient-to-r from-gold-500 to-amber-600 hover:scale-[1.01] text-white text-xs font-black uppercase tracking-wider py-3 px-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Cadastrando...</>
            ) : (
              'Cadastrar Filial'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
