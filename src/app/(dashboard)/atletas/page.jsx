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
  Building2,
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

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
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
    filial_id: atleta?.filial_id || '',
    responsavel_nome: atleta?.responsavel_nome || '',
    responsavel_cpf: atleta?.responsavel_cpf ? formatarCPF(atleta.responsavel_cpf) : '',
    responsavel_email: atleta?.responsavel_email || '',
    responsavel_telefone: atleta?.responsavel_telefone ? formatarTelefone(atleta.responsavel_telefone) : '',
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
    return <span className="text-ink-500 italic text-xs">Nenhuma modalidade registrada</span>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {lista.map((item, index) => (
        <div
          key={`${item.modalidade}-${item.graduacao}-${item.data_graduacao}-${index}`}
          className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-dark-100/40 p-3 hover:border-gold-500/20 hover:bg-dark-100/70 transition-all duration-300 group"
        >
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-gold-500 to-amber-600 opacity-70 group-hover:h-full transition-all duration-300" />
          <div className="pl-2">
            <p className="text-[10px] font-black text-gold-400 uppercase tracking-[0.1em]">{item.modalidade}</p>
            <p className="text-sm font-bold text-ink-100 mt-0.5">{item.graduacao}</p>
            <p className="text-[10px] text-ink-500 mt-1 flex items-center gap-1">
              <Calendar size={10} className="text-ink-600" /> {formatarData(item.data_graduacao)}
            </p>
          </div>
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
  const { isAdmin } = useAuth();
  const [filiais, setFiliais] = useState([]);
  const [form, setForm] = useState(() => criarEstadoInicial(atleta));
  const [cpfErro, setCpfErro] = useState('');
  const [modalidadesErro, setModalidadesErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/filiais')
        .then((res) => res.json())
        .then((data) => setFiliais(data.filiais || []))
        .catch((err) => console.error('Erro ao buscar filiais:', err));
    }
  }, [isAdmin]);

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
      const idade = calcularIdade(form.data_nascimento);
      const menor = idade !== null && idade < 18;
      if (menor) {
        if (!form.responsavel_nome?.trim()) {
          toast.error('Nome do responsável é obrigatório para atletas menores.');
          return;
        }
        if (!validateCPF(form.responsavel_cpf)) {
          toast.error('CPF do responsável inválido. Por favor, verifique.');
          return;
        }
        if (!form.responsavel_email?.trim()) {
          toast.error('E-mail do responsável é obrigatório para atletas menores.');
          return;
        }
        if (!form.responsavel_telefone?.trim()) {
          toast.error('Telefone do responsável é obrigatório para atletas menores.');
          return;
        }
      }

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
        filial_id: form.filial_id || null,
        modalidades: normalizarModalidades(form.modalidades),
        responsavel_nome: menor ? form.responsavel_nome.trim() : null,
        responsavel_cpf: menor ? form.responsavel_cpf.trim() : null,
        responsavel_email: menor ? form.responsavel_email.trim() : null,
        responsavel_telefone: menor ? telefoneNumeros(form.responsavel_telefone) : null,
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

  const idade = calcularIdade(form.data_nascimento);
  const menor = idade !== null && idade < 18;
  const responsavelValido = !menor || (
    form.responsavel_nome?.trim() &&
    cpfNumeros(form.responsavel_cpf).length === 11 &&
    form.responsavel_email?.trim() &&
    telefoneNumeros(form.responsavel_telefone).length >= 10
  );

  const podeEnviar = (
    form.nome.trim() &&
    (modo === 'editar' || (cpfNumeros(form.cpf).length === 11 && !cpfErro)) &&
    telefoneNumeros(form.telefone).length >= 10 &&
    form.email.trim() &&
    responsavelValido &&
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
    <div className="relative overflow-hidden rounded-3xl bg-dark-200/95 border border-white/[0.08] shadow-2xl backdrop-blur-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto w-full">
      <div className="h-[3px] absolute top-0 left-0 right-0 tricolor-bar" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black font-cinzel text-ink-100 uppercase tracking-wider">{modo === 'novo' ? 'Novo Atleta' : 'Editar Atleta'}</h3>
          {modo === 'editar' && <p className="text-xs text-ink-500 font-mono mt-1">{atleta?.cpf}</p>}
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

        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">
              Filial / Dojo
            </label>
            <select
              className="input-field"
              value={form.filial_id}
              onChange={(e) => atualizarCampo('filial_id', e.target.value)}
            >
              <option value="">Nenhuma / Atleta Individual</option>
              {filiais.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bloco: Responsável Legal (Visível apenas para menores de idade) */}
        {(() => {
          const idade = calcularIdade(form.data_nascimento);
          return idade !== null && idade < 18 && (
            <div className="rounded-2xl border border-white/[0.06] bg-dark-400/60 p-4 space-y-4">
              <h4 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-bold">Responsável Legal (Menor de Idade)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5">Nome do Responsável *</label>
                  <input
                    required
                    className="input-field"
                    placeholder="Nome completo do responsável"
                    value={form.responsavel_nome}
                    onChange={(e) => atualizarCampo('responsavel_nome', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5">CPF do Responsável *</label>
                  <input
                    required
                    className="input-field font-mono"
                    placeholder="000.000.000-00"
                    value={form.responsavel_cpf}
                    onChange={(e) => atualizarCampo('responsavel_cpf', formatarCPF(e.target.value))}
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5">E-mail do Responsável *</label>
                  <input
                    required
                    type="email"
                    className="input-field"
                    placeholder="email@exemplo.com"
                    value={form.responsavel_email}
                    onChange={(e) => atualizarCampo('responsavel_email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5">Telefone do Responsável *</label>
                  <input
                    required
                    className="input-field font-mono"
                    placeholder="(00) 00000-0000"
                    value={form.responsavel_telefone}
                    onChange={(e) => atualizarCampo('responsavel_telefone', formatarTelefone(e.target.value))}
                  />
                </div>
              </div>
            </div>
          );
        })()}

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
  
  const modalidadePrincipal = atleta.modalidades?.[0];

  return (
    <div className={`group/card border border-white/[0.04] bg-dark-200/30 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 ${expandido ? 'border-gold-500/20 bg-dark-200/60 shadow-xl' : 'hover:border-white/[0.08] hover:bg-dark-200/50'}`}>
      <button
        className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.01] transition text-left"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-gold-500/15 to-gold-700/5 border border-gold-500/25 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover/card:border-gold-500/40 transition-colors">
          <span className="text-sm font-black text-gold-400 font-cinzel">
            {atleta.nome?.charAt(0)?.toUpperCase() ?? '?'}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-ink-100 group-hover/card:text-gold-400 transition-colors duration-300">{atleta.nome}</p>
            {modalidadePrincipal?.graduacao && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gold-500/10 text-gold-400 border border-gold-500/20">
                {modalidadePrincipal.graduacao}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-ink-500">
            <span className="flex items-center gap-1.5"><Phone size={12} className="text-ink-600" /> {formatarTelefone(atleta.telefone || '')}</span>
            <span className="hidden sm:inline text-ink-700">·</span>
            <span className="hidden sm:inline font-mono text-ink-600">{atleta.cpf}</span>
          </div>
        </div>
        
        <div className="text-xs text-ink-600 font-mono hidden sm:block bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">{atleta.cpf}</div>
        
        <div className="p-1 rounded-lg hover:bg-white/[0.05] transition">
          {expandido
            ? <ChevronUp size={16} className="text-ink-400 shrink-0" />
            : <ChevronDown size={16} className="text-ink-400 shrink-0" />
          }
        </div>
      </button>

      {expandido && (
        <div className="px-5 pb-5 border-t border-white/[0.04] pt-5 bg-dark-250/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {/* Col 1: Perfil */}
            <div className="space-y-3 bg-dark-300/40 p-4 rounded-xl border border-white/[0.03]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-400 flex items-center gap-1.5">
                <User size={12} /> Contato e Perfil
              </h4>
              <div className="space-y-2 text-xs text-ink-300">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">E-mail</span>
                  <span className="font-semibold text-ink-200 block truncate">{atleta.email || '—'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Sexo</span>
                    <span className="font-semibold text-ink-200">{{ M: 'Masculino', F: 'Feminino', Outro: 'Outro' }[atleta.sexo] ?? '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Nascimento</span>
                    <span className="font-semibold text-ink-200">{formatarData(atleta.data_nascimento)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2: Filiação */}
            <div className="space-y-3 bg-dark-300/40 p-4 rounded-xl border border-white/[0.03]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-400 flex items-center gap-1.5">
                <Building2 size={12} /> Filiação
              </h4>
              <div className="space-y-2 text-xs text-ink-300">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Filial / Dojo</span>
                  <span className="font-bold text-ink-200 block truncate">{atleta.filial_nome || 'Atleta Individual'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Professor</span>
                    <span className="font-semibold text-ink-200 block truncate">{atleta.nome_professor || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Cadastro</span>
                    <span className="font-semibold text-ink-200">{new Date(atleta.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 3: Localização */}
            <div className="space-y-3 bg-dark-300/40 p-4 rounded-xl border border-white/[0.03]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-400 flex items-center gap-1.5">
                <MapPin size={12} /> Localização
              </h4>
              <div className="space-y-2 text-xs text-ink-300">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Cidade / UF</span>
                  <span className="font-semibold text-ink-200 block">{atleta.cidade || atleta.uf ? `${atleta.cidade || '—'}${atleta.uf ? ` / ${atleta.uf}` : ''}` : '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Endereço</span>
                  <span className="font-semibold text-ink-250 block leading-relaxed truncate" title={atleta.endereco}>{atleta.endereco || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {((calcularIdade(atleta.data_nascimento) !== null && calcularIdade(atleta.data_nascimento) < 18) || atleta.responsavel_nome) && (
            <div className="mb-5 bg-dark-300/40 p-4 rounded-xl border border-white/[0.03] space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-400 flex items-center gap-1.5">
                <User size={12} /> Responsável Legal (Menor de Idade)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-ink-300">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Nome do Responsável</span>
                  <span className="font-bold text-ink-200 block truncate">{atleta.responsavel_nome || '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">CPF</span>
                  <span className="font-semibold text-ink-200 block font-mono">{atleta.responsavel_cpf || '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">E-mail</span>
                  <span className="font-semibold text-ink-200 block truncate">{atleta.responsavel_email || '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-ink-600 block">Telefone</span>
                  <span className="font-semibold text-ink-200 block">{atleta.responsavel_telefone ? formatarTelefone(atleta.responsavel_telefone) : '—'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-5 bg-dark-300/20 p-4 rounded-xl border border-white/[0.03]">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-400 block mb-3">Modalidades</span>
            <ResumoModalidades modalidades={atleta.modalidades} />
          </div>

          {atleta.senha_temporaria && (
            <div className="mb-5 bg-gold-500/[0.02] border border-gold-500/15 p-4 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                  <Key size={14} />
                </div>
                <div>
                  <span className="text-ink-400 text-[10px] block uppercase tracking-wider">Senha temporária pendente</span>
                  <strong className="text-gold-400 font-mono tracking-wider text-base">{atleta.senha_temporaria}</strong>
                </div>
              </div>
              <p className="text-[10px] text-ink-600 max-w-xs sm:text-right">
                O atleta usará este código para realizar o primeiro acesso ao sistema.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-5">
            <div className="flex items-center gap-4">
              {!confirmando ? (
                <>
                  <button
                    onClick={() => onEditar(atleta)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition uppercase tracking-wider"
                  >
                    <Pencil size={12} /> Editar dados
                  </button>
                  <div className="w-px h-3 bg-white/10" />
                  <button
                    onClick={() => setConfirmando(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition"
                  >
                    <Trash2 size={12} /> Remover atleta
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 bg-brand-900/10 border border-brand-500/20 px-3.5 py-1.5 rounded-lg text-xs">
                  <p className="text-ink-200">Confirmar exclusão?</p>
                  <button onClick={() => onDeletar(atleta.id)} className="text-brand-400 font-bold hover:text-brand-300 uppercase tracking-wider">
                    Sim, excluir
                  </button>
                  <span className="text-ink-700">|</span>
                  <button onClick={() => setConfirmando(false)} className="text-ink-400 hover:text-ink-300 font-semibold uppercase tracking-wider">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-[9px] font-black uppercase tracking-widest text-ink-600 bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded">
              {normalizarModalidades(atleta.modalidades).length} modalidade(s)
            </div>
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
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative">
      {/* Hero Banner Premium */}
      <div className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-brand-900/15 via-dark-200 to-dark-200 border border-brand-500/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute inset-0 bg-arena-grid opacity-[0.08] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-brand-500/[0.04] to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-500/25 to-brand-700/10 rounded-2xl flex items-center justify-center border border-brand-500/20 shrink-0">
              <Users size={24} className="text-brand-400" />
            </div>
            <div>
              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-[0.2em] mb-0.5">Painel Geral</p>
              <h1 className="text-2xl font-black text-ink-100 font-cinzel tracking-wide">ATLETAS</h1>
              <p className="text-xs text-ink-500 mt-0.5">
                Consulte, cadastre e gerencie a filiação técnica dos atletas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-ink-400 font-mono">
              {atletas.length} Cadastrado(s)
            </span>
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="bg-gradient-to-r from-gold-500 to-amber-600 hover:scale-[1.02] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition duration-300 flex items-center gap-2 shadow-lg shadow-gold-500/5"
            >
              <Plus size={14} />
              Novo atleta
            </button>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-overlay" onClick={() => setMostrarForm(false)} />
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-overlay" onClick={() => setAtletaEditando(null)} />
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

      {/* Barra de Filtro e Busca Premium */}
      <div className="relative bg-dark-200/50 backdrop-blur-xl border border-white/[0.04] p-4 rounded-2xl flex gap-3 shadow-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            className="w-full bg-dark-300/80 border border-white/[0.06] hover:border-white/[0.12] focus:border-gold-500/80 focus:ring-1 focus:ring-gold-500/20 text-ink-100 placeholder-ink-600 text-sm px-4 py-3 pl-11 rounded-xl transition duration-300 outline-none"
            placeholder="Buscar por nome, CPF, telefone, cidade ou professor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-500 flex items-center justify-center gap-2.5">
          <Loader2 size={20} className="animate-spin text-gold-400" /> Carregando atletas da federação...
        </div>
      ) : atletasFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-dark-200/20 border border-white/[0.04] rounded-2xl">
          <div className="w-14 h-14 bg-dark-400/80 border border-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4 text-ink-500 shadow-inner">
            <Users size={24} />
          </div>
          <p className="text-ink-400 text-sm font-medium">
            {busca ? 'Nenhum atleta encontrado para esta busca.' : 'Nenhum atleta cadastrado ainda.'}
          </p>
          {!busca && !mostrarForm && !isAdmin && (
            <button
              onClick={() => setMostrarForm(true)}
              className="mt-4 text-xs font-bold text-gold-400 hover:text-gold-300 uppercase tracking-wider transition"
            >
              Cadastrar primeiro atleta →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
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
