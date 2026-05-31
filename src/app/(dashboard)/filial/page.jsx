'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Users, Phone, Mail, CheckCircle, Clock, XCircle,
  Pencil, Save, X, MapPin, Search, Shield, GraduationCap,
  CreditCard, Hash, Globe2, Loader2, ArrowUpRight, Medal,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { validateCPF, validateCNPJ } from '@/lib/utils';

/* ── Status config ─────────────────────────────────────────────── */
const STATUS_CONFIG = {
  aprovado: { label: 'Aprovada',            icon: CheckCircle, cls: 'text-green-400 bg-green-400/10 border-green-400/25' },
  ativo:    { label: 'Ativa',               icon: CheckCircle, cls: 'text-green-400 bg-green-400/10 border-green-400/25' },
  pendente: { label: 'Aguardando Aprovação', icon: Clock,       cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
  reprovado:{ label: 'Reprovada',           icon: XCircle,     cls: 'text-red-400 bg-red-400/10 border-red-400/25' },
};

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const GRADUACOES = [
  'Branca','Amarela','Laranja','Verde','Azul','Roxa','Marrom','Preta',
  'Preta 1º Dan','Preta 2º Dan','Preta 3º Dan','Preta 4º Dan',
  'Preta 5º Dan','Preta 6º Dan','Preta 7º Dan','Preta 8º Dan','Preta 9º Dan','Preta 10º Dan',
];

function formatPhone(v) {
  if (!v) return '—';
  const d = String(v).replace(/\D/g, '');
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function formatarCPF(v) {
  if (!v) return '';
  const d = String(v).replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarCNPJ(v) {
  if (!v) return '';
  const d = String(v).replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/* ── Field component ───────────────────────────────────────────── */
function Field({ label, value, editing, children }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ink-600 mb-1.5">{label}</p>
      {editing ? children : (
        <p className="text-sm font-medium text-ink-100">{value || '—'}</p>
      )}
    </div>
  );
}

/* ── Athlete row ───────────────────────────────────────────────── */
const FAIXA_DOT = {
  Branca:'bg-white border border-gray-300', Amarela:'bg-yellow-400', Laranja:'bg-orange-500',
  Verde:'bg-green-600', Azul:'bg-blue-600', Roxa:'bg-purple-700', Marrom:'bg-amber-800',
  Vermelha:'bg-red-600', Preta:'bg-gray-900 border border-gray-600',
};

function AtletaRow({ atleta }) {
  const nome = atleta.profiles?.nome ?? atleta.nome ?? 'Atleta';
  const iniciais = nome.split(' ').filter(Boolean).slice(0,2).map(p => p[0]).join('').toUpperCase();
  const faixa = atleta.faixa ?? null;
  const dotCls = faixa ? (FAIXA_DOT[faixa] ?? 'bg-dark-100') : 'bg-dark-100';
  const statusOk = atleta.status === 'ativo';

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-dark-300/60 border border-white/[0.04]
                    hover:-translate-y-0.5 hover:border-gold-500/15 transition-all duration-200 group">
      <div className="w-9 h-9 rounded-xl bg-gold-500/15 flex items-center justify-center shrink-0 text-xs font-black text-gold-300">
        {iniciais}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-100 truncate">{nome}</p>
        <p className="text-[11px] text-ink-600 truncate">{atleta.profiles?.email ?? atleta.email ?? ''}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {faixa && <div className={`w-3 h-3 rounded-full ${dotCls}`} title={faixa} />}
        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border
          ${statusOk ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
          {statusOk ? 'Ativo' : 'Pendente'}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function FilialPage() {
  const { usuario, atualizarUsuario } = useAuth();

  // ── Data ────────────────────────────────────────────────────
  const [atletas, setAtletas] = useState([]);
  const [busca, setBusca] = useState('');
  const [loadingAtletas, setLoadingAtletas] = useState(true);

  // ── Edit form ────────────────────────────────────────────────
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: '', nome_fantasia: '', telefone: '',
    cpf_responsavel: '', graduacao_responsavel: '', tipo: '', cnpj: '',
    cep: '', rua: '', numero: '', bairro: '', municipio: '', estado: '',
  });

  // ── Fetch atletas ────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/atletas', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setAtletas(d.atletas ?? []))
      .catch(() => setAtletas([]))
      .finally(() => setLoadingAtletas(false));
  }, []);

  // ── Open edit ────────────────────────────────────────────────
  const iniciarEdicao = useCallback(() => {
    setForm({
      nome:                   usuario?.nome ?? '',
      nome_fantasia:          usuario?.nome_fantasia ?? '',
      telefone:               usuario?.telefone ?? '',
      cpf_responsavel:        usuario?.cpf_responsavel ? formatarCPF(usuario.cpf_responsavel) : '',
      graduacao_responsavel:  usuario?.graduacao_responsavel ?? '',
      tipo:                   usuario?.tipo_filial ?? usuario?.tipo ?? '',
      cnpj:                   usuario?.cnpj ? formatarCNPJ(usuario.cnpj) : '',
      cep:                    usuario?.cep ?? '',
      rua:                    usuario?.rua ?? '',
      numero:                 usuario?.numero ?? '',
      bairro:                 usuario?.bairro ?? '',
      municipio:              usuario?.municipio ?? usuario?.cidade ?? '',
      estado:                 usuario?.estado ?? usuario?.uf ?? '',
    });
    setEditando(true);
  }, [usuario]);

  // ── Save ─────────────────────────────────────────────────────
  const salvar = async () => {
    if (!usuario?.id) return;
    
    // Validate CPF and CNPJ
    const cleanCpf = form.cpf_responsavel.replace(/\D/g, '');
    if (cleanCpf && !validateCPF(cleanCpf)) {
      toast.error('CPF do responsável inválido. Verifique os dígitos.');
      return;
    }
    
    const cleanCnpj = form.cnpj.replace(/\D/g, '');
    if (cleanCnpj && !validateCNPJ(cleanCnpj)) {
      toast.error('CNPJ inválido. Verifique os dígitos.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        ...form,
        cpf_responsavel: cleanCpf,
        cnpj: cleanCnpj,
      };
      const res = await fetch(`/api/filiais/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao salvar.');
      toast.success('Dados atualizados com sucesso!');
      setEditando(false);
      if (atualizarUsuario) {
        atualizarUsuario({
          ...usuario,
          ...payload,
          cidade: form.municipio,
          uf:     form.estado,
        });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSalvando(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────
  const statusKey  = usuario?.status ?? 'pendente';
  const statusConf = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pendente;
  const StatusIcon = statusConf.icon;
  const nome       = usuario?.nome ?? 'Filial';
  const nomeFant   = usuario?.nome_fantasia ?? '';
  const municipio  = usuario?.municipio ?? usuario?.cidade ?? '';
  const estado     = usuario?.estado ?? usuario?.uf ?? '';
  const localizacao = municipio || estado ? `${municipio}${estado ? ` / ${estado}` : ''}` : '—';

  const atletasFiltrados = atletas.filter(a => {
    if (!busca) return true;
    const n = (a.profiles?.nome ?? a.nome ?? '').toLowerCase();
    return n.includes(busca.toLowerCase());
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <main className="p-6 lg:p-10 space-y-8 w-full">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-gold-900/25 via-dark-200 to-dark-200
                      border border-gold-500/20 rounded-3xl p-8">
        <div className="absolute inset-0 bg-arena-grid opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-gold-500/[0.07] to-transparent pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-5 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-500/30 to-gold-700/15 rounded-2xl flex items-center
                            justify-center border border-gold-500/25 shrink-0">
              <Building2 size={28} className="text-gold-400" />
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-2 ${statusConf.cls}`}>
                <StatusIcon size={11} /> {statusConf.label}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink-100 leading-tight">{nome}</h1>
              {nomeFant && <p className="text-sm text-gold-400/70 font-medium mt-0.5">{nomeFant}</p>}
              <p className="text-xs text-ink-600 mt-1">Painel da Filial · Federação Baiana de Karatê Goju-Ryu</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
          {[
            { icon: Users,      label: 'Atletas',     value: loadingAtletas ? '—' : atletas.length },
            { icon: Mail,       label: 'E-mail',      value: usuario?.email ?? '—' },
            { icon: Phone,      label: 'Telefone',    value: formatPhone(usuario?.telefone) },
            { icon: MapPin,     label: 'Localização', value: localizacao },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-dark-400/60 backdrop-blur-sm border border-white/[0.05] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={11} className="text-gold-400/70" />
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-ink-700">{label}</p>
              </div>
              <p className="text-sm font-bold text-ink-200 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dados Cadastrais ─────────────────────────────────── */}
      <div className="animate-fade-in-up delay-100 bg-dark-200 border border-dark-50/60 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-dark-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-gold-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-100">Dados Cadastrais</h2>
              <p className="text-xs text-ink-600">Atualize as informações da sua filial</p>
            </div>
          </div>
          {!editando ? (
            <button onClick={iniciarEdicao}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 bg-gold-500/8
                         text-gold-400 text-sm font-semibold hover:bg-gold-500/15 transition-all duration-200">
              <Pencil size={14} /> Editar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditando(false)}
                className="p-2 rounded-xl hover:bg-dark-100 text-ink-500 hover:text-ink-200 transition">
                <X size={16} />
              </button>
              <button onClick={salvar} disabled={salvando}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 text-dark-400
                           text-sm font-bold hover:bg-gold-400 disabled:opacity-60 transition-all duration-200">
                {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Identidade */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-600 mb-3 flex items-center gap-1.5">
              <Globe2 size={10} /> Identidade
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Nome Oficial" value={nome} editing={editando}>
                <input className="input-field" value={form.nome} onChange={set('nome')} placeholder="Nome da filial" />
              </Field>
              <Field label="Nome Fantasia" value={usuario?.nome_fantasia} editing={editando}>
                <input className="input-field" value={form.nome_fantasia} onChange={set('nome_fantasia')} placeholder="Ex: Goju-Ryu Salvador" />
              </Field>
              <Field label="Tipo de Filial" value={usuario?.tipo_filial ?? usuario?.tipo} editing={editando}>
                <select className="input-field" value={form.tipo} onChange={set('tipo')}>
                  <option value="">Selecione</option>
                  <option value="vinculada">Vinculada</option>
                  <option value="afiliada">Afiliada</option>
                  <option value="associada">Associada</option>
                </select>
              </Field>
              <Field label="CNPJ" value={usuario?.cnpj ? formatarCNPJ(usuario.cnpj) : '—'} editing={editando}>
                <input className="input-field" value={form.cnpj} onChange={(e) => setForm(p => ({ ...p, cnpj: formatarCNPJ(e.target.value) }))} placeholder="00.000.000/0000-00" />
              </Field>
            </div>
          </div>

          {/* Responsável */}
          <div className="pt-4 border-t border-dark-50/40">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-600 mb-3 flex items-center gap-1.5">
              <Shield size={10} /> Responsável
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="CPF do Responsável" value={usuario?.cpf_responsavel ? formatarCPF(usuario.cpf_responsavel) : '—'} editing={editando}>
                <input className="input-field" value={form.cpf_responsavel} onChange={(e) => setForm(p => ({ ...p, cpf_responsavel: formatarCPF(e.target.value) }))} placeholder="000.000.000-00" />
              </Field>
              <Field label="Graduação" value={usuario?.graduacao_responsavel} editing={editando}>
                {editando ? (
                  <select className="input-field" value={form.graduacao_responsavel} onChange={set('graduacao_responsavel')}>
                    <option value="">Selecione</option>
                    {GRADUACOES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                ) : (
                  <p className="text-sm font-medium text-ink-100">{usuario?.graduacao_responsavel || '—'}</p>
                )}
              </Field>
              <Field label="Telefone" value={formatPhone(usuario?.telefone)} editing={editando}>
                <input className="input-field" value={form.telefone} onChange={set('telefone')} placeholder="(71) 99999-0000" />
              </Field>
            </div>
          </div>

          {/* Endereço */}
          <div className="pt-4 border-t border-dark-50/40">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-600 mb-3 flex items-center gap-1.5">
              <MapPin size={10} /> Endereço
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="CEP" value={usuario?.cep} editing={editando}>
                <input className="input-field" value={form.cep} onChange={set('cep')} placeholder="00000-000" />
              </Field>
              <Field label="Rua / Logradouro" value={usuario?.rua} editing={editando}>
                <input className="input-field" value={form.rua} onChange={set('rua')} placeholder="Av. Principal" />
              </Field>
              <Field label="Número" value={usuario?.numero} editing={editando}>
                <input className="input-field" value={form.numero} onChange={set('numero')} placeholder="100" />
              </Field>
              <Field label="Bairro" value={usuario?.bairro} editing={editando}>
                <input className="input-field" value={form.bairro} onChange={set('bairro')} placeholder="Centro" />
              </Field>
              <Field label="Município" value={municipio} editing={editando}>
                <input className="input-field" value={form.municipio} onChange={set('municipio')} placeholder="Salvador" />
              </Field>
              <Field label="Estado (UF)" value={estado} editing={editando}>
                <select className="input-field" value={form.estado} onChange={set('estado')}>
                  <option value="">Selecione</option>
                  {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* ── Atletas da Filial ────────────────────────────────── */}
      <div className="animate-fade-in-up delay-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink-100">Atletas da Filial</h2>
            <p className="text-xs text-ink-600 mt-0.5">
              {loadingAtletas ? 'Carregando…' : `${atletas.length} atleta${atletas.length !== 1 ? 's' : ''} cadastrado${atletas.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/atletas"
            className="flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 transition group">
            Ver todos <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600" />
          <input
            className="input-field pl-10 text-sm"
            placeholder="Buscar atleta..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        {loadingAtletas ? (
          <div className="space-y-2">
            {[0,1,2].map(i => <div key={i} className="h-14 rounded-2xl bg-dark-200 border border-dark-50/60 animate-pulse" />)}
          </div>
        ) : atletasFiltrados.length === 0 ? (
          <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-dark-300 border border-dark-50/40 flex items-center justify-center">
              <Users size={20} className="text-ink-700" />
            </div>
            <p className="text-sm text-ink-500 font-medium">
              {busca ? 'Nenhum atleta encontrado.' : 'Nenhum atleta cadastrado ainda.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {atletasFiltrados.slice(0, 10).map(a => (
              <AtletaRow key={a.id} atleta={a} />
            ))}
            {atletasFiltrados.length > 10 && (
              <p className="text-xs text-ink-600 text-center pt-2">
                +{atletasFiltrados.length - 10} atletas · <Link href="/atletas" className="text-gold-400 hover:text-gold-300 font-semibold transition">Ver todos</Link>
              </p>
            )}
          </div>
        )}
      </div>

    </main>
  );
}
