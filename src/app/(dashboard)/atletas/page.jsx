'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Trash2,
  X,
  Save,
  UserCheck,
  Phone,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Mail,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  Key,
  Pencil,
  MapPin,
  Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateCPF } from '@/lib/utils';
import { toast } from 'sonner';

const MODALIDADES_OPCOES = [
  'Karatê Goju-Ryu',
  'Point Fighting',
  'Light Contact',
  'Kick Light',
  'Full Contact',
  'Low Kick',
  'K-1 Rules',
  'Musical Forms',
  'Hard Styles',
];

const GRADUACOES_OPCOES = [
  'Branca',
  'Amarela',
  'Laranja',
  'Verde',
  'Azul',
  'Roxa',
  'Marrom',
  'Preta',
  'Preta 1º Dan',
  'Preta 2º Dan',
  'Preta 3º Dan',
  'Preta 4º Dan',
  'Preta 5º Dan',
  'Preta 6º Dan',
  'Preta 7º Dan',
  'Preta 8º Dan',
  'Preta 9º Dan',
  'Preta 10º Dan',
];

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

const cpfNumeros = (cpf) => cpf.replace(/\D/g, '');
const telefoneNumeros = (telefone) => telefone.replace(/\D/g, '');

function criarModalidade() {
  return { modalidade: '', graduacao: '', data_graduacao: '' };
}

function normalizarModalidades(modalidades = []) {
  if (!Array.isArray(modalidades)) return [];

  return modalidades
    .map((item) => ({
      modalidade: item?.modalidade || '',
      graduacao: item?.graduacao || '',
      data_graduacao: item?.data_graduacao || '',
    }))
    .filter((item) => item.modalidade || item.graduacao || item.data_graduacao);
}

function criarEstadoInicial(atleta = null) {
  return {
    cpf: atleta?.cpf || '',
    nome: atleta?.nome || '',
    sexo: atleta?.sexo || '',
    data_nascimento: atleta?.data_nascimento || '',
    telefone: atleta?.telefone ? formatarTelefone(atleta.telefone) : '',
    email: atleta?.email || '',
    uf: atleta?.uf || '',
    cidade: atleta?.cidade || '',
    endereco: atleta?.endereco || '',
    nome_professor: atleta?.nome_professor || '',
    modalidades: normalizarModalidades(atleta?.modalidades).length > 0
      ? normalizarModalidades(atleta?.modalidades)
      : [criarModalidade()],
  };
}

function formatarData(data) {
  if (!data) return '—';
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
}

function ResumoModalidades({ modalidades }) {
  const lista = normalizarModalidades(modalidades);

  if (lista.length === 0) {
    return <span className="text-ink-200">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {lista.map((item, index) => (
        <div
          key={`${item.modalidade}-${item.graduacao}-${item.data_graduacao}-${index}`}
          className="rounded-xl border border-cobalt-500/20 bg-cobalt-500/10 px-3 py-2"
        >
          <p className="text-xs font-semibold text-cobalt-300 uppercase tracking-wide">{item.modalidade}</p>
          <p className="text-sm text-ink-100">{item.graduacao}</p>
          <p className="text-xs text-ink-500 mt-0.5">{formatarData(item.data_graduacao)}</p>
        </div>
      ))}
    </div>
  );
}

