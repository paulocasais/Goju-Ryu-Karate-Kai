'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { validateCPF } from '@/lib/utils';
import { toast } from 'sonner';
import {
  User, Card, ShieldCheck, MapPin, Building,
  Calendar, Loader2, Save, BadgeCheck, FileText,
  Briefcase
} from 'lucide-react';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarCep(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
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

const isMenorDeIdade = (dataNascimento) => {
  if (!dataNascimento) return false;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade < 18;
};

export default function CompletarCadastroPage() {
  const { usuario, tipo, carregando, recarregarSessao } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    cpf: '',
    sexo: 'M',
    data_nascimento: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: 'BA',
    nome_professor: '',
    filial_id: '',
    responsavel_nome: '',
    responsavel_cpf: '',
    responsavel_email: '',
    responsavel_telefone: '',
  });

  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Carregar filiais ativas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/filiais?status=ativo');
        const data = await res.json();
        if (res.ok) {
          setFiliais(data.filiais || []);
        }
      } catch (err) {
        console.error('Erro ao buscar filiais:', err);
      } finally {
        setLoadingFiliais(false);
      }
    })();
  }, []);

  // Proteger rota se não for atleta ou não tiver CPF temporário
  useEffect(() => {
    if (!carregando) {
      if (tipo !== 'atleta') {
        router.replace('/home');
      } else if (usuario && !usuario.cpf?.startsWith('TEMP-')) {
        router.replace('/home');
      }
    }
  }, [carregando, tipo, usuario, router]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCpfChange = (e) => {
    setForm(prev => ({ ...prev, cpf: formatarCPF(e.target.value) }));
  };

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setForm(prev => ({ ...prev, cep: formatarCep(value) }));

    if (value.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setForm(prev => ({
              ...prev,
              endereco: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              uf: data.uf || ''
            }));
            toast.success('Endereço preenchido via CEP.');
          }
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!validateCPF(form.cpf)) {
      toast.error('CPF inválido. Por favor, verifique.');
      return;
    }
    if (!form.data_nascimento) {
      toast.error('Data de nascimento é obrigatória.');
      return;
    }
    if (!form.filial_id) {
      toast.error('Por favor, selecione seu Dojo/Filial.');
      return;
    }

    const menor = isMenorDeIdade(form.data_nascimento);
    if (menor) {
      if (!form.responsavel_nome?.trim()) {
        toast.error('Nome do responsável é obrigatório para menores de idade.');
        return;
      }
      if (!validateCPF(form.responsavel_cpf)) {
        toast.error('CPF do responsável inválido. Por favor, verifique.');
        return;
      }
      if (!form.responsavel_email?.trim()) {
        toast.error('E-mail do responsável é obrigatório para menores de idade.');
        return;
      }
      if (!form.responsavel_telefone?.trim()) {
        toast.error('Telefone do responsável é obrigatório para menores de idade.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const fullAddress = `${form.endereco}, ${form.numero}${form.bairro ? ` - ${form.bairro}` : ''}`;
      const payload = {
        cpf: form.cpf,
        sexo: form.sexo,
        data_nascimento: form.data_nascimento,
        endereco: fullAddress,
        cidade: form.cidade,
        uf: form.uf,
        nome_professor: form.nome_professor.trim() || null,
        filial_id: form.filial_id,
        responsavel_nome: menor ? form.responsavel_nome.trim() : null,
        responsavel_cpf: menor ? form.responsavel_cpf.trim() : null,
        responsavel_email: menor ? form.responsavel_email.trim() : null,
        responsavel_telefone: menor ? form.responsavel_telefone.replace(/\D/g, '') : null,
      };

      const res = await fetch(`/api/atletas/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Falha ao atualizar dados.');

      toast.success('Perfil concluído com sucesso!');
      await recarregarSessao();
      router.push('/home');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (carregando || !usuario) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-gold" size={28} />
      </div>
    );
  }

  return (
    <main className="p-6 lg:p-10 space-y-8 w-full max-w-4xl mx-auto">
      {/* Title */}
      <div className="animate-fade-in-up">
        <p className="text-gold font-cinzel text-xs tracking-[0.25em] uppercase mb-2">Bem-vindo à Federação</p>
        <h1 className="font-cinzel text-3xl text-white font-bold tracking-wide">Conclusão de Perfil</h1>
        <p className="text-sm text-gray-500 mt-2 font-body max-w-xl">
          Seu cadastro foi **aprovado**! Agora, preencha os dados restantes abaixo para liberar o acesso ao painel de controle e emitir sua carteirinha digital de atleta.
        </p>
        <div className="w-12 h-0.5 bg-gold mt-5 animate-width-grow" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up delay-100">
        
        {/* Bloco 1: Dados Pessoais */}
        <div className="bg-dark-card border border-dark-border p-6 md:p-8 space-y-5 rounded-none">
          <h2 className="font-cinzel text-sm font-bold text-white uppercase tracking-widest border-b border-dark-border pb-3 flex items-center gap-2">
            <User size={16} className="text-gold" />
            Dados Pessoais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CPF */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">CPF *</label>
              <input
                required
                type="text"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={handleCpfChange}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors font-mono"
              />
            </div>

            {/* Sexo */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Sexo *</label>
              <select
                required
                value={form.sexo}
                onChange={handleChange('sexo')}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Nascimento */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Data de Nascimento *</label>
              <input
                required
                type="date"
                value={form.data_nascimento}
                onChange={handleChange('data_nascimento')}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bloco: Responsável Legal (Visível apenas para menores de idade) */}
        {isMenorDeIdade(form.data_nascimento) && (
          <div className="bg-dark-card border border-dark-border p-6 md:p-8 space-y-5 rounded-none animate-fade-in-up">
            <h2 className="font-cinzel text-sm font-bold text-white uppercase tracking-widest border-b border-dark-border pb-3 flex items-center gap-2">
              <User size={16} className="text-gold" />
              Responsável Legal (Menor de Idade)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nome do Responsável */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Nome do Responsável *</label>
                <input
                  required
                  type="text"
                  placeholder="Nome completo do pai, mãe ou responsável legal"
                  value={form.responsavel_nome}
                  onChange={handleChange('responsavel_nome')}
                  className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* CPF do Responsável */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">CPF do Responsável *</label>
                <input
                  required
                  type="text"
                  placeholder="000.000.000-00"
                  value={form.responsavel_cpf}
                  onChange={(e) => setForm(prev => ({ ...prev, responsavel_cpf: formatarCPF(e.target.value) }))}
                  className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors font-mono"
                />
              </div>

              {/* E-mail do Responsável */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">E-mail do Responsável *</label>
                <input
                  required
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.responsavel_email}
                  onChange={handleChange('responsavel_email')}
                  className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Telefone do Responsável */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Telefone do Responsável *</label>
                <input
                  required
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={form.responsavel_telefone}
                  onChange={(e) => setForm(prev => ({ ...prev, responsavel_telefone: formatarTelefone(e.target.value) }))}
                  className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bloco 2: Dojo & Afiliação */}
        <div className="bg-dark-card border border-dark-border p-6 md:p-8 space-y-5 rounded-none">
          <h2 className="font-cinzel text-sm font-bold text-white uppercase tracking-widest border-b border-dark-border pb-3 flex items-center gap-2">
            <Building size={16} className="text-gold" />
            Dojo & Filiação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Dojo / Filial */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Selecione seu Dojo (Filial) *</label>
              {loadingFiliais ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
                  <Loader2 size={12} className="animate-spin text-gold" /> Carregando filiais...
                </div>
              ) : (
                <select
                  required
                  value={form.filial_id}
                  onChange={handleChange('filial_id')}
                  className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="">Selecione...</option>
                  {filiais.map(f => (
                    <option key={f.id} value={f.id}>{f.nome} ({f.municipio || f.cidade || 'Bahia'})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Professor / Sensei */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Nome do Sensei / Professor</label>
              <input
                type="text"
                placeholder="Ex: Sensei Paulo Roberto"
                value={form.nome_professor}
                onChange={handleChange('nome_professor')}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Endereço */}
        <div className="bg-dark-card border border-dark-border p-6 md:p-8 space-y-5 rounded-none">
          <h2 className="font-cinzel text-sm font-bold text-white uppercase tracking-widest border-b border-dark-border pb-3 flex items-center gap-2">
            <MapPin size={16} className="text-gold" />
            Endereço Residencial
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {/* CEP */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">CEP</label>
              <input
                type="text"
                placeholder="00000-000"
                value={form.cep}
                onChange={handleCepChange}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors font-mono"
              />
            </div>

            {/* Rua */}
            <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Logradouro / Rua *</label>
              <input
                required
                type="text"
                placeholder="Rua, Avenida, etc."
                value={form.endereco}
                onChange={handleChange('endereco')}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            {/* Número */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Número *</label>
              <input
                required
                type="text"
                placeholder="S/N, 123, etc."
                value={form.numero}
                onChange={handleChange('numero')}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors font-mono"
              />
            </div>

            {/* Bairro */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Bairro</label>
              <input
                type="text"
                placeholder="Bairro"
                value={form.bairro}
                onChange={handleChange('bairro')}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            {/* Cidade */}
            <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1.5">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Cidade *</label>
              <input
                required
                type="text"
                placeholder="Cidade"
                value={form.cidade}
                onChange={handleChange('cidade')}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            {/* UF */}
            <div className="flex flex-col gap-2 md:col-span-0.5">
              <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">UF *</label>
              <select
                required
                value={form.uf}
                onChange={handleChange('uf')}
                className="w-full bg-dark border border-dark-border text-white px-4 py-3 text-xs focus:outline-none focus:border-gold transition-colors font-mono"
              >
                {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Botoes de Ação */}
        <div className="flex gap-4 justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gold text-white font-cinzel text-xs tracking-widest uppercase px-8 py-4 hover:bg-gold-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
          >
            {submitting ? (
              <><Loader2 size={14} className="animate-spin" /> Concluindo...</>
            ) : (
              <><BadgeCheck size={14} /> Concluir Cadastro</>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
