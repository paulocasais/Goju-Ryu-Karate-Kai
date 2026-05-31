'use client';

import { useState, useEffect } from 'react';
import {
  Key, Save, Loader2, Eye, EyeOff, User, Phone, Mail, Calendar,
  MapPin, Home, GraduationCap, Plus, X, Building2, ArrowUpRight, Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { validateCPF } from '@/lib/utils';

/* ══ Constantes atleta ═════════════════════════════════════════ */
const MODALIDADES_OPCOES = [
  'Karatê Goju-Ryu', 'Point Fighting', 'Light Contact', 'Kick Light', 'Full Contact',
  'Low Kick', 'K-1 Rules', 'Musical Forms', 'Hard Styles',
];
const GRADUACOES_OPCOES = [
  'Branca','Amarela','Laranja','Verde','Azul','Roxa','Marrom','Preta',
  'Preta 1º Dan','Preta 2º Dan','Preta 3º Dan','Preta 4º Dan',
  'Preta 5º Dan','Preta 6º Dan','Preta 7º Dan','Preta 8º Dan',
  'Preta 9º Dan','Preta 10º Dan',
];
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

function formatarTelefone(valor) {
  const n = valor.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  return n.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
}
function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function telefoneNumeros(v) { return v.replace(/\D/g, ''); }
function criarModalidade() { return { modalidade: '', graduacao: '', data_graduacao: '' }; }
function normalizarModalidades(m = []) {
  if (!Array.isArray(m)) return [];
  return m.map(i => ({ modalidade: i?.modalidade || '', graduacao: i?.graduacao || '', data_graduacao: i?.data_graduacao || '' }))
    .filter(i => i.modalidade || i.graduacao || i.data_graduacao);
}

/* ── Input de senha ─────────────────────────────────────────── */
function InputSenha({ label, value, onChange, placeholder, name, tipo, mostrarPwd, setMostrarPwd }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-300 mb-1.5">{label}</label>
      <div className="relative">
        <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          type={mostrarPwd[tipo] ? 'text' : 'password'}
          required
          className="input-field pl-10 pr-10"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={name}
        />
        <button
          type="button"
          tabIndex="-1"
          onClick={() => setMostrarPwd({ ...mostrarPwd, [tipo]: !mostrarPwd[tipo] })}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-400"
        >
          {mostrarPwd[tipo] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ── Campo Modalidades ──────────────────────────────────────── */
function CampoModalidades({ modalidades, onChange }) {
  const atualizar = (index, campo, valor) =>
    onChange(modalidades.map((item, i) => i === index ? { ...item, [campo]: valor } : item));
  const adicionar = () => onChange([...modalidades, criarModalidade()]);
  const remover = (index) => {
    if (modalidades.length === 1) { onChange([criarModalidade()]); return; }
    onChange(modalidades.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-ink-300">Modalidades</label>
        <button type="button" onClick={adicionar}
          className="inline-flex items-center gap-2 rounded-xl border border-cobalt-500/20 bg-cobalt-500/10 px-3 py-2 text-xs font-medium text-cobalt-300 hover:bg-cobalt-500/15 transition">
          <Plus size={13} /> Adicionar modalidade
        </button>
      </div>
      <div className="space-y-3">
        {modalidades.map((item, index) => (
          <div key={index} className="rounded-2xl border border-white/[0.06] bg-dark-300/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Modalidade {index + 1}</p>
              <button type="button" onClick={() => remover(index)}
                className="p-2 rounded-lg text-ink-500 hover:text-brand-400 hover:bg-brand-500/10 transition">
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="input-field" value={item.modalidade} onChange={(e) => atualizar(index, 'modalidade', e.target.value)}>
                <option value="">Selecione a modalidade</option>
                {MODALIDADES_OPCOES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="input-field" value={item.graduacao} onChange={(e) => atualizar(index, 'graduacao', e.target.value)}>
                <option value="">Selecione a graduacao</option>
                {GRADUACOES_OPCOES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input type="date" className="input-field" value={item.data_graduacao}
                onChange={(e) => atualizar(index, 'data_graduacao', e.target.value)}
                max={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SEÇÃO DE SENHA (usada por Atleta e Filial)
══════════════════════════════════════════════════════════════ */
function SenhaSection({ endpoint }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loadingSenha, setLoadingSenha] = useState(false);
  const [mostrarPwd, setMostrarPwd] = useState({ nova: false, confirm: false });

  const handleUpdateSenha = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) { toast.error('As senhas não coincidem.'); return; }
    if (novaSenha.length < 6) { toast.error('A senha deve ter no mínimo 6 caracteres.'); return; }

    setLoadingSenha(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      toast.success('Senha atualizada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingSenha(false);
    }
  };

  return (
    <div className="card p-6 bg-dark-200/50">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-50/60">
        <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center pt-0.5">
          <Key size={18} className="text-brand-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-100">Atualizar Senha</h2>
          <p className="text-xs text-ink-500">Recomendamos usar uma senha segura que você não use em outro lugar.</p>
        </div>
      </div>

      <form onSubmit={handleUpdateSenha} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputSenha label="Nova senha" placeholder="Digite a nova senha" value={novaSenha}
            onChange={setNovaSenha} name="new-password" tipo="nova" mostrarPwd={mostrarPwd} setMostrarPwd={setMostrarPwd} />
          <InputSenha label="Confirmar nova senha" placeholder="Digite novamente" value={confirmarSenha}
            onChange={setConfirmarSenha} name="new-password" tipo="confirm" mostrarPwd={mostrarPwd} setMostrarPwd={setMostrarPwd} />
        </div>
        <div className="pt-3">
          <button type="submit" disabled={loadingSenha || !novaSenha || !confirmarSenha}
            className="btn-primary w-full sm:w-auto px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loadingSenha ? <><Loader2 size={16} className="animate-spin" /> Atualizando...</> : <><Save size={16} /> Salvar nova senha</>}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONFIGURAÇÕES — FILIAL
══════════════════════════════════════════════════════════════ */
function FilialConfiguracoes({ usuario }) {
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
      <div>
        <h1 className="text-2xl font-bold text-ink-100">Configurações</h1>
        <p className="text-ink-400 text-sm mt-1">Gerencie a segurança da conta da sua filial.</p>
      </div>

      {/* Link para editar dados cadastrais */}
      <Link href="/filial"
        className="flex items-center justify-between p-5 bg-dark-200/50 border border-gold-500/15 rounded-2xl
                   hover:border-gold-500/30 hover:bg-gold-500/5 transition-all duration-200 group">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center">
            <Building2 size={18} className="text-gold-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-100">Dados Cadastrais da Filial</p>
            <p className="text-xs text-ink-500 mt-0.5">Edite nome, endereço, responsável e demais informações em Minha Filial</p>
          </div>
        </div>
        <ArrowUpRight size={16} className="text-gold-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
      </Link>

      {/* Troca de senha */}
      <SenhaSection endpoint="/api/filiais/configuracoes" />
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONFIGURAÇÕES — ATLETA
══════════════════════════════════════════════════════════════ */
/* Helper Field component for AtletaConfiguracoes */
const AtletaField = ({ label, value, editing, children }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ink-600 mb-1.5">{label}</p>
    {editing ? children : (
      <p className="text-sm font-medium text-ink-100">{value || '—'}</p>
    )}
  </div>
);

function AtletaConfiguracoes({ usuario, atualizarUsuario }) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [nomeProfessor, setNomeProfessor] = useState('');
  const [modalidades, setModalidades] = useState([criarModalidade()]);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [mostrarPwdAtleta, setMostrarPwdAtleta] = useState({ atual: false, nova: false, confirm: false });
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenhaAtleta, setNovaSenhaAtleta] = useState('');
  const [confirmarSenhaAtleta, setConfirmarSenhaAtleta] = useState('');
  const [loadingSenha, setLoadingSenha] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || usuario.name || '');
      setEmail(usuario.email || '');
      setTelefone(usuario.telefone ? formatarTelefone(usuario.telefone) : '');
      setCpf(usuario.cpf && !usuario.cpf.startsWith('TEMP-') ? formatarCPF(usuario.cpf) : '');
      setSexo(usuario.sexo || '');
      setDataNascimento(usuario.data_nascimento || '');
      setUf(usuario.uf || '');
      setCidade(usuario.cidade || '');
      setEndereco(usuario.endereco || '');
      setNomeProfessor(usuario.nome_professor || '');
      setModalidades(normalizarModalidades(usuario.modalidades).length > 0 ? normalizarModalidades(usuario.modalidades) : [criarModalidade()]);
    }
  }, [usuario]);

  const handleUpdatePerfil = async (e) => {
    if (e) e.preventDefault();
    if (cpf && !validateCPF(cpf)) {
      toast.error('CPF inválido. Por favor, verifique os dígitos.');
      return;
    }
    setLoadingPerfil(true);
    try {
      if (!usuario?.id) throw new Error('ID do usuário não identificado.');
      const payload = {
        nome, email, telefone: telefoneNumeros(telefone), cpf, sexo,
        data_nascimento: dataNascimento, uf, cidade, endereco,
        nome_professor: nomeProfessor,
        modalidades: normalizarModalidades(modalidades),
      };
      const res = await fetch(`/api/atletas/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      toast.success('Dados atualizados com sucesso!');
      setEditando(false);
      if (atualizarUsuario) {
        atualizarUsuario({
          ...usuario,
          ...payload,
          faixa: payload.modalidades[0]?.graduacao || usuario.faixa
        });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPerfil(false);
    }
  };

  const handleUpdateSenha = async (e) => {
    e.preventDefault();
    if (novaSenhaAtleta !== confirmarSenhaAtleta) { toast.error('As senhas não coincidem.'); return; }
    if (novaSenhaAtleta.length < 6) { toast.error('A senha deve ter no mínimo 6 caracteres.'); return; }
    setLoadingSenha(true);
    try {
      const res = await fetch('/api/atletas/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha: novaSenhaAtleta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      toast.success('Senha atualizada com sucesso!');
      setSenhaAtual(''); setNovaSenhaAtleta(''); setConfirmarSenhaAtleta('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingSenha(false);
    }
  };



  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
      <div>
        <h1 className="text-2xl font-bold text-ink-100">Configurações</h1>
        <p className="text-ink-400 text-sm mt-1">Gerencie seus dados e a segurança da sua conta de atleta.</p>
      </div>

      <div className="space-y-6">
        {/* Meus Dados */}
        <div className="animate-fade-in-up bg-dark-200 border border-dark-50/60 rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-dark-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cobalt-500/10 rounded-xl flex items-center justify-center">
                <User size={18} className="text-cobalt-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink-100">Meus Dados</h2>
                <p className="text-xs text-ink-600">Atualize suas informações pessoais e graduações</p>
              </div>
            </div>
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cobalt-500/20 bg-cobalt-500/8
                           text-cobalt-400 text-sm font-semibold hover:bg-cobalt-500/15 transition-all duration-200"
              >
                <Pencil size={14} /> Editar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditando(false);
                    if (usuario) {
                      setNome(usuario.nome || usuario.name || '');
                      setEmail(usuario.email || '');
                      setTelefone(usuario.telefone ? formatarTelefone(usuario.telefone) : '');
                      setCpf(usuario.cpf || '');
                      setSexo(usuario.sexo || '');
                      setDataNascimento(usuario.data_nascimento || '');
                      setUf(usuario.uf || '');
                      setCidade(usuario.cidade || '');
                      setEndereco(usuario.endereco || '');
                      setNomeProfessor(usuario.nome_professor || '');
                      setModalidades(normalizarModalidades(usuario.modalidades).length > 0 ? normalizarModalidades(usuario.modalidades) : [criarModalidade()]);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-dark-100 text-ink-500 hover:text-ink-200 transition"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleUpdatePerfil}
                  disabled={loadingPerfil}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cobalt-500 text-white
                             text-sm font-bold hover:bg-cobalt-400 disabled:opacity-60 transition-all duration-200"
                >
                  {loadingPerfil ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {loadingPerfil ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Identidade */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-600 mb-3 flex items-center gap-1.5">
                <User size={10} /> Identidade
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AtletaField label="Nome Completo" value={nome} editing={editando}>
                  <input className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
                </AtletaField>
                <AtletaField label="CPF" value={cpf} editing={editando}>
                  <input className="input-field font-mono" value={cpf} onChange={(e) => setCpf(formatarCPF(e.target.value))} placeholder="000.000.000-00" />
                </AtletaField>
                <AtletaField label="Sexo" value={sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Feminino' : sexo} editing={editando}>
                  <select className="input-field" value={sexo} onChange={(e) => setSexo(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </AtletaField>
                <AtletaField label="Data de Nascimento" value={dataNascimento ? dataNascimento.split('-').reverse().join('/') : ''} editing={editando}>
                  <input type="date" className="input-field" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                </AtletaField>
              </div>
            </div>

            {/* Contato & Localização */}
            <div className="pt-4 border-t border-dark-50/40">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-600 mb-3 flex items-center gap-1.5">
                <Phone size={10} /> Contato & Localização
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AtletaField label="E-mail" value={email} editing={editando}>
                  <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                </AtletaField>
                <AtletaField label="Telefone" value={telefone} editing={editando}>
                  <input className="input-field" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} placeholder="(00) 00000-0000" />
                </AtletaField>
                <AtletaField label="Nome do Professor" value={nomeProfessor} editing={editando}>
                  <input className="input-field" value={nomeProfessor} onChange={(e) => setNomeProfessor(e.target.value)} placeholder="Nome do Sensei" />
                </AtletaField>
                <AtletaField label="UF" value={uf} editing={editando}>
                  <select className="input-field" value={uf} onChange={(e) => setUf(e.target.value)}>
                    <option value="">Selecione</option>
                    {UFS.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </AtletaField>
                <AtletaField label="Cidade" value={cidade} editing={editando}>
                  <input className="input-field" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Sua cidade" />
                </AtletaField>
                <AtletaField label="Endereço" value={endereco} editing={editando}>
                  <input className="input-field" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, complemento" />
                </AtletaField>
              </div>
            </div>

            {/* Modalidades & Graduações */}
            <div className="pt-4 border-t border-dark-50/40">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-600 mb-3 flex items-center gap-1.5">
                <GraduationCap size={10} /> Modalidades & Graduações
              </p>
              {editando ? (
                <CampoModalidades modalidades={modalidades} onChange={setModalidades} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {modalidades.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-dark-300/40 rounded-2xl border border-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cobalt-500/10 flex items-center justify-center text-cobalt-400 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink-100">{m.modalidade || '—'}</p>
                          <p className="text-xs text-ink-500">Graduação: <span className="text-cobalt-400 font-semibold">{m.graduacao || '—'}</span></p>
                        </div>
                      </div>
                      {m.data_graduacao && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-ink-600 bg-dark-400 px-2.5 py-1 rounded-xl">
                          {m.data_graduacao.split('-').reverse().join('/')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Senha (atleta — tem senha atual) */}
        <div className="card p-6 bg-dark-200/50">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-50/60">
            <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center pt-0.5">
              <Key size={18} className="text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink-100">Atualizar Senha</h2>
              <p className="text-xs text-ink-500">Recomendamos usar uma senha segura que você não use em outro lugar.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateSenha} className="space-y-5">
            <InputSenha label="Senha atual" placeholder="Digite a sua senha atual"
              value={senhaAtual} onChange={setSenhaAtual}
              name="current-password" tipo="atual" mostrarPwd={mostrarPwdAtleta} setMostrarPwd={setMostrarPwdAtleta} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-dark-50/60">
              <InputSenha label="Nova senha" placeholder="Digite a nova senha"
                value={novaSenhaAtleta} onChange={setNovaSenhaAtleta}
                name="new-password" tipo="nova" mostrarPwd={mostrarPwdAtleta} setMostrarPwd={setMostrarPwdAtleta} />
              <InputSenha label="Confirmar nova senha" placeholder="Digite novamente"
                value={confirmarSenhaAtleta} onChange={setConfirmarSenhaAtleta}
                name="new-password" tipo="confirm" mostrarPwd={mostrarPwdAtleta} setMostrarPwd={setMostrarPwdAtleta} />
            </div>
            <div className="pt-3">
              <button type="submit" disabled={loadingSenha || !senhaAtual || !novaSenhaAtleta || !confirmarSenhaAtleta}
                className="btn-primary w-full sm:w-auto px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loadingSenha ? <><Loader2 size={16} className="animate-spin" /> Atualizando...</> : <><Save size={16} /> Salvar nova senha</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXPORT PRINCIPAL — detecta tipo do usuário
══════════════════════════════════════════════════════════════ */
export default function ConfiguracoesPage() {
  const { usuario, tipo, atualizarUsuario } = useAuth();

  if (tipo === 'filial') {
    return <FilialConfiguracoes usuario={usuario} />;
  }

  return <AtletaConfiguracoes usuario={usuario} atualizarUsuario={atualizarUsuario} />;
}
