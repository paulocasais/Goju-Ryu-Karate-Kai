'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, Calendar, AlertTriangle, CheckCircle2,
  Clock, Plus, Search, Filter, Loader2, QrCode, ClipboardCheck, ArrowUpRight, Flame
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const TIPO_COBRANCA = {
  filiacao: { label: 'Taxa de Filiação', cor: 'text-blue-400 bg-blue-500/10' },
  anuidade: { label: 'Anuidade Federativa', cor: 'text-purple-400 bg-purple-500/10' },
  exame: { label: 'Taxa de Exame de Faixa', cor: 'text-red-400 bg-red-500/10' },
  evento: { label: 'Taxa de Evento/Torneio', cor: 'text-teal-400 bg-teal-500/10' },
  mensalidade: { label: 'Mensalidade', cor: 'text-orange-400 bg-orange-500/10' },
};

const STATUS_COBRANCA = {
  pendente: { label: 'Pendente', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  pago: { label: 'Pago', cls: 'bg-green-500/15 text-green-400 border-green-500/20' },
  atrasado: { label: 'Atrasado', cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  cancelado: { label: 'Cancelado', cls: 'bg-dark-400 text-ink-600 border-dark-50/50' },
};

export default function FinanceiroPage() {
  const { usuario, tipo, isAdmin, isFilial, isAtleta } = useAuth();
  const [pagamentos, setPagamentos] = useState([]);
  const [atletas, setAtletas] = useState([]); // Apenas para Admin gerar cobrança
  const [filiais, setFiliais] = useState([]); // Apenas para Admin gerar cobrança
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Modais
  const [showNovaCobrancaModal, setShowNovaCobrancaModal] = useState(false);
  const [showPagarModal, setShowPagarModal] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState(null);

  // Form Lançamento (Admin)
  const [novaCobrancaForm, setNovaCobrancaForm] = useState({
    destinatario_tipo: 'atleta',
    atleta_id: '',
    filial_id: '',
    tipo: 'anuidade',
    valor: '',
    data_vencimento: '',
  });

  // Metodo Pagamento Atleta
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [copiouChave, setCopiouChave] = useState(false);

  const carregarDados = async () => {
    try {
      const res = await fetch('/api/financeiro');
      if (res.ok) {
        const data = await res.json();
        setPagamentos(data.pagamentos || []);
      }

      if (tipo === 'admin') {
        const [resAtletas, resFiliais] = await Promise.all([
          fetch('/api/atletas'),
          fetch('/api/filiais')
        ]);
        if (resAtletas.ok) {
          const data = await resAtletas.json();
          setAtletas(data.atletas || []);
        }
        if (resFiliais.ok) {
          const data = await resFiliais.json();
          setFiliais(data.filiais || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [tipo]);

  // Handler criar cobrança (Admin)
  const handleCriarCobranca = async (e) => {
    e.preventDefault();
    if (!novaCobrancaForm.valor || !novaCobrancaForm.data_vencimento) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      tipo: novaCobrancaForm.tipo,
      valor: parseFloat(novaCobrancaForm.valor),
      data_vencimento: novaCobrancaForm.data_vencimento
    };

    if (novaCobrancaForm.destinatario_tipo === 'atleta') {
      payload.atleta_id = novaCobrancaForm.atleta_id;
    } else {
      payload.filial_id = novaCobrancaForm.filial_id;
    }

    try {
      const res = await fetch('/api/financeiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      toast.success('Cobrança lançada com sucesso!');
      setShowNovaCobrancaModal(false);
      setNovaCobrancaForm({ destinatario_tipo: 'atleta', atleta_id: '', filial_id: '', tipo: 'anuidade', valor: '', data_vencimento: '' });
      carregarDados();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handler efetuar pagamento (Simulado)
  const handleEfetuarPagamento = async () => {
    if (!selectedPagamento) return;
    setProcessandoPagamento(true);

    try {
      const res = await fetch(`/api/financeiro/${selectedPagamento.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pago',
          metodo_pagamento: metodoPagamento
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      toast.success('Pagamento efetuado e compensado com sucesso!');
      setShowPagarModal(false);
      setSelectedPagamento(null);
      carregarDados();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessandoPagamento(false);
    }
  };

  // Alterar Status diretamente (Admin)
  const handleAlterarStatus = async (id, novoStatus) => {
    try {
      const res = await fetch(`/api/financeiro/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro);
      }
      toast.success('Status da fatura atualizado.');
      carregarDados();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Estatísticas Financeiras
  const hoje = new Date().toISOString().split('T')[0];
  const faturasPagas = pagamentos.filter(p => p.status === 'pago');
  const faturasPendentes = pagamentos.filter(p => p.status === 'pendente');
  const faturasAtrasadas = pagamentos.filter(p => p.status === 'atrasado' || (p.status === 'pendente' && p.data_vencimento < hoje));

  const totalPago = faturasPagas.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
  const totalPendente = faturasPendentes.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
  const totalAtrasado = faturasAtrasadas.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

  const taxaInadimplencia = pagamentos.length > 0 
    ? ((faturasAtrasadas.length / pagamentos.length) * 100).toFixed(1) 
    : '0';

  // Filtragem da tabela
  const pagamentosFiltrados = pagamentos.filter(p => {
    const nomeBusca = (p.atleta_nome || p.filial_nome || '').toLowerCase();
    const matchesBusca = busca === '' || nomeBusca.includes(busca.toLowerCase()) || p.tipo.toLowerCase().includes(busca.toLowerCase());
    const matchesStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    const matchesTipo = filtroTipo === 'todos' || p.tipo === filtroTipo;
    return matchesBusca && matchesStatus && matchesTipo;
  });

  const copiarChavePix = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136e3954f9a-14d2-45e0-94d1-ea926b482bc65204000053039865802BR5920Federacao Baiana GRKK6008Salvador62070503***6304D1A2');
    setCopiouChave(true);
    toast.success('Chave Copia e Cola copiada para a área de transferência!');
    setTimeout(() => setCopiouChave(false), 3000);
  };

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
          <p className="text-xs text-ink-600 font-bold tracking-[0.2em] uppercase">Carregando Finanças</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 w-full max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-100 font-cinzel">Controle Financeiro</h1>
          <p className="text-sm text-ink-500 mt-0.5">Gerenciamento de anuidades, taxas e mensalidades federativas</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowNovaCobrancaModal(true)}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition hover:scale-105"
          >
            <Plus size={16} /> Lançar Faturamento
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-5 flex items-center gap-4 hover:border-dark-50 transition cursor-default">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-ink-100">
              {totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-ink-500">{(isAtleta || isFilial) ? 'Total Pago' : 'Total Recebido'}</p>
          </div>
        </div>

        <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-5 flex items-center gap-4 hover:border-dark-50 transition cursor-default">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0 text-yellow-400">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-ink-100">
              {totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-ink-500">{(isAtleta || isFilial) ? 'Pendente de Pagamento' : 'Faturamento em Aberto'}</p>
          </div>
        </div>

        <div className="bg-dark-200 border border-dark-50/60 rounded-2xl p-5 flex items-center gap-4 hover:border-dark-50 transition cursor-default">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-400">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-ink-100">
              {isAdmin 
                ? `${taxaInadimplencia}%` 
                : totalAtrasado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              }
            </p>
            <p className="text-xs text-ink-500">{isAdmin ? 'Taxa de Inadimplência' : 'Total Vencido / Atrasado'}</p>
          </div>
        </div>
      </div>

      {/* Filtros & Tabela */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink-100 font-cinzel">Faturas & Cobranças</h2>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
              <input
                type="text"
                placeholder="Buscar faturas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-dark-200 border border-dark-50 rounded-xl text-ink-100 placeholder:text-ink-600 outline-none"
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-dark-200 border border-dark-50 rounded-xl text-ink-300 outline-none"
            >
              <option value="todos">Todos Status</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 text-xs bg-dark-200 border border-dark-50 rounded-xl text-ink-300 outline-none"
            >
              <option value="todos">Todos Tipos</option>
              <option value="anuidade">Anuidade</option>
              <option value="mensalidade">Mensalidade</option>
              <option value="exame">Exame</option>
              <option value="evento">Evento</option>
              <option value="filiacao">Filiação</option>
            </select>
          </div>
        </div>

        {/* Tabela de Cobranças */}
        <div className="bg-dark-200 border border-dark-50/60 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-dark-50/60 text-ink-600 font-bold uppercase tracking-wider text-[10px] bg-dark-250/30">
                  <th className="p-4">Destinatário</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagamentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-ink-650 italic">
                      Nenhuma cobrança financeira localizada.
                    </td>
                  </tr>
                ) : (
                  pagamentosFiltrados.map((item) => {
                    const statusConfig = STATUS_COBRANCA[item.status] || STATUS_COBRANCA.pendente;
                    const vencido = item.status === 'pendente' && item.data_vencimento < hoje;
                    
                    return (
                      <tr key={item.id} className="border-b border-dark-50/10 hover:bg-white/[0.01] transition-all">
                        <td className="p-4">
                          {item.atleta_nome ? (
                            <div>
                              <p className="font-bold text-ink-100">{item.atleta_nome}</p>
                              <p className="text-[10px] text-ink-650">Atleta</p>
                            </div>
                          ) : item.filial_nome ? (
                            <div>
                              <p className="font-bold text-ink-100">{item.filial_nome}</p>
                              <p className="text-[10px] text-ink-650">Filial</p>
                            </div>
                          ) : (
                            <span className="text-ink-600 italic">Desconhecido</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${TIPO_COBRANCA[item.tipo]?.cor || 'bg-dark-300 text-ink-300'}`}>
                            {TIPO_COBRANCA[item.tipo]?.label || item.tipo}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-ink-300">
                          {new Date(item.data_vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-right font-mono font-black text-ink-100">
                          {parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            vencido ? STATUS_COBRANCA.atrasado.cls : statusConfig.cls
                          }`}>
                            {vencido ? 'Atrasado' : statusConfig.label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === 'pendente' && (isAtleta || isFilial) && (
                              <button
                                onClick={() => {
                                  setSelectedPagamento(item);
                                  setShowPagarModal(true);
                                }}
                                className="px-3.5 py-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-[10px] font-bold text-gold-400 rounded-lg border border-gold-500/15 transition flex items-center gap-1"
                              >
                                Pagar <ArrowUpRight size={12} />
                              </button>
                            )}

                            {isAdmin && item.status === 'pendente' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleAlterarStatus(item.id, 'pago')}
                                  className="px-2 py-1 bg-green-500/15 border border-green-500/25 text-green-400 text-[10px] font-bold rounded-lg hover:bg-green-500 hover:text-white transition"
                                >
                                  Compensar
                                </button>
                                <button
                                  onClick={() => handleAlterarStatus(item.id, 'cancelado')}
                                  className="px-2 py-1 bg-dark-400 border border-dark-50 text-ink-600 text-[10px] font-bold rounded-lg hover:bg-red-500/10 hover:text-red-405 transition"
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== MODAL: PAGAR (Simulado Atleta/Filial) ==================== */}
      {showPagarModal && selectedPagamento && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-scale">
            <h3 className="text-base font-black text-gold-400 font-cinzel mb-1">Efetuar Pagamento</h3>
            <p className="text-xs text-ink-500 mb-5">Selecione o método e conclua a simulação.</p>

            <div className="bg-dark-300 border border-dark-50 p-4 rounded-xl mb-5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-600">Descrição:</span>
                <span className="font-bold text-ink-200">{TIPO_COBRANCA[selectedPagamento.tipo]?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Vencimento:</span>
                <span className="font-bold text-ink-200">{new Date(selectedPagamento.data_vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between border-t border-dark-50 pt-2 text-sm">
                <span className="font-bold text-ink-300">Valor Total:</span>
                <span className="font-mono font-black text-gold-400">
                  {parseFloat(selectedPagamento.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            {/* Abas Métodos */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-dark-400 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setMetodoPagamento('pix')}
                className={`py-2 rounded-lg text-xs font-bold uppercase transition ${
                  metodoPagamento === 'pix' ? 'bg-gold-500 text-dark-300 shadow-md font-black' : 'text-ink-500 hover:text-ink-200'
                }`}
              >
                PIX
              </button>
              <button
                type="button"
                onClick={() => setMetodoPagamento('cartao')}
                className={`py-2 rounded-lg text-xs font-bold uppercase transition ${
                  metodoPagamento === 'cartao' ? 'bg-gold-500 text-dark-300 shadow-md font-black' : 'text-ink-500 hover:text-ink-200'
                }`}
              >
                Cartão
              </button>
            </div>

            {/* Tela PIX */}
            {metodoPagamento === 'pix' ? (
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl w-fit">
                  <QrCode size={120} className="text-dark-300" />
                </div>
                <div className="w-full">
                  <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1.5">Código PIX Copia e Cola</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value="00020126580014br.gov.bcb.pix0136e3954f9a-14d2-45e0-94d1-ea926b482bc65204000053039865802BR5920Federacao Baiana GRKK6008Salvador62070503***6304D1A2"
                      className="flex-1 px-3 py-2 text-xs bg-dark-300 border border-dark-50 rounded-xl text-ink-600 outline-none truncate"
                    />
                    <button
                      onClick={copiarChavePix}
                      className="px-3 bg-dark-300 hover:bg-dark-50 border border-dark-50 rounded-xl text-ink-300 text-xs font-bold flex items-center justify-center transition"
                    >
                      {copiouChave ? <ClipboardCheck size={14} className="text-green-400" /> : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Tela Cartão
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1.5">Número do Cartão</label>
                  <input
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    className="w-full px-3.5 py-2.5 text-xs bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1.5">Validade</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1.5">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-dark-50 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowPagarModal(false);
                  setSelectedPagamento(null);
                }}
                className="btn-outline flex-1 py-2.5 rounded-xl border border-dark-50 text-xs font-bold uppercase text-ink-500 hover:text-ink-200 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleEfetuarPagamento}
                disabled={processandoPagamento}
                className="btn-primary flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-white text-xs font-bold uppercase transition flex items-center justify-center gap-2"
              >
                {processandoPagamento ? <><Loader2 size={14} className="animate-spin" /> Processando...</> : 'Confirmar Pagamento'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== MODAL: LANÇAR NOVO FATURAMENTO (Admin) ==================== */}
      {showNovaCobrancaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-dark-50 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-scale">
            <h3 className="text-lg font-bold text-ink-100 font-cinzel mb-4">Lançar Novo Faturamento</h3>
            
            <form onSubmit={handleCriarCobranca} className="space-y-4">
              
              {/* Tipo de Destinatário */}
              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Destinar Faturamento para:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-dark-400 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNovaCobrancaForm({ ...novaCobrancaForm, destinatario_tipo: 'atleta' })}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition ${
                      novaCobrancaForm.destinatario_tipo === 'atleta' ? 'bg-gold-500 text-dark-300 font-black shadow-md' : 'text-ink-500 hover:text-ink-200'
                    }`}
                  >
                    Atleta
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovaCobrancaForm({ ...novaCobrancaForm, destinatario_tipo: 'filial' })}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition ${
                      novaCobrancaForm.destinatario_tipo === 'filial' ? 'bg-gold-500 text-dark-300 font-black shadow-md' : 'text-ink-500 hover:text-ink-200'
                    }`}
                  >
                    Filial
                  </button>
                </div>
              </div>

              {/* Seletor Atleta */}
              {novaCobrancaForm.destinatario_tipo === 'atleta' ? (
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Selecione o Atleta *</label>
                  <select
                    required
                    value={novaCobrancaForm.atleta_id}
                    onChange={(e) => setNovaCobrancaForm({ ...novaCobrancaForm, atleta_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                  >
                    <option value="">Escolha um atleta...</option>
                    {atletas.map(a => (
                      <option key={a.id} value={a.id}>{a.nome} (Faixa: {a.faixa || 'Branca'})</option>
                    ))}
                  </select>
                </div>
              ) : (
                // Seletor Filial
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Selecione a Filial *</label>
                  <select
                    required
                    value={novaCobrancaForm.filial_id}
                    onChange={(e) => setNovaCobrancaForm({ ...novaCobrancaForm, filial_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                  >
                    <option value="">Escolha uma filial...</option>
                    {filiais.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Tipo de Faturamento *</label>
                <select
                  required
                  value={novaCobrancaForm.tipo}
                  onChange={(e) => setNovaCobrancaForm({ ...novaCobrancaForm, tipo: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                >
                  <option value="anuidade">Anuidade Federativa</option>
                  <option value="mensalidade">Mensalidade</option>
                  <option value="exame">Taxa de Exame de Faixa</option>
                  <option value="evento">Taxa de Evento / Torneio</option>
                  <option value="filiacao">Taxa de Filiação</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Valor (R$) *</label>
                  <input
                    type="number"
                    required
                    placeholder="120.00"
                    value={novaCobrancaForm.valor}
                    onChange={(e) => setNovaCobrancaForm({ ...novaCobrancaForm, valor: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={novaCobrancaForm.data_vencimento}
                    onChange={(e) => setNovaCobrancaForm({ ...novaCobrancaForm, data_vencimento: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-50">
                <button
                  type="button"
                  onClick={() => setShowNovaCobrancaModal(false)}
                  className="btn-outline flex-1 py-2.5 rounded-xl border border-dark-50 text-xs font-bold uppercase text-ink-500 hover:text-ink-200 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-white text-xs font-bold uppercase transition"
                >
                  Lançar Cobrança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
