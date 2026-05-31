'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Plus, Search, Filter, Upload, Download, Trash2, Edit,
  FileCheck, FileArchive, Loader2, AlertCircle, X, Eye, File,
  ClipboardList, Star, BookOpen, ShieldCheck, ChevronDown, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

/* ── Helpers ─────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(tipo) {
  if (!tipo) return File;
  if (tipo.includes('pdf')) return FileCheck;
  if (tipo.includes('zip') || tipo.includes('rar')) return FileArchive;
  if (tipo.includes('image')) return Eye;
  return FileText;
}

const CATEGORIAS = ['Regulamento', 'Formulário', 'Ata', 'Certificado', 'Outro'];

const CAT_STYLE = {
  'Regulamento': { color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20', icon: BookOpen },
  'Formulário':  { color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20',   icon: FileText },
  'Ata':         { color: 'text-gold-400',  bg: 'bg-gold-500/10 border-gold-500/20',   icon: ClipboardList },
  'Certificado': { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: Star },
  'Outro':       { color: 'text-ink-400',   bg: 'bg-white/5 border-white/10',          icon: File },
};

const VIS_LABEL = {
  todos:    { label: 'Público',       color: 'text-green-400',  bg: 'bg-green-500/10'  },
  filiais:  { label: 'Filiais',       color: 'text-gold-400',   bg: 'bg-gold-500/10'   },
  admin:    { label: 'Admin apenas',  color: 'text-brand-400',  bg: 'bg-brand-500/10'  },
};

/* ── Stat Card ───────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, loading }) {
  const s = {
    brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', val: 'text-brand-300', border: 'hover:border-brand-500/30' },
    blue:  { bg: 'bg-blue-500/10',  text: 'text-blue-400',  val: 'text-blue-300',  border: 'hover:border-blue-500/30'  },
    gold:  { bg: 'bg-gold-500/10',  text: 'text-gold-400',  val: 'text-gold-300',  border: 'hover:border-gold-500/30'  },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', val: 'text-green-300', border: 'hover:border-green-500/30' },
  }[color];

  return (
    <div className={`animate-fade-in-up bg-dark-200 border border-dark-50/60 rounded-2xl p-5 flex items-center gap-4
                     hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${s.border}`}>
      <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center shrink-0`}>
        <Icon size={22} className={s.text} />
      </div>
      <div>
        {loading
          ? <div className="h-8 w-12 bg-dark-100 rounded-xl animate-pulse mb-1" />
          : <p className={`text-3xl font-black ${s.val} leading-none scoreboard-num`}>{value}</p>
        }
        <p className="text-xs text-ink-600 font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ── Modal de Upload ─────────────────────────────────── */
