'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Building2, Check, X, Clock,
  AlertTriangle, Loader2, ClipboardCheck, Ban,
  Search, ShieldAlert
} from 'lucide-react'
import { toast } from 'sonner'

export default function AprovacoesPage() {
  const [activeTab, setActiveTab] = useState('atletas') // 'atletas' | 'filiais'
  const [atletas, setAtletas] = useState([])
  const [filiais, setFiliais] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(null) // ID do item em processamento
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [atletasRes, filiaisRes] = await Promise.all([
        fetch('/api/atletas?status=pendente'),
        fetch('/api/filiais?status=pendente')
      ])

      const atletasData = await atletasRes.json()
      const filiaisData = await filiaisRes.json()

      setAtletas(atletasData.atletas || [])
      setFiliais(filiaisData.filiais || [])
    } catch (err) {
      toast.error('Erro ao carregar solicitações pendentes.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApprove = async (id, type) => {
    setActionLoading(id)
    try {
      const endpoint = type === 'atleta' ? `/api/atletas/${id}` : `/api/filiais/${id}`
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'aprovado' })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.erro || 'Falha ao aprovar cadastro.')
      }

      toast.success(type === 'atleta' ? 'Atleta aprovado com sucesso!' : 'Filial aprovada com sucesso!')
      
      // Remove localmente
      if (type === 'atleta') {
        setAtletas(prev => prev.filter(a => a.id !== id))
      } else {
        setFiliais(prev => prev.filter(f => f.id !== id))
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!rejectingId) return

    setActionLoading(rejectingId)
    try {
      const endpoint = activeTab === 'atletas' ? `/api/atletas/${rejectingId}` : `/api/filiais/${rejectingId}`
      const payload = { status: 'reprovado' }
      if (activeTab === 'filiais') {
        payload.motivo_reprovacao = rejectReason.trim()
      }

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.erro || 'Falha ao reprovar cadastro.')
      }

      toast.success(activeTab === 'atletas' ? 'Atleta reprovado.' : 'Filial reprovada.')
      
      if (activeTab === 'atletas') {
        setAtletas(prev => prev.filter(a => a.id !== rejectingId))
      } else {
        setFiliais(prev => prev.filter(f => f.id !== rejectingId))
      }

      setRejectingId(null)
      setRejectReason('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Filtragem dos dados
  const filteredAtletas = atletas.filter(atleta =>
    (atleta.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (atleta.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFiliais = filiais.filter(filial =>
    (filial.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (filial.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Title */}
      <div>
        <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-2">Administração Geral</p>
        <h1 className="font-cinzel text-3xl text-white font-bold">Aprovações de Cadastros</h1>
        <div className="w-10 h-0.5 bg-primary mt-4" />
      </div>

      {/* Tabs / Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border/50 pb-5">
        <div className="flex gap-2 bg-dark-card border border-dark-border/30 p-1.5 rounded-none max-w-sm">
          <button
            onClick={() => { setActiveTab('atletas'); setSearchQuery('') }}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-cinzel tracking-wider uppercase transition-all ${
              activeTab === 'atletas'
                ? 'bg-primary text-white font-bold'
                : 'text-gray-400 hover:text-white hover:bg-dark-muted/40'
            }`}
          >
            <Users size={14} />
            Atletas
            {atletas.length > 0 && (
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'atletas' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'
              }`}>
                {atletas.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('filiais'); setSearchQuery('') }}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-cinzel tracking-wider uppercase transition-all ${
              activeTab === 'filiais'
                ? 'bg-primary text-white font-bold'
                : 'text-gray-400 hover:text-white hover:bg-dark-muted/40'
            }`}
          >
            <Building2 size={14} />
            Filiais
            {filiais.length > 0 && (
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'filiais' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'
              }`}>
                {filiais.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border text-white pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-colors placeholder-gray-600"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={24} />
            <p className="text-xs text-gray-500 font-cinzel tracking-wider uppercase">Carregando solicitações...</p>
          </div>
        </div>
      ) : (activeTab === 'atletas' ? filteredAtletas : filteredFiliais).length === 0 ? (
        <div className="bg-dark-card border border-dark-border p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 bg-dark-border/20 border border-dark-border flex items-center justify-center">
            <ClipboardCheck size={20} className="text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-cinzel text-white uppercase tracking-wider">Nada Pendente</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Nenhuma solicitação de {activeTab === 'atletas' ? 'atleta' : 'filial'} aguarda aprovação no momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeTab === 'atletas' ? (
            filteredAtletas.map((atleta) => (
              <div
                key={atleta.id}
                className="bg-dark-card border border-dark-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-cinzel font-bold text-white leading-none">{atleta.nome}</h3>
                    <span className="text-[9px] font-mono bg-yellow-900/20 border border-yellow-800/30 text-yellow-500 px-2 py-0.5 font-bold uppercase tracking-wider">
                      Pendente
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1.5 text-xs text-gray-400">
                    <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">E-mail:</span> {atleta.email}</p>
                    <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Telefone:</span> {atleta.telefone || '—'}</p>
                    <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Registro:</span> <code className="font-mono text-gray-500">{atleta.registro_federacao}</code></p>
                    {atleta.nome_professor && (
                      <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Professor:</span> {atleta.nome_professor}</p>
                    )}
                    {atleta.filial_nome && (
                      <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Dojo/Filial:</span> {atleta.filial_nome}</p>
                    )}
                    <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Solicitado:</span> {new Date(atleta.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex gap-3 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleApprove(atleta.id, 'atleta')}
                    disabled={actionLoading !== null}
                    className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white p-3 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                  >
                    {actionLoading === atleta.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Aprovar
                  </button>
                  <button
                    onClick={() => setRejectingId(atleta.id)}
                    disabled={actionLoading !== null}
                    className="border border-red-900/40 text-red-400 hover:bg-red-950/20 disabled:opacity-50 p-3 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                  >
                    <Ban size={14} />
                    Reprovar
                  </button>
                </div>
              </div>
            ))
          ) : (
            filteredFiliais.map((filial) => (
              <div
                key={filial.id}
                className="bg-dark-card border border-dark-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-cinzel font-bold text-white leading-none">
                      {filial.nome} {filial.nome_fantasia ? `(${filial.nome_fantasia})` : ''}
                    </h3>
                    <span className="text-[9px] font-mono bg-yellow-900/20 border border-yellow-800/30 text-yellow-500 px-2 py-0.5 font-bold uppercase tracking-wider">
                      Pendente
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1.5 text-xs text-gray-400">
                    <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">E-mail:</span> {filial.email}</p>
                    <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Telefone:</span> {filial.telefone || '—'}</p>
                    <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Responsável:</span> {filial.cpf_responsavel ? `${filial.graduacao_responsavel || 'Sensei'} (${filial.cpf_responsavel})` : '—'}</p>
                    {filial.municipio && (
                      <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Localização:</span> {filial.municipio} / {filial.estado}</p>
                    )}
                    <p><span className="text-gray-600 uppercase font-cinzel tracking-wider mr-1.5">Solicitado:</span> {new Date(filial.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex gap-3 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleApprove(filial.id, 'filial')}
                    disabled={actionLoading !== null}
                    className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white p-3 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                  >
                    {actionLoading === filial.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Aprovar
                  </button>
                  <button
                    onClick={() => setRejectingId(filial.id)}
                    disabled={actionLoading !== null}
                    className="border border-red-900/40 text-red-400 hover:bg-red-950/20 disabled:opacity-50 p-3 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                  >
                    <Ban size={14} />
                    Reprovar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Rejection Justification Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-md p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-dark-border pb-4">
              <div className="w-10 h-10 bg-red-900/20 border border-red-900/40 flex items-center justify-center text-red-400">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="font-cinzel text-white text-base font-bold uppercase tracking-wider">Confirmar Reprovação</h3>
                <p className="text-xs text-gray-500">Tem certeza que deseja reprovar esta solicitação?</p>
              </div>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              {activeTab === 'filiais' && (
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">Justificativa / Motivo</label>
                  <textarea
                    required
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Descreva o motivo da reprovação para que o solicitante possa corrigir no futuro..."
                    className="w-full bg-dark border border-dark-border text-white p-3 text-xs focus:outline-none focus:border-primary transition-colors placeholder-gray-700 resize-none"
                  />
                </div>
              )}
              {activeTab === 'atletas' && (
                <p className="text-xs text-gray-400">
                  Ao reprovar, o registro do atleta pendente será marcado como reprovado e ele não poderá acessar a área restrita do tatame virtual.
                </p>
              )}

              <div className="flex gap-4 pt-2 border-t border-dark-border/60">
                <button
                  type="button"
                  onClick={() => { setRejectingId(null); setRejectReason('') }}
                  className="flex-1 border border-dark-border text-gray-400 hover:text-white font-cinzel text-xs tracking-widest uppercase py-3 hover:bg-dark-muted transition-all text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="flex-1 bg-primary text-white font-cinzel text-xs tracking-widest uppercase py-3 hover:bg-primary-dark transition-all text-center font-bold flex items-center justify-center gap-2"
                >
                  {actionLoading !== null ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    'Reprovar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
