'use client';

import { useState, useEffect } from 'react';
import {
  Trophy, Medal, Search, Award, Filter, Calendar, User, Plus,
  Loader2, Building2, Sparkles, Clock, ChevronRight, TrendingUp, Flame
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Mapeamento de tipo de pontuação para nomes amigáveis
const PONTOS_EVENTOS = {
  evento_participado: { label: 'Participação em Evento', pontos: 15, cor: 'text-blue-400 bg-blue-500/10' },
  medalha_ouro: { label: 'Medalha de Ouro 🥇', pontos: 100, cor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  medalha_prata: { label: 'Medalha de Prata 🥈', pontos: 50, cor: 'text-slate-300 bg-slate-500/10 border-slate-500/20' },
  medalha_bronze: { label: 'Medalha de Bronze 🥉', pontos: 30, cor: 'text-amber-600 bg-amber-700/10 border-amber-700/20' },
  arbitragem: { label: 'Atuação como Árbitro', pontos: 40, cor: 'text-purple-400 bg-purple-500/10' },
  curso: { label: 'Curso Federativo / Técnico', pontos: 25, cor: 'text-teal-400 bg-teal-500/10' },
  exame: { label: 'Aprovação em Exame de Faixa', pontos: 80, cor: 'text-red-400 bg-red-500/10' },
};

const FAIXAS = ['Branca', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'];

export default function RankingPage() {
  const { usuario, tipo, isAdmin } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [atletas, setAtletas] = useState([]); // Apenas para lançamento de pontos do Admin
  const [filiais, setFiliais] = useState([]); // Para filtro
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroFaixa, setFiltroFaixa] = useState('todos');
  const [filtroFilial, setFiltroFilial] = useState('todos');

  // Modal
  const [showModalPontos, setShowModalPontos] = useState(false);
  const [salvandoPontos, setSalvandoPontos] = useState(false);
  const [formPontos, setFormPontos] = useState({
    atleta_id: '',
    tipo_evento: 'evento_participado',
    descricao: '',
    pontos: '15',
  });

  const carregarDados = async () => {
    try {
      const [resRanking, resFiliais] = await Promise.all([
        fetch('/api/ranking'),
        fetch('/api/filiais')
      ]);

      if (resRanking.ok) {
        const data = await resRanking.json();
        setLeaderboard(data.leaderboard || []);
        setHistorico(data.historicoPessoal || []);
      }

      if (resFiliais.ok) {
        const data = await resFiliais.json();
        setFiliais(data.filiais || []);
      }

      // Se for admin, carregar atletas para seleção
      if (tipo === 'admin') {
        const resAtletas = await fetch('/api/atletas');
        if (resAtletas.ok) {
          const data = await resAtletas.json();
          setAtletas(data.atletas || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados do ranking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [tipo]);

  // Handler de tipo de evento mudando os pontos padrão
  const handleTipoEventoChange = (tipo) => {
    const pontosPadrao = PONTOS_EVENTOS[tipo]?.pontos || 0;
    setFormPontos({
      ...formPontos,
      tipo_evento: tipo,
      pontos: String(pontosPadrao),
    });
  };

  const handleLancarPontos = async (e) => {
    e.preventDefault();
    if (!formPontos.atleta_id || !formPontos.descricao || !formPontos.pontos) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setSalvandoPontos(true);
    try {
      const res = await fetch('/api/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPontos)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      toast.success('Pontuação lançada com sucesso!');
      setShowModalPontos(false);
      setFormPontos({ atleta_id: '', tipo_evento: 'evento_participado', descricao: '', pontos: '15' });
      carregarDados();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSalvandoPontos(false);
    }
  };

  // Filtragem da tabela
  const leaderboardFiltrado = leaderboard.filter(atleta => {
    const matchesBusca = atleta.nome.toLowerCase().includes(busca.toLowerCase()) || 
                          atleta.cidade.toLowerCase().includes(busca.toLowerCase());
    const matchesFaixa = filtroFaixa === 'todos' || atleta.faixa === filtroFaixa;
    const matchesFilial = filtroFilial === 'todos' || atleta.filial_id === filtroFilial;
    return matchesBusca && matchesFaixa && matchesFilial;
  });

  // Top 3 do ranking
  const top3 = leaderboard.slice(0, 3);

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
          <p className="text-xs text-ink-600 font-bold tracking-[0.2em] uppercase">Carregando Classificações</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-100 font-cinzel">Ranking Estadual</h1>
          <p className="text-sm text-ink-500 mt-0.5">Pontuação acumulada de atletas por eventos, competições e cursos</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModalPontos(true)}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition hover:scale-105"
          >
            <Plus size={16} /> Lançar Pontuação
          </button>
        )}
      </div>

      {/* Pódio (Top 3) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-end pt-8">
          
          {/* 2º Lugar */}
          {top3[1] && (
            <div className="order-2 md:order-1 bg-gradient-to-t from-dark-200 to-dark-250 border border-slate-500/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative h-60 hover:border-slate-500/30 transition duration-300">
              <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center border border-slate-500/30 absolute -top-5">
                <span className="text-sm font-black text-slate-300">2</span>
              </div>
              <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center text-slate-300 border border-slate-500/25 mb-4">
                <Medal size={24} />
              </div>
              <h3 className="text-sm font-bold text-ink-100 line-clamp-1">{top3[1].nome}</h3>
              <p className="text-[10px] text-ink-600 mt-0.5">{top3[1].filial_nome}</p>
              <div className="mt-4 px-3 py-1 bg-slate-500/15 border border-slate-500/20 rounded-full text-xs font-black text-slate-300">
                {top3[1].pontos} pts
              </div>
            </div>
          )}

          {/* 1º Lugar */}
          {top3[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-t from-dark-200 to-dark-150 border border-gold-500/25 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative h-68 hover:border-gold-500/40 transition duration-300 shadow-xl shadow-gold-500/[0.03]">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/30 absolute -top-6 animate-pulse">
                <span className="text-base font-black text-gold-400">1</span>
              </div>
              <div className="w-14 h-14 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-400 border border-gold-500/25 mb-4">
                <Trophy size={28} className="animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <h3 className="text-base font-bold text-ink-100 line-clamp-1">{top3[0].nome}</h3>
              <p className="text-xs text-ink-600 mt-0.5">{top3[0].filial_nome}</p>
              <div className="mt-4 px-4 py-1.5 bg-gold-500/15 border border-gold-500/20 rounded-full text-sm font-black text-gold-400">
                {top3[0].pontos} pts
              </div>
            </div>
          )}

          {/* 3º Lugar */}
          {top3[2] && (
            <div className="order-3 bg-gradient-to-t from-dark-200 to-dark-250 border border-amber-700/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative h-56 hover:border-amber-700/30 transition duration-300">
              <div className="w-10 h-10 rounded-full bg-amber-700/20 flex items-center justify-center border border-amber-700/30 absolute -top-5">
                <span className="text-sm font-black text-amber-500">3</span>
              </div>
              <div className="w-12 h-12 bg-amber-700/10 rounded-xl flex items-center justify-center text-amber-600 border border-amber-700/25 mb-4">
                <Medal size={24} />
              </div>
              <h3 className="text-sm font-bold text-ink-100 line-clamp-1">{top3[2].nome}</h3>
              <p className="text-[10px] text-ink-600 mt-0.5">{top3[2].filial_nome}</p>
              <div className="mt-4 px-3 py-1 bg-amber-700/15 border border-amber-700/20 rounded-full text-xs font-black text-amber-500">
                {top3[2].pontos} pts
              </div>
            </div>
          )}

        </div>
      )}

      {/* Grid Principal: Classificação + Histórico Pessoal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tabela de Classificação */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink-100 font-cinzel">Classificação Geral</h2>
            
            {/* Filtros e Busca */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
                <input
                  type="text"
                  placeholder="Buscar atleta..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-dark-200 border border-dark-50 rounded-xl text-ink-100 placeholder:text-ink-600 outline-none"
                />
              </div>

              <select
                value={filtroFaixa}
                onChange={(e) => setFiltroFaixa(e.target.value)}
                className="px-3 py-2 text-xs bg-dark-200 border border-dark-50 rounded-xl text-ink-300 outline-none"
              >
                <option value="todos">Todas Faixas</option>
                {FAIXAS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>

              <select
                value={filtroFilial}
                onChange={(e) => setFiltroFilial(e.target.value)}
                className="px-3 py-2 text-xs bg-dark-200 border border-dark-50 rounded-xl text-ink-300 outline-none max-w-[150px]"
              >
                <option value="todos">Todas Academias</option>
                {filiais.map(fil => (
                  <option key={fil.id} value={fil.id}>{fil.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-dark-200 border border-dark-50/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-dark-50/60 text-ink-600 font-bold uppercase tracking-wider text-[10px] bg-dark-250/30">
                    <th className="p-4 w-16 text-center">Posição</th>
                    <th className="p-4">Atleta</th>
                    <th className="p-4">Academia/Filial</th>
                    <th className="p-4">Faixa</th>
                    <th className="p-4 text-right">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-ink-600 italic">
                        Nenhum atleta encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    leaderboardFiltrado.map((atleta) => {
                      const isMe = atleta.id === usuario?.id;
                      return (
                        <tr
                          key={atleta.id}
                          className={`border-b border-dark-50/10 hover:bg-white/[0.01] transition-all ${
                            isMe ? 'bg-gold-500/[0.04] border-l-2 border-l-gold-500' : ''
                          }`}
                        >
                          <td className="p-4 text-center font-black text-ink-350">
                            {atleta.posicao === 1 ? '🥇 1º' :
                             atleta.posicao === 2 ? '🥈 2º' :
                             atleta.posicao === 3 ? '🥉 3º' :
                             `${atleta.posicao}º`}
                          </td>
                          <td className="p-4 font-bold text-ink-100 flex items-center gap-2">
                            {atleta.nome}
                            {isMe && (
                              <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gold-500/20 text-gold-400 rounded">Você</span>
                            )}
                          </td>
                          <td className="p-4 text-ink-400 font-medium">{atleta.filial_nome}</td>
                          <td className="p-4">
                            <span className="bg-dark-300 px-2 py-0.5 rounded text-[10px] font-bold text-ink-300">
                              {atleta.faixa}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-black text-gold-400">{atleta.pontos} pts</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Histórico Recente do Atleta Logado */}
        <div className="lg:col-span-4 space-y-5">
          <h2 className="text-lg font-bold text-ink-100 font-cinzel">Minhas Conquistas</h2>
          
          {historico.length === 0 ? (
            <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-6 text-center">
              <Award size={32} className="text-ink-700 mx-auto mb-3" />
              <p className="text-xs font-semibold text-ink-300">Nenhum ponto ainda</p>
              <p className="text-[11px] text-ink-600 mt-1">Inscreva-se em exames, participe de eventos e competições para começar a pontuar!</p>
            </div>
          ) : (
            <div className="relative border-l border-dark-50/80 ml-3 space-y-6 py-2">
              {historico.map((item) => (
                <div key={item.id} className="relative pl-6">
                  {/* Dot */}
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-gold-500 border-2 border-dark-300 rounded-full" />
                  
                  <div className="bg-dark-200 border border-dark-50/40 p-4 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${PONTOS_EVENTOS[item.tipo_evento]?.cor || 'bg-dark-400 text-ink-400'}`}>
                          {PONTOS_EVENTOS[item.tipo_evento]?.label || 'Pontuação'}
                        </span>
                        <h4 className="text-xs font-bold text-ink-200 mt-1.5">{item.descricao}</h4>
                      </div>
                      <span className="font-mono font-black text-xs text-gold-400 shrink-0">+{item.pontos}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-ink-600">
                      <Clock size={10} />
                      <span>{new Date(item.data_pontuacao + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==================== MODAL: LANÇAR PONTOS (Admin) ==================== */}
      {showModalPontos && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-scale">
            <h3 className="text-lg font-bold text-ink-100 font-cinzel mb-4">Lançar Nova Pontuação</h3>
            
            <form onSubmit={handleLancarPontos} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Selecione o Atleta *</label>
                <select
                  required
                  value={formPontos.atleta_id}
                  onChange={(e) => setFormPontos({ ...formPontos, atleta_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                >
                  <option value="">Selecione um atleta...</option>
                  {atletas.map(a => (
                    <option key={a.id} value={a.id}>{a.nome} (Faixa: {a.faixa || 'Branca'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Tipo de Conquista *</label>
                <select
                  required
                  value={formPontos.tipo_evento}
                  onChange={(e) => handleTipoEventoChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                >
                  {Object.entries(PONTOS_EVENTOS).map(([key, value]) => (
                    <option key={key} value={key}>{value.label} (+{value.pontos} pts)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Pontos *</label>
                  <input
                    type="number"
                    required
                    value={formPontos.pontos}
                    onChange={(e) => setFormPontos({ ...formPontos, pontos: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Data da Conquista</label>
                  <input
                    type="date"
                    required
                    value={formPontos.data_pontuacao || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormPontos({ ...formPontos, data_pontuacao: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Descrição da Conquista *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campeão Categoria Juvenil A, Copa Metropolitana 2026"
                  value={formPontos.descricao}
                  onChange={(e) => setFormPontos({ ...formPontos, descricao: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-50">
                <button
                  type="button"
                  onClick={() => setShowModalPontos(false)}
                  className="btn-outline flex-1 py-2.5 rounded-xl border border-dark-50 text-xs font-bold uppercase text-ink-500 hover:text-ink-200 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={salvandoPontos}
                  className="btn-primary flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-white text-xs font-bold uppercase transition flex items-center justify-center gap-2"
                >
                  {salvandoPontos ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Lançar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