function CampoModalidades({ modalidades, onChange, erro }) {
  const atualizarItem = (index, campo, valor) => {
    onChange(
      modalidades.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [campo]: valor } : item
      )
    );
  };

  const adicionar = () => onChange([...modalidades, criarModalidade()]);
  const remover = (index) => {
    if (modalidades.length === 1) {
      onChange([criarModalidade()]);
      return;
    }

    onChange(modalidades.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-ink-300">
          Modalidades
        </label>
        <button
          type="button"
          onClick={adicionar}
          className="inline-flex items-center gap-2 rounded-xl border border-cobalt-500/20 bg-cobalt-500/10 px-3 py-2 text-xs font-medium text-cobalt-300 hover:bg-cobalt-500/15 transition"
        >
          <Plus size={13} /> Adicionar modalidade
        </button>
      </div>

      <div className="space-y-3">
        {modalidades.map((item, index) => (
          <div key={index} className="rounded-2xl border border-white/[0.06] bg-dark-400/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Modalidade {index + 1}</p>
              <button
                type="button"
                onClick={() => remover(index)}
                className="p-2 rounded-lg text-ink-500 hover:text-brand-400 hover:bg-brand-500/10 transition"
                aria-label={`Remover modalidade ${index + 1}`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5">Modalidade</label>
                <select
                  className="input-field"
                  value={item.modalidade}
                  onChange={(e) => atualizarItem(index, 'modalidade', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {MODALIDADES_OPCOES.map((modalidade) => (
                    <option key={modalidade} value={modalidade}>{modalidade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5">Graduacao</label>
                <select
                  className="input-field"
                  value={item.graduacao}
                  onChange={(e) => atualizarItem(index, 'graduacao', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {GRADUACOES_OPCOES.map((graduacao) => (
                    <option key={graduacao} value={graduacao}>{graduacao}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5">Data da graduacao</label>
                <input
                  type="date"
                  className="input-field"
                  value={item.data_graduacao}
                  onChange={(e) => atualizarItem(index, 'data_graduacao', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {erro && (
        <p className="text-xs text-brand-400 flex items-center gap-1">
          <AlertCircle size={11} /> {erro}
        </p>
      )}
    </div>
  );
}

function FormAtleta({ modo, atleta = null, onSalvo, onCancelar }) {
  const [form, setForm] = useState(() => criarEstadoInicial(atleta));
  const [cpfErro, setCpfErro] = useState('');
  const [modalidadesErro, setModalidadesErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);

  const resetNovoCadastro = () => {
    setForm(criarEstadoInicial(null));
    setCpfErro('');
    setModalidadesErro('');
    setErro('');
    setResultado(null);
  };

  useEffect(() => {
    setForm(criarEstadoInicial(atleta));
    setCpfErro('');
    setModalidadesErro('');
    setErro('');
    setResultado(null);
  }, [atleta]);

  const validarCamposCPF = (valor) => {
    const nums = valor.replace(/\D/g, '');
    if (modo === 'editar') {
      setCpfErro('');
      return;
    }
    if (nums.length === 0) { setCpfErro(''); return; }
    if (nums.length < 11) { setCpfErro('CPF incompleto'); return; }
    if (!validateCPF(valor)) { setCpfErro('CPF invalido — verifique os digitos'); return; }
    setCpfErro('');
  };

  const validarModalidades = () => {
    const lista = normalizarModalidades(form.modalidades);

    if (lista.length === 0) {
      setModalidadesErro('');
      return true;
    }

    const incompleta = lista.some((item) => !item.modalidade || !item.graduacao || !item.data_graduacao);
    if (incompleta) {
      setModalidadesErro('Preencha modalidade, graduacao e data em cada item');
      return false;
    }

    setModalidadesErro('');
    return true;
  };

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modo === 'novo' && !validateCPF(form.cpf)) {
      setCpfErro('CPF invalido — verifique os digitos');
      return;
    }

    if (!validarModalidades()) return;

    setErro('');
    setLoading(true);

    try {
      const payload = {
        cpf: form.cpf,
        nome: form.nome,
        sexo: form.sexo,
        data_nascimento: form.data_nascimento,
        telefone: telefoneNumeros(form.telefone),
        email: form.email,
        uf: form.uf,
        cidade: form.cidade,
        endereco: form.endereco,
        nome_professor: form.nome_professor,
        modalidades: normalizarModalidades(form.modalidades),
      };

      const url = modo === 'novo' ? '/api/atletas' : `/api/atletas/${atleta.id}`;
      const method = modo === 'novo' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      if (modo === 'novo') {
        setResultado(data);
        toast.success('Atleta cadastrado com sucesso!');
      } else {
        toast.success('Dados do atleta atualizados!');
        onSalvo();
      }
    } catch (err) {
      setErro(err.message);
      toast.error(`${modo === 'novo' ? 'Erro ao cadastrar atleta' : 'Erro ao atualizar atleta'}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const podeEnviar = (
    form.nome.trim() &&
    (modo === 'editar' || (cpfNumeros(form.cpf).length === 11 && !cpfErro)) &&
    telefoneNumeros(form.telefone).length >= 10 &&
    form.email.trim() &&
    !loading
  );

  if (modo === 'novo' && resultado) {
    return (
      <div className="card p-6 border border-green-500/20 bg-green-500/5 shadow-2xl relative w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <UserCheck size={20} className="text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-100">Atleta cadastrado!</h3>
            <p className="text-sm text-ink-400">{resultado.atleta?.nome}</p>
          </div>
        </div>
        <div className="bg-dark-400 rounded-xl p-4 mb-4 space-y-2">
          <p className="text-sm text-ink-300">
            <span className="text-ink-500">Login (telefone):</span>{' '}
            <strong>{formatarTelefone(resultado.atleta?.telefone || '')}</strong>
          </p>
          <p className="text-sm text-ink-300">
            <span className="text-ink-500">Senha temporaria:</span>{' '}
            <strong className="text-gold-400 font-mono">{resultado.senhaTemporaria}</strong>
          </p>
          <p className="text-xs text-ink-500 mt-2">
            A senha foi enviada por e-mail ao atleta. Oriente-o a altera-la no primeiro acesso.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={resetNovoCadastro} className="btn-outline flex-1">Cadastrar outro</button>
          <button onClick={onSalvo} className="btn-primary flex-1">Concluir</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 shadow-2xl bg-dark-300 border border-white/[0.08] max-h-[90vh] overflow-y-auto w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-ink-100">{modo === 'novo' ? 'Novo Atleta' : 'Editar Atleta'}</h3>
          {modo === 'editar' && <p className="text-xs text-ink-500 font-mono mt-0.5">{atleta?.cpf}</p>}
        </div>
        <button onClick={onCancelar} className="p-2 rounded-lg hover:bg-dark-100 text-ink-400 transition">
          <X size={18} />
        </button>
      </div>

      {erro && (
        <div className="bg-brand-900/30 border border-brand-500/30 text-brand-300 text-sm p-3 rounded-xl mb-4">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {modo === 'novo' && (
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">
              CPF <span className="text-brand-400">*</span>
            </label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                required
                className={`input-field pl-10 transition-colors ${cpfErro ? 'border-brand-500/60' : ''}`}
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => {
                  const fmt = formatarCPF(e.target.value);
                  atualizarCampo('cpf', fmt);
                  if (cpfErro) validarCamposCPF(fmt);
                }}
                onBlur={(e) => validarCamposCPF(e.target.value)}
                maxLength={14}
                autoComplete="off"
              />
            </div>
            {cpfErro && (
              <p className="text-xs text-brand-400 mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> {cpfErro}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">
            Nome completo <span className="text-brand-400">*</span>
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              required
              className="input-field pl-10"
              placeholder="Nome completo"
              value={form.nome}
              onChange={(e) => atualizarCampo('nome', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">Sexo</label>
            <select
              className="input-field"
              value={form.sexo}
              onChange={(e) => atualizarCampo('sexo', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">
              <span className="flex items-center gap-1"><Calendar size={13} /> Nascimento</span>
            </label>
            <input
              type="date"
              className="input-field"
              value={form.data_nascimento}
              onChange={(e) => atualizarCampo('data_nascimento', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">
              Telefone (login) <span className="text-brand-400">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                required
                type="tel"
                className="input-field pl-10"
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={(e) => atualizarCampo('telefone', formatarTelefone(e.target.value))}
              />
            </div>
            <p className="text-xs text-ink-500 mt-1">O atleta usara este numero como login</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">
              Email <span className="text-brand-400">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                required
                type="email"
                className="input-field pl-10"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => atualizarCampo('email', e.target.value)}
              />
            </div>
          </div>
        </div>

        <CampoModalidades
          modalidades={form.modalidades}
          onChange={(modalidades) => {
            atualizarCampo('modalidades', modalidades);
            if (modalidadesErro) setModalidadesErro('');
          }}
          erro={modalidadesErro}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">UF</label>
            <select
              className="input-field"
              value={form.uf}
              onChange={(e) => atualizarCampo('uf', e.target.value)}
            >
              <option value="">Selecione</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">Cidade</label>
            <input
              className="input-field"
              placeholder="Cidade"
              value={form.cidade}
              onChange={(e) => atualizarCampo('cidade', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Endereco</label>
          <input
            className="input-field"
            placeholder="Rua, numero, bairro..."
            value={form.endereco}
            onChange={(e) => atualizarCampo('endereco', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Nome do professor</label>
          <input
            className="input-field"
            placeholder="Nome do professor"
            value={form.nome_professor}
            onChange={(e) => atualizarCampo('nome_professor', e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancelar} className="btn-outline flex-1">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!podeEnviar}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> {modo === 'novo' ? 'Cadastrando...' : 'Salvando...'}</>
            ) : (
              <><Save size={15} /> {modo === 'novo' ? 'Cadastrar atleta' : 'Salvar alteracoes'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function LinhaAtleta({ atleta, onDeletar, onEditar }) {
  const [expandido, setExpandido] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  return (
    <div className="border border-dark-50 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-4 hover:bg-dark-400/50 transition text-left"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="w-9 h-9 bg-brand-500/10 rounded-full flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-brand-400">
            {atleta.nome?.charAt(0)?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink-100 truncate">{atleta.nome}</p>
          <p className="text-sm text-ink-400">{formatarTelefone(atleta.telefone || '')}</p>
        </div>
        <div className="text-xs text-ink-500 hidden sm:block">{atleta.cpf}</div>
        {expandido
          ? <ChevronUp size={16} className="text-ink-500 shrink-0" />
          : <ChevronDown size={16} className="text-ink-500 shrink-0" />
        }
      </button>

      {expandido && (
        <div className="px-4 pb-4 border-t border-dark-50 pt-4 bg-dark-400/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-ink-500 text-xs uppercase tracking-wider block mb-0.5">Email</span>
              <span className="text-ink-200">{atleta.email || '—'}</span>
            </div>
            <div>
              <span className="text-ink-500 text-xs uppercase tracking-wider block mb-0.5">Sexo</span>
              <span className="text-ink-200">
                {{ M: 'Masculino', F: 'Feminino', Outro: 'Outro' }[atleta.sexo] ?? '—'}
              </span>
            </div>
            <div>
              <span className="text-ink-500 text-xs uppercase tracking-wider block mb-0.5">Nascimento</span>
              <span className="text-ink-200">{formatarData(atleta.data_nascimento)}</span>
            </div>
            <div>
              <span className="text-ink-500 text-xs uppercase tracking-wider block mb-0.5">Filial</span>
              <span className="text-ink-200">{atleta.filial_nome || '—'}</span>
            </div>
            <div>
              <span className="text-ink-500 text-xs uppercase tracking-wider block mb-0.5">Professor</span>
              <span className="text-ink-200">{atleta.nome_professor || '—'}</span>
            </div>
            <div>
              <span className="text-ink-500 text-xs uppercase tracking-wider block mb-0.5">Cadastro</span>
              <span className="text-ink-200">{new Date(atleta.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-ink-500 text-xs uppercase tracking-wider block mb-1">Endereco</span>
              <div className="flex items-start gap-2 text-ink-200">
                <Home size={14} className="mt-0.5 text-ink-500 shrink-0" />
                <span>{atleta.endereco || '—'}</span>
              </div>
            </div>
            <div>
              <span className="text-ink-500 text-xs uppercase tracking-wider block mb-1">Cidade / UF</span>
              <div className="flex items-start gap-2 text-ink-200">
                <MapPin size={14} className="mt-0.5 text-ink-500 shrink-0" />
                <span>{atleta.cidade || atleta.uf ? `${atleta.cidade || '—'}${atleta.uf ? ` / ${atleta.uf}` : ''}` : '—'}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-ink-500 text-xs uppercase tracking-wider block mb-2">Modalidades</span>
            <ResumoModalidades modalidades={atleta.modalidades} />
          </div>

          {atleta.senha_temporaria && (
            <div className="mb-4 bg-dark-500/50 border border-gold-500/20 p-3 rounded-lg text-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key size={14} className="text-gold-400" />
                <span className="text-ink-300">Senha temporaria pendente:</span>
                <strong className="text-gold-400 font-mono tracking-wider text-base">{atleta.senha_temporaria}</strong>
              </div>
              <p className="text-[10px] text-ink-500 hidden sm:block">Aguardando troca pelo atleta</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            {!confirmando ? (
              <>
                <button
                  onClick={() => onEditar(atleta)}
                  className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition font-medium"
                >
                  <Pencil size={14} /> Editar dados
                </button>
                <div className="w-px h-3 bg-white/10" />
                <button
                  onClick={() => setConfirmando(true)}
                  className="flex items-center gap-2 text-sm text-brand-400 opacity-60 hover:opacity-100 transition"
                >
                  <Trash2 size={14} /> Remover atleta
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-sm text-ink-300">Confirmar remocao?</p>
                <button onClick={() => onDeletar(atleta.id)} className="text-sm text-brand-400 font-medium hover:text-brand-300">
                  Sim, remover
                </button>
                <button onClick={() => setConfirmando(false)} className="text-sm text-ink-500">
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AtletasPage() {
  const { isAdmin } = useAuth();
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [atletaEditando, setAtletaEditando] = useState(null);

  const carregarAtletas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/atletas', { credentials: 'include' });
      const data = await res.json();
      setAtletas(data.atletas ?? []);
    } catch {
      setAtletas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarAtletas();
  }, [carregarAtletas]);

  const deletarAtleta = async (id) => {
    try {
      const res = await fetch(`/api/atletas/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || 'Erro ao remover');
      }
      setAtletas((prev) => prev.filter((a) => a.id !== id));
      toast.success('Atleta removido com sucesso');
    } catch (err) {
      toast.error('Erro ao remover atleta: ' + err.message);
    }
  };

  const atletasFiltrados = atletas.filter((a) => {
    const q = busca.toLowerCase();
    return (
      a.nome?.toLowerCase().includes(q) ||
      a.cpf?.includes(q) ||
      a.telefone?.includes(q) ||
      a.cidade?.toLowerCase().includes(q) ||
      a.nome_professor?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-100">Atletas</h1>
          <p className="text-ink-400 text-sm mt-1">
            {atletas.length} atleta{atletas.length !== 1 ? 's' : ''} cadastrado{atletas.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Novo atleta
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-overlay" onClick={() => setMostrarForm(false)} />
          <div className="relative w-full max-w-4xl z-10 page-enter">
            <FormAtleta
              modo="novo"
              onSalvo={() => { setMostrarForm(false); carregarAtletas(); }}
              onCancelar={() => setMostrarForm(false)}
            />
          </div>
        </div>
      )}

      {atletaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-overlay" onClick={() => setAtletaEditando(null)} />
          <div className="relative w-full max-w-4xl z-10 page-enter">
            <FormAtleta
              modo="editar"
              atleta={atletaEditando}
              onSalvo={() => { setAtletaEditando(null); carregarAtletas(); }}
              onCancelar={() => setAtletaEditando(null)}
            />
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          className="input-field pl-10"
          placeholder="Buscar por nome, CPF, telefone, cidade ou professor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-ink-400 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Carregando atletas...
        </div>
      ) : atletasFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-dark-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-ink-500" />
          </div>
          <p className="text-ink-400">
            {busca ? 'Nenhum atleta encontrado para esta busca' : 'Nenhum atleta cadastrado ainda'}
          </p>
          {!busca && !mostrarForm && !isAdmin && (
            <button
              onClick={() => setMostrarForm(true)}
              className="mt-4 text-brand-400 hover:text-brand-300 text-sm font-medium transition"
            >
              Cadastrar primeiro atleta →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {atletasFiltrados.map((a) => (
            <LinhaAtleta
              key={a.id}
              atleta={a}
              onDeletar={deletarAtleta}
              onEditar={(atl) => setAtletaEditando(atl)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
