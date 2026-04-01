'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Trash2, Save, X, RefreshCw } from 'lucide-react'

const emptyMember = { name: '', role: '', belt: '', bio: '', photo_url: '', order: 0 }

export default function AdminEquipePage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase.from('team_members').select('*').order('order')
      setMembers(data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      if (form.id) {
        await supabase.from('team_members').update(form).eq('id', form.id)
      } else {
        await supabase.from('team_members').insert([form])
      }
      setForm(null)
      load()
    } catch (e) { alert('Erro: ' + e.message) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remover este membro?')) return
    const supabase = createClient()
    await supabase.from('team_members').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-2">Gerenciar</p>
          <h1 className="font-cinzel text-3xl text-white font-bold">Equipe</h1>
          <div className="w-10 h-0.5 bg-primary mt-4" />
        </div>
        <button onClick={() => setForm({ ...emptyMember })}
          className="flex items-center gap-2 bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-5 py-3 hover:bg-primary-dark transition-all">
          <Plus size={14} /> Adicionar Membro
        </button>
      </div>

      {/* Form modal */}
      {form && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h3 className="font-cinzel text-white font-bold">{form.id ? 'Editar Membro' : 'Novo Membro'}</h3>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {[
                { key: 'name', label: 'Nome Completo', type: 'text' },
                { key: 'role', label: 'Cargo / Função', type: 'text' },
                { key: 'belt', label: 'Graduação (ex: Faixa Preta — 3º Dan)', type: 'text' },
                { key: 'photo_url', label: 'URL da Foto', type: 'text' },
                { key: 'order', label: 'Ordem de exibição', type: 'number' },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-2">
                  <label className="text-gray-400 text-xs font-cinzel uppercase tracking-wider">{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-cinzel uppercase tracking-wider">Bio</label>
                <textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4}
                  className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center justify-center gap-2 bg-primary text-white font-cinzel text-xs tracking-widest uppercase py-3 hover:bg-primary-dark transition-all disabled:opacity-60 mt-2">
                {saving ? <><RefreshCw size={14} className="animate-spin" /> Salvando...</> : <><Save size={14} /> Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-500"><RefreshCw size={20} className="animate-spin" /></div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="font-cinzel">Nenhum membro cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map(m => (
            <div key={m.id} className="bg-dark-card border border-dark-border p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary text-xs font-cinzel uppercase tracking-wider">{m.belt}</p>
                  <h3 className="text-white font-cinzel font-bold mt-1">{m.name}</h3>
                  <p className="text-gray-500 text-xs">{m.role}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setForm(m)} className="text-gray-400 hover:text-white text-xs font-cinzel border border-dark-border px-3 py-1.5 hover:border-gray-500 transition-all">Editar</button>
                  <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                </div>
              </div>
              {m.bio && <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{m.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
