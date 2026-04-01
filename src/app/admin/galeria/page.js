'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Trash2, RefreshCw, X, Image } from 'lucide-react'

const categorias = ['Treinos', 'Eventos', 'Gasshukus', 'Graduações', 'Outros']

export default function AdminGaleriaPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', category: 'Treinos', type: 'photo' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false })
      setItems(data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('gallery_items').insert([form])
      setForm({ title: '', url: '', category: 'Treinos', type: 'photo' })
      setShowForm(false)
      load()
    } catch (e) { alert('Erro: ' + e.message) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remover esta foto?')) return
    const supabase = createClient()
    await supabase.from('gallery_items').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-2">Gerenciar</p>
          <h1 className="font-cinzel text-3xl text-white font-bold">Galeria</h1>
          <div className="w-10 h-0.5 bg-primary mt-4" />
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-5 py-3 hover:bg-primary-dark transition-all">
          <Plus size={14} /> Adicionar Foto
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h3 className="font-cinzel text-white font-bold">Nova Foto</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel uppercase">Título (opcional)</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel uppercase">URL da Imagem *</label>
                <input type="url" required value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel uppercase">Categoria</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {form.url && (
                <div className="aspect-video bg-dark border border-dark-border overflow-hidden">
                  <img src={form.url} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                </div>
              )}
              <button type="submit" disabled={saving}
                className="bg-primary text-white font-cinzel text-xs tracking-widest uppercase py-3 hover:bg-primary-dark transition-all disabled:opacity-60">
                {saving ? 'Salvando...' : 'Adicionar à Galeria'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw size={20} className="animate-spin text-gray-500" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative aspect-square bg-dark-card border border-dark-border overflow-hidden group">
              <img src={item.url} alt={item.title || 'Foto'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {item.title && <p className="text-white text-xs font-cinzel text-center px-2">{item.title}</p>}
                <span className="text-primary text-xs font-cinzel">{item.category}</span>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 mt-2">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-600">
              <Image size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-cinzel">Nenhuma foto ainda. Adicione a primeira!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
