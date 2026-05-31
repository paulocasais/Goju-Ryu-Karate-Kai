'use client';

/**
 * /noticias — Gerenciamento de Notícias (Admin)
 * CRUD completo: criar, publicar/despublicar, destacar, editar, deletar.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Newspaper, Plus, Pencil, Trash2, Eye, EyeOff,
  Star, StarOff, X, Save, Loader2, Image as ImageIcon,
  CheckCircle2, AlertCircle, Globe, FileText,
} from 'lucide-react';

// ── Utilitário de datas ────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Modal de criação / edição ──────────────────────────────

function NoticiaModal({ noticia, onSalvo, onFechar }) {
  const editando = !!noticia?.id;

  const [form, setForm] = useState({
    titulo:     noticia?.titulo     ?? '',
    resumo:     noticia?.resumo     ?? '',
    conteudo:   noticia?.conteudo   ?? '',
    imagem_url: noticia?.imagem_url ?? '',
    publicado:  noticia?.publicado  ?? false,
    destaque:   noticia?.destaque   ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggle = (field) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const url    = editando ? `/api/noticias/${noticia.id}` : '/api/noticias';
      const method = editando ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      onSalvo(data.noticia, editando);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto animate-overlay" onClick={onFechar}>
      <div
        className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-2xl shadow-2xl my-8 page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-50">
          <div className="flex items-center gap-2">
            <Newspaper size={18} className="text-brand-400" />
            <h2 className="font-bold text-ink-100">
              {editando ? 'Editar Notícia' : 'Nova Notícia'}
            </h2>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg hover:bg-dark-100 text-ink-400 hover:text-ink-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="bg-brand-900/30 border border-brand-500/30 text-brand-300 text-sm p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={15} /> {erro}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
              Título *
            </label>
            <input
              required
              className="w-full px-4 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 placeholder:text-ink-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              placeholder="Título da notícia"
              value={form.titulo}
              onChange={set('titulo')}
            />
          </div>

          {/* Resumo */}
          <div>
            <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
              Resumo <span className="text-ink-600 font-normal normal-case">(exibido no site)</span>
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 placeholder:text-ink-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition resize-none"
              placeholder="Breve descrição exibida no card da notícia..."
              value={form.resumo}
              onChange={set('resumo')}
            />
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
              Conteúdo completo <span className="text-ink-600 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              rows={5}
              className="w-full px-4 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 placeholder:text-ink-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition resize-none"
              placeholder="Texto completo da notícia..."
              value={form.conteudo}
              onChange={set('conteudo')}
            />
          </div>

          {/* URL da imagem */}
          <div>
            <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
              URL da imagem <span className="text-ink-600 font-normal normal-case">(opcional)</span>
            </label>
            <div className="relative">
              <ImageIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="url"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 placeholder:text-ink-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="https://exemplo.com/imagem.jpg"
                value={form.imagem_url}
                onChange={set('imagem_url')}
              />
            </div>
            {form.imagem_url && (
              <div className="mt-2 h-28 rounded-xl overflow-hidden border border-dark-50">
                <img
                  src={form.imagem_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => toggle('publicado')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition ${
                form.publicado
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-dark-300 border-dark-50 text-ink-400'
              }`}
            >
              {form.publicado ? <Eye size={15} /> : <EyeOff size={15} />}
              {form.publicado ? 'Publicado' : 'Rascunho'}
            </button>
            <button
              type="button"
              onClick={() => toggle('destaque')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition ${
                form.destaque
                  ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                  : 'bg-dark-300 border-dark-50 text-ink-400'
              }`}
            >
              {form.destaque ? <Star size={15} /> : <StarOff size={15} />}
              {form.destaque ? 'Destaque' : 'Sem destaque'}
            </button>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2 border-t border-dark-50">
            <button
              type="button"
              onClick={onFechar}
              className="btn-outline flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Salvando...</>
                : <><Save size={15} /> {editando ? 'Salvar alterações' : 'Criar notícia'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Card de notícia ────────────────────────────────────────

function NoticiaCard({ noticia, onEditar, onTogglePublicado, onToggleDestaque, onDeletar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const handleToggle = async (campo) => {
    setActionLoading(campo);
    await onTogglePublicado(noticia.id, campo, !noticia[campo]);
    setActionLoading(null);
  };

  return (
    <div className={`bg-dark-200 border rounded-2xl overflow-hidden transition-all ${
      noticia.publicado ? 'border-dark-50' : 'border-dark-50 opacity-70'
    }`}>
      {/* Imagem */}
      {noticia.imagem_url ? (
        <div className="h-36 overflow-hidden">
          <img src={noticia.imagem_url} alt={noticia.titulo} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-36 bg-dark-300 flex items-center justify-center">
          <ImageIcon size={28} className="text-ink-600" />
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            noticia.publicado
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-dark-100 text-ink-500 border-dark-50'
          }`}>
            {noticia.publicado ? <Globe size={9} /> : <FileText size={9} />}
            {noticia.publicado ? 'Publicado' : 'Rascunho'}
          </span>
          {noticia.destaque && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Star size={9} /> Destaque
            </span>
          )}
        </div>

        <h3 className="font-semibold text-ink-100 text-sm mb-1 line-clamp-2">{noticia.titulo}</h3>
        {noticia.resumo && (
          <p className="text-xs text-ink-400 line-clamp-2 mb-3">{noticia.resumo}</p>
        )}
        <p className="text-[10px] text-ink-600 mb-3">{formatDate(noticia.created_at)}</p>

        {/* Ações */}
        {!confirmando ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onEditar(noticia)}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-dark-100 text-ink-300 hover:text-ink-100 hover:bg-dark-50 transition"
            >
              <Pencil size={12} /> Editar
            </button>
            <button
              onClick={() => handleToggle('publicado')}
              disabled={actionLoading === 'publicado'}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 ${
                noticia.publicado
                  ? 'bg-dark-100 text-ink-300 hover:bg-dark-50 hover:text-ink-100'
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              }`}
            >
              {actionLoading === 'publicado'
                ? <Loader2 size={12} className="animate-spin" />
                : noticia.publicado ? <EyeOff size={12} /> : <Eye size={12} />
              }
              {noticia.publicado ? 'Despublicar' : 'Publicar'}
            </button>
            <button
              onClick={() => handleToggle('destaque')}
              disabled={actionLoading === 'destaque'}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 ${
                noticia.destaque
                  ? 'bg-gold-500/10 text-gold-400 hover:bg-gold-500/20'
                  : 'bg-dark-100 text-ink-300 hover:bg-dark-50 hover:text-ink-100'
              }`}
            >
              {actionLoading === 'destaque'
                ? <Loader2 size={12} className="animate-spin" />
                : noticia.destaque ? <StarOff size={12} /> : <Star size={12} />
              }
              {noticia.destaque ? 'Remover destaque' : 'Destacar'}
            </button>
            <button
              onClick={() => setConfirmando(true)}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition ml-auto"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-xs text-ink-300 flex-1">Confirmar exclusão?</p>
            <button
              onClick={() => onDeletar(noticia.id)}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition"
            >
              Deletar
            </button>
            <button
              onClick={() => setConfirmando(false)}
              className="text-xs text-ink-500 hover:text-ink-300 transition"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [noticiaEditando, setNoticiaEditando] = useState(null);
  const [filtro, setFiltro] = useState('todas'); // 'todas' | 'publicadas' | 'rascunhos'

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/noticias', { credentials: 'include' });
      const data = await res.json();
      setNoticias(data.noticias ?? []);
    } catch {
      setNoticias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirCriar = () => {
    setNoticiaEditando(null);
    setModalAberto(true);
  };

  const abrirEditar = (noticia) => {
    setNoticiaEditando(noticia);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setNoticiaEditando(null);
  };

  const onSalvo = (noticiaAtualizada, editando) => {
    if (editando) {
      setNoticias((prev) =>
        prev.map((n) => n.id === noticiaAtualizada.id ? { ...n, ...noticiaAtualizada } : n)
      );
    } else {
      setNoticias((prev) => [noticiaAtualizada, ...prev]);
    }
    fecharModal();
  };

  const toggleCampo = async (id, campo, valor) => {
    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [campo]: valor }),
      });
      const data = await res.json();
      if (res.ok) {
        setNoticias((prev) =>
          prev.map((n) => n.id === id ? { ...n, [campo]: valor } : n)
        );
      }
    } catch { /* silencioso */ }
  };

  const deletar = async (id) => {
    try {
      await fetch(`/api/noticias/${id}`, { method: 'DELETE', credentials: 'include' });
      setNoticias((prev) => prev.filter((n) => n.id !== id));
    } catch { /* silencioso */ }
  };

  const noticiasFiltradas = noticias.filter((n) => {
    if (filtro === 'publicadas') return n.publicado;
    if (filtro === 'rascunhos')  return !n.publicado;
    return true;
  });

  const totalPublicadas = noticias.filter((n) => n.publicado).length;
  const totalRascunhos  = noticias.filter((n) => !n.publicado).length;

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-ink-100">Notícias</h1>
            <p className="text-sm text-ink-500 mt-0.5">
              {totalPublicadas} publicada{totalPublicadas !== 1 ? 's' : ''} · {totalRascunhos} rascunho{totalRascunhos !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={abrirCriar} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova notícia
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'todas',      label: `Todas (${noticias.length})` },
            { key: 'publicadas', label: `Publicadas (${totalPublicadas})` },
            { key: 'rascunhos',  label: `Rascunhos (${totalRascunhos})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filtro === f.key
                  ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                  : 'bg-dark-200 text-ink-400 border-dark-50 hover:border-dark-50 hover:text-ink-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-ink-400 gap-2">
            <Loader2 size={20} className="animate-spin" /> Carregando notícias...
          </div>
        ) : noticiasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper size={28} className="text-ink-500" />
            </div>
            <p className="text-ink-400 mb-4">
              {filtro === 'todas'
                ? 'Nenhuma notícia cadastrada ainda'
                : `Nenhuma notícia ${filtro === 'publicadas' ? 'publicada' : 'em rascunho'}`}
            </p>
            {filtro === 'todas' && (
              <button onClick={abrirCriar} className="text-brand-400 hover:text-brand-300 text-sm font-medium transition">
                Criar primeira notícia →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {noticiasFiltradas.map((n) => (
              <NoticiaCard
                key={n.id}
                noticia={n}
                onEditar={abrirEditar}
                onTogglePublicado={toggleCampo}
                onToggleDestaque={toggleCampo}
                onDeletar={deletar}
              />
            ))}
          </div>
        )}
      </main>

      {modalAberto && (
        <NoticiaModal
          noticia={noticiaEditando}
          onSalvo={onSalvo}
          onFechar={fecharModal}
        />
      )}
    </>
  );
}