function UploadModal({ onClose, onSalvo }) {
  const [form, setForm] = useState({
    titulo: '', descricao: '', categoria: 'Regulamento', visibilidade: 'todos',
  });
  const [arquivo, setArquivo] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setArquivo(f);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!arquivo) return toast.error('Selecione um arquivo.');
    if (!form.titulo.trim()) return toast.error('Título é obrigatório.');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('arquivo', arquivo);
      fd.append('titulo', form.titulo);
      fd.append('descricao', form.descricao);
      fd.append('categoria', form.categoria);
      fd.append('visibilidade', form.visibilidade);

      const res = await fetch('/api/documentos', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro no upload');

      toast.success('Documento enviado com sucesso!');
      onSalvo(data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-dark-300 border border-white/[0.08] rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-scale">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-black text-ink-100">Novo Documento</h2>
            <p className="text-xs text-ink-600 mt-0.5">Faça upload de um arquivo (máx. 10MB)</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-white/[0.07] flex items-center justify-center text-ink-500 hover:text-ink-100 transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                        ${drag ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-brand-500/50 hover:bg-white/[0.02]'}`}
          >
            <input ref={inputRef} type="file" className="hidden" onChange={(e) => setArquivo(e.target.files[0])} />
            {arquivo ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-brand-500/15 rounded-xl flex items-center justify-center">
                  <FileCheck size={24} className="text-brand-400" />
                </div>
                <p className="text-sm font-bold text-ink-100">{arquivo.name}</p>
                <p className="text-xs text-ink-600">{formatBytes(arquivo.size)}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center">
                  <Upload size={22} className="text-ink-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-300">Arraste um arquivo aqui</p>
                  <p className="text-xs text-ink-600 mt-1">ou clique para selecionar · PDF, DOC, XLS, etc.</p>
                </div>
              </div>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-1.5 block">Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Nome do documento"
              className="w-full bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-600 outline-none focus:border-brand-500/50 transition-colors"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-1.5 block">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Descrição opcional..."
              rows={2}
              className="w-full bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-600 outline-none focus:border-brand-500/50 transition-colors resize-none"
            />
          </div>

          {/* Categoria + Visibilidade lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-1.5 block">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="w-full bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-100 outline-none focus:border-brand-500/50 transition-colors"
              >
                {CATEGORIAS.map(c => <option key={c} value={c} className="bg-dark-300">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-1.5 block">Visibilidade</label>
              <select
                value={form.visibilidade}
                onChange={(e) => setForm(f => ({ ...f, visibilidade: e.target.value }))}
                className="w-full bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-100 outline-none focus:border-brand-500/50 transition-colors"
              >
                <option value="todos" className="bg-dark-300">Público (todos)</option>
                <option value="filiais" className="bg-dark-300">Filiais</option>
                <option value="admin" className="bg-dark-300">Admin apenas</option>
              </select>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-semibold text-ink-400 hover:text-ink-100 hover:bg-white/[0.04] transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {loading ? 'Enviando...' : 'Fazer Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Modal de Edição ──────────────────────────────────── */
function EditModal({ doc, onClose, onSalvo }) {
  const [form, setForm] = useState({
    titulo: doc.titulo || '',
    descricao: doc.descricao || '',
    categoria: doc.categoria || 'Outro',
    visibilidade: doc.visibilidade || 'todos',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim()) return toast.error('Título é obrigatório.');
    setLoading(true);
    try {
      const res = await fetch(`/api/documentos/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao salvar');
      toast.success('Documento atualizado!');
      onSalvo(data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-dark-300 border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-scale">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-black text-ink-100">Editar Documento</h2>
            <p className="text-xs text-ink-600 mt-0.5 truncate max-w-[260px]">{doc.arquivo_nome}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-white/[0.07] flex items-center justify-center text-ink-500 hover:text-ink-100 transition-all">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-1.5 block">Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-100 outline-none focus:border-brand-500/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-1.5 block">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
              rows={2}
              className="w-full bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-100 outline-none focus:border-brand-500/50 transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-1.5 block">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="w-full bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-100 outline-none focus:border-brand-500/50 transition-colors"
              >
                {CATEGORIAS.map(c => <option key={c} value={c} className="bg-dark-300">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-1.5 block">Visibilidade</label>
              <select
                value={form.visibilidade}
                onChange={(e) => setForm(f => ({ ...f, visibilidade: e.target.value }))}
                className="w-full bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-100 outline-none focus:border-brand-500/50 transition-colors"
              >
                <option value="todos" className="bg-dark-300">Público</option>
                <option value="filiais" className="bg-dark-300">Filiais</option>
                <option value="admin" className="bg-dark-300">Admin apenas</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-semibold text-ink-400 hover:text-ink-100 hover:bg-white/[0.04] transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Card de Documento ───────────────────────────────── */
function DocCard({ doc, isAdmin, onEdit, onDelete }) {
  const cat = CAT_STYLE[doc.categoria] ?? CAT_STYLE['Outro'];
  const CatIcon = cat.icon;
  const FileIcon = getFileIcon(doc.arquivo_tipo);
  const vis = VIS_LABEL[doc.visibilidade] ?? VIS_LABEL.todos;
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir "${doc.titulo}"? Esta ação é irreversível.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documentos/${doc.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.erro || 'Erro ao excluir');
      }
      toast.success('Documento excluído.');
      onDelete(doc.id);
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="animate-fade-in-up group bg-dark-200 border border-dark-50/60 rounded-2xl p-5
                    hover:-translate-y-1 hover:shadow-xl hover:border-dark-50 transition-all duration-300 flex flex-col gap-4">
      {/* Topo: ícone + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${cat.bg}`}>
          <FileIcon size={22} className={cat.color} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cat.bg} ${cat.color}`}>
            {doc.categoria}
          </span>
          {isAdmin && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${vis.bg} ${vis.color}`}>
              {vis.label}
            </span>
          )}
        </div>
      </div>

      {/* Título e descrição */}
      <div className="flex-1">
        <h3 className="text-sm font-bold text-ink-100 leading-snug group-hover:text-brand-300 transition-colors line-clamp-2">
          {doc.titulo}
        </h3>
        {doc.descricao && (
          <p className="text-xs text-ink-600 mt-1 line-clamp-2">{doc.descricao}</p>
        )}
      </div>

      {/* Metadados */}
      <div className="flex items-center gap-3 text-[10px] text-ink-600 font-medium">
        <span>{formatBytes(doc.arquivo_size)}</span>
        <span className="w-1 h-1 bg-dark-50 rounded-full" />
        <span>{formatDate(doc.created_at)}</span>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
        <a
          href={doc.arquivo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-bold transition-all"
        >
          <Download size={13} /> Baixar
        </a>
        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(doc)}
              className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-ink-500 hover:text-ink-100 flex items-center justify-center transition-all"
              title="Editar"
            >
              <Edit size={13} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-9 h-9 rounded-xl bg-red-500/5 hover:bg-red-500/15 text-red-500/60 hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-40"
              title="Excluir"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════ */
export default function DocumentosPage() {
  const { tipo } = useAuth();
  const isAdmin = tipo === 'admin';

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editDoc, setEditDoc] = useState(null);

  async function carregar() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroCategoria) params.set('categoria', filtroCategoria);
      if (busca) params.set('q', busca);

      const res = await fetch(`/api/documentos?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar documentos');
      const data = await res.json();
      setDocumentos(data.documentos || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [filtroCategoria]);

  // Busca local (sem re-fetch a cada tecla)
  const docsFiltrados = busca
    ? documentos.filter(d =>
        d.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        d.descricao?.toLowerCase().includes(busca.toLowerCase())
      )
    : documentos;

  // Stats por categoria
  const stats = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = documentos.filter(d => d.categoria === cat).length;
    return acc;
  }, {});

  function handleSalvo(novoDoc) {
    setDocumentos(prev => [novoDoc, ...prev]);
  }

  function handleEditSalvo(docAtualizado) {
    setDocumentos(prev => prev.map(d => d.id === docAtualizado.id ? docAtualizado : d));
  }

  function handleDeleted(id) {
    setDocumentos(prev => prev.filter(d => d.id !== id));
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 w-full">

      {/* Header */}
      <div className="animate-fade-in-up flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-ink-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500/10 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-brand-400" />
            </div>
            Documentos
          </h1>
          <p className="text-sm text-ink-600 mt-1 ml-12">Repositório oficial de documentos da Federação Baiana de Karatê Goju-Ryu</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5"
          >
            <Upload size={15} /> Novo documento
          </button>
        )}
      </div>

      {/* Stat Cards por categoria */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard label="Regulamentos" value={loading ? '—' : stats['Regulamento']} icon={BookOpen}     color="brand" loading={loading} />
        <StatCard label="Formulários"  value={loading ? '—' : stats['Formulário']}  icon={FileText}    color="blue"  loading={loading} />
        <StatCard label="Atas"         value={loading ? '—' : stats['Ata']}         icon={ClipboardList} color="gold"  loading={loading} />
        <StatCard label="Certificados" value={loading ? '—' : stats['Certificado']} icon={Star}        color="green" loading={loading} />
        <StatCard label="Total"        value={loading ? '—' : documentos.length}    icon={FileArchive} color="brand" loading={loading} />
      </div>

      {/* Filtros */}
      <div className="animate-fade-in-up flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar documento..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-dark-200 border border-white/[0.08] rounded-xl text-ink-100 placeholder:text-ink-600 outline-none focus:border-brand-500/50 transition-colors"
          />
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="bg-dark-200 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink-300 outline-none focus:border-brand-500/50 transition-colors sm:w-52"
        >
          <option value="" className="bg-dark-300">Todas as categorias</option>
          {CATEGORIAS.map(c => <option key={c} value={c} className="bg-dark-300">{c}</option>)}
        </select>
        <div className="text-xs text-ink-500 font-bold px-1 whitespace-nowrap self-center">
          {docsFiltrados.length} documento(s)
        </div>
      </div>

      {/* Grid de Documentos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-dark-200 border border-dark-50/60 rounded-2xl p-5 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="w-12 h-12 bg-dark-300 rounded-2xl" />
                <div className="w-20 h-5 bg-dark-300 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-dark-300 rounded-lg w-3/4" />
                <div className="h-3 bg-dark-300 rounded-lg w-1/2" />
              </div>
              <div className="h-9 bg-dark-300 rounded-xl" />
            </div>
          ))}
        </div>
      ) : docsFiltrados.length === 0 ? (
        <div className="bg-dark-200 border border-dark-50/60 rounded-3xl flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={28} className="text-brand-400/60" />
          </div>
          <h2 className="text-base font-bold text-ink-300 mb-2">
            {busca || filtroCategoria ? 'Nenhum documento encontrado' : 'Nenhum documento cadastrado'}
          </h2>
          <p className="text-sm text-ink-600 max-w-sm">
            {busca || filtroCategoria
              ? 'Tente ajustar os filtros ou a busca.'
              : isAdmin
                ? 'Clique em "Novo documento" para fazer o primeiro upload.'
                : 'Aguarde a publicação de documentos pelo administrador.'
            }
          </p>
          {isAdmin && !busca && !filtroCategoria && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-all"
            >
              <Upload size={15} /> Fazer primeiro upload
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {docsFiltrados.map((doc, i) => (
            <DocCard
              key={doc.id}
              doc={doc}
              isAdmin={isAdmin}
              onEdit={setEditDoc}
              onDelete={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onSalvo={handleSalvo} />
      )}
      {editDoc && (
        <EditModal doc={editDoc} onClose={() => setEditDoc(null)} onSalvo={handleEditSalvo} />
      )}
    </main>
  );
}
