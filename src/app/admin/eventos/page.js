'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Trash2, RefreshCw, X, Calendar, Save } from 'lucide-react'

const tiposEvento = ['Graduação', 'Seminário', 'Competição', 'Treino Especial', 'Gasshuku', 'Outro']
const empty = { title: '', description: '', date: '', time: '', location: '', type: 'Seminário', image_url: '' }

export default function AdminEventosPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase.from('events').select('*').order('date', { ascending: false })
      setEvents(data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      if (form.id) {
        await supabase.from('events').update(form).eq('id', form.id)
      } else {
        await supabase.from('events').insert([form])
      }
      setForm(null)
      load()
    } catch (e) { alert('Erro: ' + e.message) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remover este evento?')) return
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-2">Gerenciar</p>
          <h1 className="font-cinzel text-3xl text-white font-bold">Eventos</h1>
          <div className="w-10 h-0.5 bg-primary mt-4" />
        </div>
        <button onClick={() => setForm({ ...empty })}
          className="flex items-center gap-2 bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-5 py-3 hover:bg-primary-dark transition-all">
          <Plus size={14} /> Novo Evento
        </button>
      </div>

      {/* Modal form */}
      {form && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h3 className="font-cinzel text-white font-bold">{form.id ? 'Editar Evento' : 'Novo Evento'}</h3>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {[
                { key: 'title', label: 'Título *', type: 'text' },
                { key: 'date', label: 'Data *', type: 'date' },
                { key: 'time', label: 'Horário', type: 'time' },
                { key: 'location', label: 'Local', type: 'text' },
                { key: 'image_url', label: 'URL da Imagem', type: 'text' },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-2">
                  <label className="text-gray-400 text-xs font-cinzel uppercase tracking-wider">{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel uppercase">Tipo</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary">
                  {tiposEvento.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel uppercase">Descrição</label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center justify-center gap-2 bg-primary text-white font-cinzel text-xs tracking-widest uppercase py-3 hover:bg-primary-dark transition-all disabled:opacity-60 mt-2">
                {saving ? <><RefreshCw size={14} className="animate-spin" /> Salvando...</> : <><Save size={14} /> Salvar Evento</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw size={20} className="animate-spin text-gray-500" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Calendar size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-cinzel">Nenhum evento cadastrado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map(ev => (
            <div key={ev.id} className="bg-dark-card border border-dark-border p-6 flex items-center gap-6">
              <div className="flex-shrink-0 w-14 h-14 border border-dark-border flex flex-col items-center justify-center bg-dark">
                <span className="font-cinzel text-primary text-lg font-bold leading-none">
                  {new Date(ev.date + 'T00:00:00').getDate().toString().padStart(2, '0')}
                </span>
                <span className="text-gray-600 text-xs font-cinzel">
                  {new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-cinzel text-white font-bold">{ev.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{ev.type} · {ev.location}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setForm(ev)} className="text-gray-400 hover:text-white text-xs font-cinzel border border-dark-border px-3 py-1.5 transition-all">Editar</button>
                <button onClick={() => handleDelete(ev.id)} className="text-red-400 hover:text-red-300 p-1.5"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
