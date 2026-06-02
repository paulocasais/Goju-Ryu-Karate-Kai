'use client';

import { useState, useEffect } from 'react';
import {
  Trophy, Plus, Search, Filter, Calendar, User, Star, Clock,
  CheckCircle2, XCircle, AlertCircle, Trash2, Edit, Award,
  DollarSign, Check, Loader2, Building2, ChevronDown, ChevronRight, Flame
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

function formatDate(iso) {
  if (!iso) return 'A definir';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function ExamesPage() {
  const { usuario, tipo } = useAuth();
  const isAdmin = tipo === 'admin';
  const isFilial = tipo === 'filial';
  const isAtleta = tipo === 'atleta';

  const [exames, setExames] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [atletas, setAtletas] = useState([]); // Apenas para filiais selecionarem
  const [loading, setLoading] = useState(true);

  // Filtros e Modais
  const [exameFiltro, setExameFiltro] = useState('todos'); // todos, agendados, realizados
  const [busca, setBusca] = useState('');
  
  // Modais de Criação / Inscrição / Edição
  const [showNovoExameModal, setShowNovoExameModal] = useState(false);
  const [showInscricaoModal, setShowInscricaoModal] = useState(false);
  const [showEditarExameModal, setShowEditarExameModal] = useState(false);
  const [exameEmEdicao, setExameEmEdicao] = useState(null);
  
  // Modal de Avaliação de Banca (Admin)
  const [selectedCandidato, setSelectedCandidato] = useState(null);
  const [showBancaModal, setShowBancaModal] = useState(false);

  // Forms
  const [novoExameForm, setNovoExameForm] = useState({ titulo: '', descricao: '', data_exame: '', status: 'agendado' });
  const [inscricaoForm, setInscricaoForm] = useState({ exame_id: '', atleta_id: '', modalidade: 'Karatê Goju-Ryu', graduacao_pretendida: '' });
  const [editarExameForm, setEditarExameForm] = useState({ titulo: '', descricao: '', data_exame: '', status: 'agendado' });
  const [bancaForm, setBancaForm] = useState({ examinadores: '', nota_tecnica: '', nota_combate: '', nota_kata: '', parecer: '', aprovado: true });

  // Accordion de Candidatos por Exame (Admin)
  const [exameExpandidoId, setExameExpandidoId] = useState(null);
  const [activeTabMap, setActiveTabMap] = useState({});
  const [numBancadas, setNumBancadas] = useState(3);
  const [showBancaColetivaModal, setShowBancaColetivaModal] = useState(false);
  const [bancadaSelecionada, setBancadaSelecionada] = useState(null);
  const [exameSelecionadoParaBanca, setExameSelecionadoParaBanca] = useState(null);
  const [bancaColetivaForm, setBancaColetivaForm] = useState({ examinadores: '', alunos: {} });
  const [distributing, setDistributing] = useState(false);
  const [blackBelts, setBlackBelts] = useState([]);

  // Helper to toggle an examiner in a comma-separated text list
  const toggleExaminer = (name, currentText, isColetiva = false) => {
    const list = currentText
      ? currentText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const nameToToggle = name.startsWith('Sensei ') ? name : `Sensei ${name}`;
    const index = list.indexOf(nameToToggle);

    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(nameToToggle);
    }

    const newText = list.join(', ');
    if (isColetiva) {
      setBancaColetivaForm(prev => ({ ...prev, examinadores: newText }));
    } else {
      setBancaForm(prev => ({ ...prev, examinadores: newText }));
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [resExames, resCandidatos] = await Promise.all([
          fetch('/api/exames'),
          fetch('/api/exames/candidatos')
        ]);
        
        if (resExames.ok) {
          const data = await resExames.json();
          setExames(data.exames || []);
        }
        if (resCandidatos.ok) {
          const data = await resCandidatos.json();
          setCandidatos(data.candidatos || []);
        }

        // Se for filial, carregar atletas pertencentes a ela para o modal de inscrição
        if (isFilial) {
          const resAtletas = await fetch('/api/atletas');
          if (resAtletas.ok) {
            const data = await resAtletas.json();
            setAtletas(data.atletas || []);
          }
        }

        // Se for admin, carregar atletas para obter os faixas pretas (examinadores)
        if (isAdmin) {
          const resAtletas = await fetch('/api/atletas?limit=100');
          if (resAtletas.ok) {
            const data = await resAtletas.json();
            const list = data.atletas || [];
            const bbs = list.filter(a => a.faixa && a.faixa.toLowerCase().includes('preta'));
            setBlackBelts(bbs);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        toast.error('Erro ao carregar dados do painel.');
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [isFilial, isAdmin]);

  // Handler criar novo exame (Admin)
  const handleCriarExame = async (e) => {
    e.preventDefault();
    if (!novoExameForm.titulo || !novoExameForm.data_exame) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    try {
      const res = await fetch('/api/exames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoExameForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      setExames(prev => [data, ...prev]);
      setShowNovoExameModal(false);
      setNovoExameForm({ titulo: '', descricao: '', data_exame: '', status: 'agendado' });
      toast.success('Exame agendado com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao criar exame.');
    }
  };

  // Handler abrir edição do exame (Admin)
  const handleAbrirEditarExame = (exame, e) => {
    e.stopPropagation(); // Evita expandir o acordeão ao clicar para editar
    setExameEmEdicao(exame);
    setEditarExameForm({
      titulo: exame.titulo || '',
      descricao: exame.descricao || '',
      data_exame: exame.data_exame || '',
      status: exame.status || 'agendado'
    });
    setShowEditarExameModal(true);
  };

  // Handler salvar alteração do exame (Admin)
  const handleEditarExame = async (e) => {
    e.preventDefault();
    if (!editarExameForm.titulo || !editarExameForm.data_exame) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    try {
      const res = await fetch(`/api/exames/${exameEmEdicao.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editarExameForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      setExames(prev => prev.map(ex => ex.id === exameEmEdicao.id ? data : ex));
      setShowEditarExameModal(false);
      setExameEmEdicao(null);
      toast.success('Exame atualizado com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar exame.');
    }
  };

  // Handler inscrever atleta (Filial/Atleta)
  const handleInscreverAtleta = async (e) => {
    e.preventDefault();
    
    // Se for atleta logado, preenche o ID dele automaticamente
    const targetAtletaId = isAtleta ? usuario.id : inscricaoForm.atleta_id;

    if (!inscricaoForm.exame_id || !targetAtletaId || !inscricaoForm.graduacao_pretendida) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await fetch('/api/exames/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exame_id: inscricaoForm.exame_id,
          atleta_id: targetAtletaId,
          modalidade: inscricaoForm.modalidade,
          graduacao_pretendida: inscricaoForm.graduacao_pretendida
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      // Recarregar lista de candidatos
      const resCandidatos = await fetch('/api/exames/candidatos');
      if (resCandidatos.ok) {
        const list = await resCandidatos.json();
        setCandidatos(list.candidatos || []);
      }

      setShowInscricaoModal(false);
      setInscricaoForm({ exame_id: '', atleta_id: '', modalidade: 'Karatê Goju-Ryu', graduacao_pretendida: '' });
      toast.success('Inscrição solicitada com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao realizar inscrição.');
    }
  };

  // Handler conceder autorização técnica (Filial)
  const handleAutorizarCandidato = async (candidatoId, atualAutorizacao) => {
    try {
      const res = await fetch(`/api/exames/candidatos/${candidatoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autorizacao_tecnica: !atualAutorizacao })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      setCandidatos(prev => prev.map(c => c.id === candidatoId ? data : c));
      toast.success(!atualAutorizacao ? 'Atleta autorizado tecnicamente!' : 'Autorização técnica revogada.');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar autorização.');
    }
  };

  // Handler atualizar pagamento do candidato (Admin)
  const handleAtualizarPagamento = async (candidatoId, statusPagamento) => {
    try {
      const res = await fetch(`/api/exames/candidatos/${candidatoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagamento_status: statusPagamento })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      setCandidatos(prev => prev.map(c => c.id === candidatoId ? data : c));
      toast.success('Status do pagamento atualizado!');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar pagamento.');
    }
  };

  // Handler homologar inscrição como confirmada (Admin)
  const handleHomologarInscricao = async (candidatoId) => {
    try {
      const res = await fetch(`/api/exames/candidatos/${candidatoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inscrito' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      setCandidatos(prev => prev.map(c => c.id === candidatoId ? data : c));
      toast.success('Inscrição homologada e confirmada!');
    } catch (err) {
      toast.error(err.message || 'Erro ao homologar inscrição.');
    }
  };

  // Handler abrir modal de avaliação de banca
  const handleAbrirBancaModal = (candidato) => {
    setSelectedCandidato(candidato);
    const db = candidato.dados_banca || {};
    setBancaForm({
      examinadores: db.examinadores || '',
      nota_tecnica: db.nota_tecnica || '',
      nota_combate: db.nota_combate || '',
      nota_kata: db.nota_kata || '',
      parecer: db.parecer || '',
      aprovado: candidato.status === 'aprovado' ? true : (candidato.status === 'reprovado' ? false : true)
    });
    setShowBancaModal(true);
  };

  // Handler salvar avaliação de banca e aprovar/reprovar (Admin)
  const handleSalvarBancaAvaliacao = async (e) => {
    e.preventDefault();
    if (!selectedCandidato) return;

    try {
      const payload = {
        status: bancaForm.aprovado ? 'aprovado' : 'reprovado',
        dados_banca: {
          examinadores: bancaForm.examinadores,
          nota_tecnica: parseFloat(bancaForm.nota_tecnica || '0'),
          nota_combate: parseFloat(bancaForm.nota_combate || '0'),
          nota_kata: parseFloat(bancaForm.nota_kata || '0'),
          parecer: bancaForm.parecer
        }
      };

      const res = await fetch(`/api/exames/candidatos/${selectedCandidato.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      setCandidatos(prev => prev.map(c => c.id === selectedCandidato.id ? data : c));
      setShowBancaModal(false);
      setSelectedCandidato(null);
      toast.success(bancaForm.aprovado ? 'Atleta aprovado na nova graduação!' : 'Avaliação registrada como reprovado.');
    } catch (err) {
      toast.error(err.message || 'Erro ao registrar avaliação.');
    }
  };

  // Handler cancelar inscrição (Filial / Atleta / Admin)
  const handleCancelarInscricao = async (candidatoId) => {
    if (!confirm('Deseja realmente cancelar esta inscrição?')) return;

    try {
      const res = await fetch(`/api/exames/candidatos/${candidatoId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      setCandidatos(prev => prev.filter(c => c.id !== candidatoId));
      toast.success('Inscrição cancelada com sucesso.');
    } catch (err) {
      toast.error(err.message || 'Erro ao cancelar inscrição.');
    }
  };

  // Função para distribuir alunos de forma equilibrada nas bancadas
  const handleDistribuirBancadas = async (exameId) => {
    setDistributing(true);
    try {
      const homologadosSemBanca = candidatos.filter(
        c => c.exame_id === exameId && 
             c.status === 'inscrito' && 
             !c.dados_banca?.bancada
      );

      if (homologadosSemBanca.length === 0) {
        toast.error('Nenhum aluno homologado na fila para distribuição.');
        return;
      }

      // Distribuição equilibrada considerando candidatos já alocados
      const activeBenches = Array.from({ length: numBancadas }, (_, i) => `Bancada ${i + 1}`);
      const assignments = {};
      activeBenches.forEach(b => {
        assignments[b] = candidatos.filter(
          c => c.exame_id === exameId && 
               c.status === 'inscrito' && 
               c.dados_banca?.bancada === b
        );
      });

      const updates = [];

      homologadosSemBanca.forEach(cand => {
        // Encontra as bancadas que ainda têm espaço (< 3)
        const benchesWithSpace = activeBenches.filter(b => assignments[b].length < 3);
        if (benchesWithSpace.length === 0) return; // Sem mais espaço

        // Encontra o tamanho mínimo de ocupação entre as bancadas com espaço
        const minLength = Math.min(...benchesWithSpace.map(b => assignments[b].length));
        
        // Seleciona a primeira bancada com menor ocupação (mantém o equilíbrio)
        const selectedBench = benchesWithSpace.find(b => assignments[b].length === minLength);

        if (selectedBench) {
          assignments[selectedBench].push(cand);
          // Prepara a requisição PATCH para salvar no banco
          const novoDadosBanca = {
            ...(cand.dados_banca || {}),
            bancada: selectedBench
          };
          
          updates.push(
            fetch(`/api/exames/candidatos/${cand.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dados_banca: novoDadosBanca })
            })
          );
        }
      });

      if (updates.length === 0) {
        toast.error('Não foi possível alocar alunos. As bancadas ativas já estão cheias.');
        return;
      }

      // Executa todas as atualizações de forma concorrente
      const results = await Promise.all(updates);
      const allOk = results.every(r => r.ok);

      if (allOk) {
        // Recarregar os candidatos
        const resCandidatos = await fetch('/api/exames/candidatos');
        if (resCandidatos.ok) {
          const data = await resCandidatos.json();
          setCandidatos(data.candidatos || []);
        }
        toast.success(`Alunos distribuídos com sucesso em ${numBancadas} bancadas!`);
      } else {
        toast.error('Erro parcial ao distribuir alguns alunos.');
      }
    } catch (err) {
      console.error('Erro ao distribuir bancadas:', err);
      toast.error('Erro interno ao distribuir alunos.');
    } finally {
      setDistributing(false);
    }
  };

  // Função para limpar atribuição de bancadas
  const handleLimparBancadas = async (exameId) => {
    if (!confirm('Deseja realmente retirar todos os alunos das bancadas e retorná-los à fila de espera?')) return;
    setDistributing(true);
    try {
      const candidatosComBanca = candidatos.filter(
        c => c.exame_id === exameId && 
             c.status === 'inscrito' && 
             c.dados_banca?.bancada
      );

      if (candidatosComBanca.length === 0) {
        toast.error('Nenhum aluno alocado em bancada.');
        return;
      }

      const updates = candidatosComBanca.map(cand => {
        const novoDadosBanca = { ...(cand.dados_banca || {}) };
        delete novoDadosBanca.bancada;
        
        return fetch(`/api/exames/candidatos/${cand.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dados_banca: novoDadosBanca })
        });
      });

      const results = await Promise.all(updates);
      const allOk = results.every(r => r.ok);

      if (allOk) {
        const resCandidatos = await fetch('/api/exames/candidatos');
        if (resCandidatos.ok) {
          const data = await resCandidatos.json();
          setCandidatos(data.candidatos || []);
        }
        toast.success('Bancadas limpas com sucesso!');
      } else {
        toast.error('Erro ao limpar algumas bancadas.');
      }
    } catch (err) {
      console.error('Erro ao limpar bancadas:', err);
      toast.error('Erro interno ao limpar bancadas.');
    } finally {
      setDistributing(false);
    }
  };

  const handleAbrirBancaColetivaModal = (exameId, bancadaNome, candidatosBancada) => {
    setExameSelecionadoParaBanca(exameId);
    setBancadaSelecionada(bancadaNome);
    
    // Obter examinadores do primeiro candidato ou vazio
    const primeiroExaminador = candidatosBancada[0]?.dados_banca?.examinadores || '';

    // Inicializar o formulário para cada aluno
    const inicialAlunos = {};
    candidatosBancada.forEach(cand => {
      const db = cand.dados_banca || {};
      inicialAlunos[cand.id] = {
        nota_tecnica: db.nota_tecnica !== undefined ? db.nota_tecnica : '',
        nota_kata: db.nota_kata !== undefined ? db.nota_kata : '',
        nota_combate: db.nota_combate !== undefined ? db.nota_combate : '',
        parecer: db.parecer || '',
        aprovado: cand.status === 'reprovado' ? false : true
      };
    });

    setBancaColetivaForm({
      examinadores: primeiroExaminador,
      alunos: inicialAlunos
    });

    setShowBancaColetivaModal(true);
  };

  const handleSalvarBancaColetivaAvaliacao = async (e) => {
    e.preventDefault();
    if (!bancadaSelecionada || !exameSelecionadoParaBanca) return;

    setLoading(true);
    try {
      const candidatosBancada = candidatos.filter(
        c => c.exame_id === exameSelecionadoParaBanca && 
             c.dados_banca?.bancada === bancadaSelecionada
      );

      const updates = candidatosBancada.map(cand => {
        const formAluno = bancaColetivaForm.alunos[cand.id] || {};
        const payload = {
          status: formAluno.aprovado ? 'aprovado' : 'reprovado',
          dados_banca: {
            bancada: bancadaSelecionada,
            examinadores: bancaColetivaForm.examinadores,
            nota_tecnica: parseFloat(formAluno.nota_tecnica || '0'),
            nota_kata: parseFloat(formAluno.nota_kata || '0'),
            nota_combate: parseFloat(formAluno.nota_combate || '0'),
            parecer: formAluno.parecer
          }
        };

        return fetch(`/api/exames/candidatos/${cand.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      });

      const results = await Promise.all(updates);
      const allOk = results.every(r => r.ok);

      if (allOk) {
        // Recarregar os candidatos
        const resCandidatos = await fetch('/api/exames/candidatos');
        if (resCandidatos.ok) {
          const data = await resCandidatos.json();
          setCandidatos(data.candidatos || []);
        }
        setShowBancaColetivaModal(false);
        setBancadaSelecionada(null);
        setExameSelecionadoParaBanca(null);
        toast.success(`Avaliações da ${bancadaSelecionada} salvas com sucesso!`);
      } else {
        toast.error('Erro ao salvar algumas avaliações.');
      }
    } catch (err) {
      console.error('Erro ao salvar banca coletiva:', err);
      toast.error('Erro interno ao salvar avaliações.');
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas Dinâmicas
  const totalRealizados = exames.filter(e => e.status === 'realizado').length;
  const totalAgendados = exames.filter(e => e.status === 'agendado').length;
  const totalCandidatos = candidatos.length;
  const totalAprovacoes = candidatos.filter(c => c.status === 'aprovado').length;

  // Filtragem de Exames
  const examesFiltrados = exames.filter(exame => {
    const matchesStatus = exameFiltro === 'todos' || exame.status === exameFiltro;
    const matchesBusca = exame.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                         (exame.descricao && exame.descricao.toLowerCase().includes(busca.toLowerCase()));
    return matchesStatus && matchesBusca;
  });

  // Filtro de exames abertos para inscrição (tipo agendados)
  const examesAbertos = exames.filter(e => e.status === 'agendado');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center animate-pulse">
              <Flame size={24} className="text-brand-400" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping bg-brand-500/10" style={{ animationDuration: '1.5s' }} />
          </div>
          <p className="text-xs text-ink-600 font-bold tracking-[0.2em] uppercase">Carregando Módulo</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-100 font-cinzel">Exames de Faixa</h1>
          <p className="text-sm text-ink-500 mt-0.5">Gerenciamento e histórico de avaliações técnicas e graduações</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowNovoExameModal(true)}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition hover:scale-105"
            >
              <Plus size={16} /> Agendar Exame
            </button>
          )}

          {(isFilial || isAtleta) && examesAbertos.length > 0 && (
            <button
              onClick={() => setShowInscricaoModal(true)}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition hover:scale-105"
            >
              <Plus size={16} /> Solicitar Inscrição
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-5 flex items-center gap-4 transition hover:border-dark-50 cursor-default">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0 text-gold-400">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-ink-100">{totalRealizados}</p>
            <p className="text-xs text-ink-500">Exames Realizados</p>
          </div>
        </div>

        <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-5 flex items-center gap-4 transition hover:border-dark-50 cursor-default">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 text-brand-400">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-ink-100">{totalAgendados}</p>
            <p className="text-xs text-ink-500">Exames Agendados</p>
          </div>
        </div>

        <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-5 flex items-center gap-4 transition hover:border-dark-50 cursor-default">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
            <User size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-ink-100">{totalCandidatos}</p>
            <p className="text-xs text-ink-500">Total Candidatos</p>
          </div>
        </div>

        <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-5 flex items-center gap-4 transition hover:border-dark-50 cursor-default">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-400">
            <Star size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-ink-100">{totalAprovacoes}</p>
            <p className="text-xs text-ink-500">Aprovações</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Abas */}
        <div className="flex items-center gap-1.5 bg-dark-400 p-1 border border-dark-50/60 rounded-xl w-fit">
          <button
            onClick={() => setExameFiltro('todos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              exameFiltro === 'todos' ? 'bg-brand-500 text-white shadow-lg' : 'text-ink-650 hover:text-ink-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setExameFiltro('agendado')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              exameFiltro === 'agendado' ? 'bg-brand-500 text-white shadow-lg' : 'text-ink-650 hover:text-ink-200'
            }`}
          >
            Agendados
          </button>
          <button
            onClick={() => setExameFiltro('realizado')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              exameFiltro === 'realizado' ? 'bg-brand-500 text-white shadow-lg' : 'text-ink-650 hover:text-ink-200'
            }`}
          >
            Realizados
          </button>
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full md:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600" />
          <input
            type="text"
            placeholder="Buscar exames..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-dark-200 border border-dark-50 rounded-xl text-ink-100 placeholder:text-ink-600 focus:ring-1 focus:ring-brand-500 outline-none transition"
          />
        </div>
      </div>

      {/* Listagem de Exames */}
      <div className="space-y-4">
        {examesFiltrados.length === 0 ? (
          <div className="bg-dark-200 border border-dark-50/60 rounded-3xl py-16 text-center">
            <Clock size={36} className="text-ink-700 mx-auto mb-3" />
            <p className="text-ink-600 font-medium text-sm">Nenhum exame de faixa correspondente encontrado.</p>
          </div>
        ) : (
          examesFiltrados.map((exame) => {
            const candidatosDoExame = candidatos.filter(c => c.exame_id === exame.id);
            const isExpandido = exameExpandidoId === exame.id;

            return (
              <div key={exame.id} className="bg-dark-200 border border-dark-50/60 rounded-2xl overflow-hidden transition hover:border-dark-50">
                
                {/* Header Exame Card */}
                <div 
                  onClick={() => isAdmin && setExameExpandidoId(isExpandido ? null : exame.id)}
                  className={`p-5 flex items-center justify-between gap-4 cursor-pointer ${isAdmin ? 'hover:bg-white/[0.02]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      exame.status === 'realizado' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 
                      exame.status === 'cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    }`}>
                      {exame.status === 'realizado' ? '✓' : exame.status === 'cancelado' ? '✕' : '📅'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink-100">{exame.titulo}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(exame.data_exame)}
                        </span>
                        {exame.descricao && (
                          <span className="truncate max-w-[250px] sm:max-w-md hidden sm:inline">{exame.descricao}</span>
                        )}
                        <span className="bg-dark-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-ink-400">
                          {candidatosDoExame.length} candidatos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      exame.status === 'realizado' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/25' : 
                      exame.status === 'cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/25' : 
                      'bg-green-500/10 text-green-400 border border-green-500/25'
                    }`}>
                      {exame.status}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={(e) => handleAbrirEditarExame(exame, e)}
                        className="p-1.5 bg-dark-400 hover:bg-dark-500 border border-dark-50 text-ink-400 hover:text-white rounded-lg transition"
                        title="Editar Exame"
                      >
                        <Edit size={14} />
                      </button>
                    )}

                    {isAdmin && (
                      <div>
                        {isExpandido ? <ChevronDown size={18} className="text-ink-600" /> : <ChevronRight size={18} className="text-ink-600" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-lista Candidatos (Visível apenas para Admin no Accordion ou para todos se for listagem simples do atleta/filial) */}
                {((isAdmin && isExpandido) || !isAdmin) && (
                  <div className="border-t border-dark-50/60 bg-dark-250 p-5 space-y-4">
                    <h4 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3 font-cinzel">
                      {isAdmin ? 'Candidatos Inscritos' : 'Minhas Candidaturas / Histórico'}
                    </h4>

                    {/* Tab Navigation for Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 border-b border-dark-50/60 pb-3 mb-4">
                        <button
                          onClick={() => setActiveTabMap(prev => ({ ...prev, [exame.id]: 'lista' }))}
                          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                            (activeTabMap[exame.id] || 'lista') === 'lista' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/25' : 'text-ink-500 hover:text-ink-200'
                          }`}
                        >
                          Lista de Candidatos
                        </button>
                        <button
                          onClick={() => setActiveTabMap(prev => ({ ...prev, [exame.id]: 'bancadas' }))}
                          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                            (activeTabMap[exame.id] || 'lista') === 'bancadas' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/25' : 'text-ink-500 hover:text-ink-200'
                          }`}
                        >
                          Painel de Bancadas & Fila
                        </button>
                      </div>
                    )}

                    {(!isAdmin || (activeTabMap[exame.id] || 'lista') === 'lista') && (
                      candidatosDoExame.length === 0 ? (
                        <p className="text-xs text-ink-600 italic">Nenhum candidato inscrito neste exame.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-dark-50/60 text-ink-600 font-bold uppercase tracking-wider text-[10px]">
                                <th className="pb-3">Candidato</th>
                                {isAdmin && <th className="pb-3">Academia/Filial</th>}
                                <th className="pb-3">Modalidade</th>
                                <th className="pb-3">Pretensão</th>
                                <th className="pb-3">Status Técnico</th>
                                <th className="pb-3">Pagamento</th>
                                <th className="pb-3 text-center">Status Final</th>
                                <th className="pb-3 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {candidatosDoExame.map((cand) => {
                                const db = cand.dados_banca || {};
                                
                                return (
                                  <tr key={cand.id} className="border-b border-dark-50/20 hover:bg-white/[0.01] transition">
                                    <td className="py-3.5 pr-2">
                                      <p className="font-bold text-ink-100">{cand.atleta_nome}</p>
                                      <p className="text-[10px] text-ink-650">{cand.atleta_telefone ? `(login) ${cand.atleta_telefone}` : cand.atleta_email}</p>
                                    </td>
                                    
                                    {isAdmin && (
                                      <td className="py-3.5 pr-2 text-ink-400 font-medium">
                                        {cand.filial_nome || '—'}
                                      </td>
                                    )}

                                    <td className="py-3.5 pr-2 text-ink-600">{cand.modalidade}</td>
                                    
                                    <td className="py-3.5 pr-2 font-bold text-gold-400">{cand.graduacao_pretendida}</td>
                                    
                                    <td className="py-3.5 pr-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${cand.autorizacao_tecnica ? 'bg-green-400' : 'bg-red-400'}`} />
                                        <span className="font-semibold text-ink-300">
                                          {cand.autorizacao_tecnica ? 'Autorizado' : 'Pendente'}
                                        </span>
                                        {isFilial && !cand.autorizacao_tecnica && (
                                          <button 
                                            onClick={() => handleAutorizarCandidato(cand.id, false)}
                                            className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded hover:bg-green-500 hover:text-white transition"
                                          >
                                            Autorizar
                                          </button>
                                        )}
                                      </div>
                                    </td>

                                    <td className="py-3.5 pr-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                          cand.pagamento_status === 'pago' ? 'bg-green-500/15 text-green-400' :
                                          cand.pagamento_status === 'isento' ? 'bg-blue-500/15 text-blue-400' :
                                          'bg-red-500/15 text-red-400'
                                        }`}>
                                          {cand.pagamento_status}
                                        </span>
                                        
                                        {isAdmin && cand.pagamento_status === 'pendente' && (
                                          <div className="flex gap-1">
                                            <button 
                                              onClick={() => handleAtualizarPagamento(cand.id, 'pago')}
                                              className="text-[9px] bg-green-500/20 text-green-300 border border-green-500/20 px-1.5 py-0.5 rounded hover:bg-green-500 hover:text-white transition"
                                              title="Confirmar Pago"
                                            >
                                              Pago
                                            </button>
                                            <button 
                                              onClick={() => handleAtualizarPagamento(cand.id, 'isento')}
                                              className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded hover:bg-blue-500 hover:text-white transition"
                                              title="Confirmar Isento"
                                            >
                                              Isento
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    <td className="py-3.5 pr-2 text-center">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        cand.status === 'aprovado' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                                        cand.status === 'reprovado' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                                        cand.status === 'inscrito' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                                        cand.status === 'apto' ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20' :
                                        'bg-dark-400 text-ink-600 border border-dark-50/50'
                                      }`}>
                                        {cand.status}
                                      </span>
                                    </td>

                                    <td className="py-3.5 text-right space-y-1">
                                      {isAdmin && (
                                        <div className="flex items-center justify-end gap-2">
                                          {cand.status === 'apto' && (
                                            <button
                                              onClick={() => handleHomologarInscricao(cand.id)}
                                              className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2 py-1 rounded-lg hover:bg-brand-500 hover:text-white transition"
                                            >
                                              Homologar
                                            </button>
                                          )}
                                          
                                          {cand.status === 'inscrito' && (
                                            <button
                                              onClick={() => handleAbrirBancaModal(cand)}
                                              className="text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-400 px-2.5 py-1 rounded-lg hover:bg-gold-500 hover:text-white transition flex items-center gap-1"
                                            >
                                              <Award size={10} /> Avaliar
                                            </button>
                                          )}

                                          {cand.status === 'aprovado' && (
                                            <button
                                              onClick={() => handleAbrirBancaModal(cand)}
                                              className="text-[9px] border border-dark-50 text-ink-400 px-2 py-0.5 rounded hover:bg-dark-100 transition"
                                            >
                                              Ver Notas
                                            </button>
                                          )}

                                          <button 
                                            onClick={() => handleCancelarInscricao(cand.id)}
                                            className="text-red-400 hover:text-red-300 p-1.5 transition"
                                            title="Excluir Candidatura"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      )}

                                      {!isAdmin && (cand.status === 'pendente' || cand.status === 'apto') && (
                                        <button
                                          onClick={() => handleCancelarInscricao(cand.id)}
                                          className="text-xs border border-red-500/30 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                        >
                                          Cancelar
                                        </button>
                                      )}

                                      {!isAdmin && (cand.status === 'aprovado' || cand.status === 'reprovado') && db.examinadores && (
                                        <div className="text-left bg-dark-400/80 p-2.5 rounded-xl border border-dark-50/50 max-w-[200px] ml-auto">
                                          <p className="font-bold text-[9px] text-ink-600 uppercase tracking-wider mb-1">Notas da Banca</p>
                                          <div className="grid grid-cols-3 gap-1 text-[10px] text-ink-200 font-mono mb-1">
                                            <span>Técnica: {db.nota_tecnica}</span>
                                            <span>Kata: {db.nota_kata}</span>
                                            <span>Luta: {db.nota_combate}</span>
                                          </div>
                                          <p className="text-[10px] text-ink-650 italic line-clamp-2">"{db.parecer}"</p>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}

                    {/* Bancadas Mode (Admin only) */}
                    {isAdmin && (activeTabMap[exame.id] || 'lista') === 'bancadas' && (() => {
                      const homologadosFila = candidatosDoExame.filter(
                        c => c.status === 'inscrito' && !c.dados_banca?.bancada
                      );

                      const activeBenches = Array.from({ length: numBancadas }, (_, i) => `Bancada ${i + 1}`);

                      return (
                        <div className="space-y-6">
                          {/* Controles de Configuração e Distribuição */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-400/50 p-4 rounded-xl border border-white/[0.04]">
                            <div className="flex items-center gap-3">
                              <label className="text-xs text-ink-500 uppercase tracking-wider font-bold">Bancadas Ativas:</label>
                              <select
                                value={numBancadas}
                                onChange={(e) => setNumBancadas(parseInt(e.target.value))}
                                className="bg-dark-300 border border-dark-50 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-brand-500"
                              >
                                <option value={1}>1 Bancada</option>
                                <option value={2}>2 Bancadas</option>
                                <option value={3}>3 Bancadas</option>
                                <option value={4}>4 Bancadas</option>
                              </select>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleLimparBancadas(exame.id)}
                                disabled={distributing}
                                className="px-4 py-2 border border-red-500/20 bg-red-500/5 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 transition disabled:opacity-40"
                              >
                                Limpar Bancadas
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDistribuirBancadas(exame.id)}
                                disabled={distributing || homologadosFila.length === 0}
                                className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:scale-102 transition disabled:opacity-40"
                              >
                                {distributing ? 'Distribuindo...' : 'Chamar Próximos Alunos'}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Cards das Bancadas */}
                            {activeBenches.map(benchName => {
                              const alunosNaBanca = candidatosDoExame.filter(
                                c => c.status === 'inscrito' && c.dados_banca?.bancada === benchName
                              );

                              const statusLabel = alunosNaBanca.length === 0 ? 'Vazia' : (alunosNaBanca.length === 3 ? 'Cheia' : 'Em Espera');
                              const statusClass = alunosNaBanca.length === 0 ? 'border-white/[0.04] bg-dark-200/20 text-ink-600' : (alunosNaBanca.length === 3 ? 'border-green-500/25 bg-green-500/[0.02] text-green-400' : 'border-gold-500/25 bg-gold-500/[0.02] text-gold-400');

                              return (
                                <div key={benchName} className={`rounded-xl border p-4 flex flex-col justify-between min-h-[180px] transition hover:shadow-lg ${statusClass}`}>
                                  <div>
                                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                                      <span className="font-bold text-xs uppercase tracking-widest font-cinzel text-ink-100">{benchName}</span>
                                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04]">
                                        {statusLabel} ({alunosNaBanca.length}/3)
                                      </span>
                                    </div>

                                    {alunosNaBanca.length === 0 ? (
                                      <p className="text-xs text-ink-650 italic py-4 text-center">Nenhum aluno alocado</p>
                                    ) : (
                                      <ul className="space-y-2">
                                        {alunosNaBanca.map(cand => (
                                          <li key={cand.id} className="flex items-center justify-between bg-dark-400/40 border border-white/[0.03] px-3 py-2 rounded-lg">
                                            <div className="truncate pr-2">
                                              <p className="font-bold text-xs text-ink-200 truncate">{cand.atleta_nome}</p>
                                              <p className="text-[9px] text-ink-500 truncate">{cand.modalidade}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-gold-400 bg-gold-500/10 border border-gold-500/20 px-1.5 py-0.5 rounded shrink-0">
                                              {cand.graduacao_pretendida}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>

                                  {alunosNaBanca.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleAbrirBancaColetivaModal(exame.id, benchName, alunosNaBanca)}
                                      className="w-full mt-4 py-2 bg-white/[0.04] hover:bg-gold-500/10 border border-white/[0.06] hover:border-gold-500/20 text-ink-200 hover:text-gold-400 text-xs font-bold uppercase tracking-wider rounded-lg transition"
                                    >
                                      Avaliar Grupo ({benchName})
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Fila de Espera */}
                          <div className="bg-dark-300/30 border border-white/[0.03] p-4 rounded-xl">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-400 mb-3">Fila de Espera ({homologadosFila.length} alunos)</h5>
                            {homologadosFila.length === 0 ? (
                              <p className="text-xs text-ink-600 italic">Nenhum aluno na fila de espera.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {homologadosFila.map(cand => (
                                  <span key={cand.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-400 border border-white/[0.04] text-xs text-ink-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                                    <strong>{cand.atleta_nome}</strong>
                                    <span className="text-[10px] text-ink-600 font-mono">({cand.graduacao_pretendida})</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ==================== MODAL: NOVO EXAME (Admin) ==================== */}
      {showNovoExameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-scale">
            <h3 className="text-lg font-bold text-ink-100 font-cinzel mb-4">Agendar Novo Exame</h3>
            <form onSubmit={handleCriarExame} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Título do Exame *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Exame de Faixas Pretas 2026 - Salvador"
                  value={novoExameForm.titulo}
                  onChange={(e) => setNovoExameForm({ ...novoExameForm, titulo: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Descrição / Local</label>
                <textarea
                  placeholder="Ex: Dojô central da GRKKK, início às 09h."
                  value={novoExameForm.descricao}
                  onChange={(e) => setNovoExameForm({ ...novoExameForm, descricao: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Data do Exame *</label>
                  <input
                    type="date"
                    required
                    value={novoExameForm.data_exame}
                    onChange={(e) => setNovoExameForm({ ...novoExameForm, data_exame: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Status Inicial</label>
                  <select
                    value={novoExameForm.status}
                    onChange={(e) => setNovoExameForm({ ...novoExameForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  >
                    <option value="agendado">Agendado</option>
                    <option value="realizado">Realizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-50">
                <button
                  type="button"
                  onClick={() => setShowNovoExameModal(false)}
                  className="btn-outline flex-1 py-2.5 rounded-xl border border-dark-50 text-xs font-bold uppercase text-ink-500 hover:text-ink-200 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-xs font-bold uppercase transition"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: INSCREVER ATLETA (Filial / Atleta) ==================== */}
      {showInscricaoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-scale">
            <h3 className="text-lg font-bold text-ink-100 font-cinzel mb-4">Solicitar Inscrição em Exame</h3>
            <form onSubmit={handleInscreverAtleta} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Escolha o Exame *</label>
                <select
                  required
                  value={inscricaoForm.exame_id}
                  onChange={(e) => setInscricaoForm({ ...inscricaoForm, exame_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                >
                  <option value="">Selecione o exame agendado</option>
                  {examesAbertos.map(e => (
                    <option key={e.id} value={e.id}>{e.titulo} ({formatDate(e.data_exame)})</option>
                  ))}
                </select>
              </div>

              {isFilial && (
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Selecione o Atleta de sua Filial *</label>
                  <select
                    required
                    value={inscricaoForm.atleta_id}
                    onChange={(e) => setInscricaoForm({ ...inscricaoForm, atleta_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  >
                    <option value="">Selecione um atleta cadastrado</option>
                    {atletas.map(a => (
                      <option key={a.id} value={a.id}>{a.nome} (Faixa: {a.faixa || 'Branca'})</option>
                    ))}
                  </select>
                </div>
              )}

              {isAtleta && (
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Nome do Atleta</label>
                  <input
                    type="text"
                    disabled
                    value={usuario?.nome || 'Você'}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-600 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Modalidade</label>
                  <select
                    value={inscricaoForm.modalidade}
                    onChange={(e) => setInscricaoForm({ ...inscricaoForm, modalidade: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  >
                    <option value="Karatê Goju-Ryu">Karatê Goju-Ryu</option>
                    <option value="Karatê Goju-Ryu">Karatê Goju-Ryu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Faixa Pretendida *</label>
                  <select
                    required
                    value={inscricaoForm.graduacao_pretendida}
                    onChange={(e) => setInscricaoForm({ ...inscricaoForm, graduacao_pretendida: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  >
                    <option value="">Selecione a faixa</option>
                    <option value="Amarela">Amarela (6º Kyu)</option>
                    <option value="Laranja">Laranja (5º Kyu)</option>
                    <option value="Verde">Verde (4º Kyu)</option>
                    <option value="Azul">Azul (3º Kyu)</option>
                    <option value="Roxa">Roxa (2º Kyu)</option>
                    <option value="Marrom">Marrom (1º Kyu)</option>
                    <option value="Preta">Preta (1º Dan - Shodan)</option>
                    <option value="Preta Nidan">Preta (2º Dan - Nidan)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-50">
                <button
                  type="button"
                  onClick={() => setShowInscricaoModal(false)}
                  className="btn-outline flex-1 py-2.5 rounded-xl border border-dark-50 text-xs font-bold uppercase text-ink-500 hover:text-ink-200 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-white text-xs font-bold uppercase transition"
                >
                  Solicitar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: BANCA / AVALIAÇÃO DE NOTAS (Admin) ==================== */}
      {showBancaModal && selectedCandidato && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-scale">
            <h3 className="text-lg font-bold text-ink-100 font-cinzel mb-1">Avaliação da Banca</h3>
            <p className="text-xs text-ink-600 mb-4">Lançamento de notas para: <strong className="text-ink-200">{selectedCandidato.atleta_nome}</strong></p>
            
            <form onSubmit={handleSalvarBancaAvaliacao} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Examinadores da Banca</label>
                <input
                  type="text"
                  placeholder="Ex: Sensei Paulo, Sensei Marcos"
                  value={bancaForm.examinadores}
                  onChange={(e) => setBancaForm({ ...bancaForm, examinadores: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
                {blackBelts.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-ink-650 uppercase tracking-wider mb-1">Selecionar Faixas Pretas cadastrados:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {blackBelts.map(bb => {
                        const nameToToggle = bb.nome.startsWith('Sensei ') ? bb.nome : `Sensei ${bb.nome}`;
                        const isSelected = (bancaForm.examinadores || '').split(',').map(s => s.trim()).includes(nameToToggle);
                        return (
                          <button
                            key={bb.id}
                            type="button"
                            onClick={() => toggleExaminer(bb.nome, bancaForm.examinadores, false)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition border ${
                              isSelected 
                                ? 'bg-gold-500/20 text-gold-400 border-gold-500/30 font-bold' 
                                : 'bg-dark-400 text-ink-500 border-white/[0.03] hover:text-ink-200 hover:bg-dark-500'
                            }`}
                          >
                            {bb.nome}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1.5">Nota Técnica (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="0.0"
                    value={bancaForm.nota_tecnica}
                    onChange={(e) => setBancaForm({ ...bancaForm, nota_tecnica: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1.5">Nota Kata (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="0.0"
                    value={bancaForm.nota_kata}
                    onChange={(e) => setBancaForm({ ...bancaForm, nota_kata: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1.5">Nota Luta (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="0.0"
                    value={bancaForm.nota_combate}
                    onChange={(e) => setBancaForm({ ...bancaForm, nota_combate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Parecer da Banca / Comentários</label>
                <textarea
                  placeholder="Ex: Excelente execução técnica de Kihon e Kata. Luta dentro da média técnica."
                  value={bancaForm.parecer}
                  onChange={(e) => setBancaForm({ ...bancaForm, parecer: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Decisão da Banca</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-green-400">
                    <input
                      type="radio"
                      name="aprovado"
                      checked={bancaForm.aprovado === true}
                      onChange={() => setBancaForm({ ...bancaForm, aprovado: true })}
                      className="accent-green-500"
                    />
                    Aprovado
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-red-400">
                    <input
                      type="radio"
                      name="aprovado"
                      checked={bancaForm.aprovado === false}
                      onChange={() => setBancaForm({ ...bancaForm, aprovado: false })}
                      className="accent-red-500"
                    />
                    Reprovado
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-50">
                <button
                  type="button"
                  onClick={() => setShowBancaModal(false)}
                  className="btn-outline flex-1 py-2.5 rounded-xl border border-dark-50 text-xs font-bold uppercase text-ink-500 hover:text-ink-200 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-white text-xs font-bold uppercase transition"
                >
                  Salvar Resultado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: BANCA COLETIVA (Admin) ==================== */}
      {showBancaColetivaModal && bancadaSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-4xl p-6 relative animate-fade-in-scale max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-ink-100 font-cinzel mb-1 uppercase tracking-wider">{bancadaSelecionada} - Avaliação Coletiva</h3>
            <p className="text-xs text-ink-650 mb-6">Lançamento de notas simultâneo para os atletas da bancada.</p>

            <form onSubmit={handleSalvarBancaColetivaAvaliacao} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Examinadores da Banca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sensei Paulo, Sensei Marcos"
                  value={bancaColetivaForm.examinadores}
                  onChange={(e) => setBancaColetivaForm({ ...bancaColetivaForm, examinadores: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
                {blackBelts.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-ink-650 uppercase tracking-wider mb-1">Selecionar Faixas Pretas cadastrados:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {blackBelts.map(bb => {
                        const nameToToggle = bb.nome.startsWith('Sensei ') ? bb.nome : `Sensei ${bb.nome}`;
                        const isSelected = (bancaColetivaForm.examinadores || '').split(',').map(s => s.trim()).includes(nameToToggle);
                        return (
                          <button
                            key={bb.id}
                            type="button"
                            onClick={() => toggleExaminer(bb.nome, bancaColetivaForm.examinadores, true)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition border ${
                              isSelected 
                                ? 'bg-gold-500/20 text-gold-400 border-gold-500/30 font-bold' 
                                : 'bg-dark-400 text-ink-500 border-white/[0.03] hover:text-ink-200 hover:bg-dark-500'
                            }`}
                          >
                            {bb.nome}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {candidatos.filter(c => c.exame_id === exameSelecionadoParaBanca && c.dados_banca?.bancada === bancadaSelecionada).map(cand => {
                  const formAluno = bancaColetivaForm.alunos[cand.id] || {
                    nota_tecnica: '',
                    nota_kata: '',
                    nota_combate: '',
                    parecer: '',
                    aprovado: true
                  };

                  const updateAlunoField = (field, val) => {
                    setBancaColetivaForm(prev => ({
                      ...prev,
                      alunos: {
                        ...prev.alunos,
                        [cand.id]: {
                          ...prev.alunos[cand.id],
                          [field]: val
                        }
                      }
                    }));
                  };

                  return (
                    <div key={cand.id} className="bg-dark-400/50 border border-white/[0.04] p-4 rounded-xl space-y-4">
                      <div className="border-b border-white/[0.06] pb-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs text-ink-100 truncate max-w-[150px]">{cand.atleta_nome}</p>
                          <p className="text-[9px] text-ink-500 font-medium">Pretensão: <span className="text-gold-400 font-bold">{cand.graduacao_pretendida}</span></p>
                        </div>
                        <span className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-xs text-gold-400 font-black border border-gold-500/20 font-cinzel">
                          {cand.atleta_nome?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-ink-500 uppercase tracking-wider mb-1">Nota Téc.</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            required
                            placeholder="0.0"
                            value={formAluno.nota_tecnica}
                            onChange={(e) => updateAlunoField('nota_tecnica', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-dark-300 border border-dark-50 rounded-lg text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-ink-500 uppercase tracking-wider mb-1">Kata</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            required
                            placeholder="0.0"
                            value={formAluno.nota_kata}
                            onChange={(e) => updateAlunoField('nota_kata', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-dark-300 border border-dark-50 rounded-lg text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-ink-500 uppercase tracking-wider mb-1">Luta</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            required
                            placeholder="0.0"
                            value={formAluno.nota_combate}
                            onChange={(e) => updateAlunoField('nota_combate', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-dark-300 border border-dark-50 rounded-lg text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">Parecer / Comentários</label>
                        <textarea
                          placeholder="Opinião da banca..."
                          value={formAluno.parecer}
                          onChange={(e) => updateAlunoField('parecer', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-dark-300 border border-dark-50 rounded-lg text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 h-14 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-ink-500 uppercase tracking-wider mb-1">Resultado Final</label>
                        <div className="flex gap-4 mt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-green-400">
                            <input
                              type="radio"
                              name={`aprovado-${cand.id}`}
                              checked={formAluno.aprovado === true}
                              onChange={() => updateAlunoField('aprovado', true)}
                              className="accent-green-500"
                            />
                            Aprovado
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-red-400">
                            <input
                              type="radio"
                              name={`aprovado-${cand.id}`}
                              checked={formAluno.aprovado === false}
                              onChange={() => updateAlunoField('aprovado', false)}
                              className="accent-red-500"
                            />
                            Reprovado
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowBancaColetivaModal(false);
                    setBancadaSelecionada(null);
                    setExameSelecionadoParaBanca(null);
                  }}
                  className="btn-outline flex-1 py-2.5 rounded-xl border border-dark-50 text-xs font-bold uppercase text-ink-500 hover:text-ink-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-white text-xs font-bold uppercase transition"
                >
                  Salvar Resultados da Bancada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ==================== MODAL: EDITAR EXAME (Admin) ==================== */}
      {showEditarExameModal && exameEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-scale">
            <h3 className="text-lg font-bold text-ink-100 font-cinzel mb-4 font-black">Editar Exame de Faixa</h3>
            <form onSubmit={handleEditarExame} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Título do Exame *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Exame de Faixas Pretas 2026"
                  value={editarExameForm.titulo}
                  onChange={(e) => setEditarExameForm({ ...editarExameForm, titulo: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Descrição / Local</label>
                <textarea
                  placeholder="Ex: Dojô central da GRKKK"
                  value={editarExameForm.descricao}
                  onChange={(e) => setEditarExameForm({ ...editarExameForm, descricao: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Data do Exame *</label>
                  <input
                    type="date"
                    required
                    value={editarExameForm.data_exame}
                    onChange={(e) => setEditarExameForm({ ...editarExameForm, data_exame: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={editarExameForm.status}
                    onChange={(e) => setEditarExameForm({ ...editarExameForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  >
                    <option value="agendado">Agendado</option>
                    <option value="realizado">Realizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditarExameModal(false);
                    setExameEmEdicao(null);
                  }}
                  className="btn-outline flex-1 py-2.5 rounded-xl border border-dark-50 text-xs font-bold uppercase text-ink-500 hover:text-ink-200 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-xs font-bold uppercase transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
