'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { RefreshCw, Mail, Phone, Trash2, MessageSquare } from 'lucide-react'

export default function AdminContatosPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
      setContacts(data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Remover esta mensagem?')) return
    const supabase = createClient()
    await supabase.from('contacts').delete().eq('id', id)
    if (selected?.id === id) setSelected(null)
    load()
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-2">Gerenciar</p>
        <h1 className="font-cinzel text-3xl text-white font-bold">Mensagens Recebidas</h1>
        <div className="w-10 h-0.5 bg-primary mt-4" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw size={20} className="animate-spin text-gray-500" /></div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-cinzel">Nenhuma mensagem ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            {contacts.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`text-left p-4 border transition-all duration-200 ${selected?.id === c.id ? 'border-primary bg-primary/10' : 'border-dark-border bg-dark-card hover:border-dark-muted'}`}>
                <p className="font-cinzel text-white text-sm font-bold">{c.name}</p>
                <p className="text-gray-500 text-xs mt-1 truncate">{c.message}</p>
                <p className="text-gray-700 text-xs mt-2">
                  {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-dark-card border border-dark-border p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-cinzel text-white text-xl font-bold">{selected.name}</h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(selected.created_at).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(selected.id)} className="text-red-400 hover:text-red-300 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex flex-col gap-3 mb-6">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors text-sm">
                    <Mail size={14} className="text-primary" /> {selected.email}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors text-sm">
                      <Phone size={14} className="text-primary" /> {selected.phone}
                    </a>
                  )}
                </div>
                <div className="border-t border-dark-border pt-5">
                  <p className="text-gray-400 leading-relaxed">{selected.message}</p>
                </div>
                <a href={`mailto:${selected.email}?subject=Re: Goju-Ryu Karate Kai`}
                  className="inline-flex items-center gap-2 mt-6 bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-6 py-3 hover:bg-primary-dark transition-all">
                  <Mail size={14} /> Responder por E-mail
                </a>
              </div>
            ) : (
              <div className="bg-dark-card border border-dark-border flex items-center justify-center h-64 text-gray-600">
                <p className="font-cinzel text-sm">Selecione uma mensagem</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
