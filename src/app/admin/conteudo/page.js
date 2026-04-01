'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const sections = [
  {
    id: 'hero',
    label: 'Hero Principal',
    fields: [
      { key: 'hero_title', label: 'Título (HTML permitido)', type: 'textarea', rows: 2 },
      { key: 'hero_subtitle', label: 'Subtítulo (abaixo do logo)', type: 'text' },
      { key: 'hero_description', label: 'Descrição', type: 'textarea', rows: 2 },
      { key: 'hero_video_url', label: 'URL do Vídeo de Fundo', type: 'text', hint: 'URL direta para um arquivo .mp4' },
      { key: 'hero_cta_label', label: 'Texto do botão CTA', type: 'text' },
    ],
  },
  {
    id: 'sobre',
    label: 'Seção — Sobre',
    fields: [
      { key: 'sobre_eyebrow', label: 'Eyebrow (texto vermelho acima)', type: 'text' },
      { key: 'sobre_title', label: 'Título', type: 'text' },
      { key: 'sobre_p1', label: 'Parágrafo 1', type: 'textarea', rows: 3 },
      { key: 'sobre_p2', label: 'Parágrafo 2', type: 'textarea', rows: 3 },
    ],
  },
  {
    id: 'stats',
    label: 'Estatísticas',
    fields: [
      { key: 'stat_1_num', label: 'Número 1 (ex: 15+)', type: 'text' },
      { key: 'stat_1_label', label: 'Label 1', type: 'text' },
      { key: 'stat_2_num', label: 'Número 2', type: 'text' },
      { key: 'stat_2_label', label: 'Label 2', type: 'text' },
      { key: 'stat_3_num', label: 'Número 3', type: 'text' },
      { key: 'stat_3_label', label: 'Label 3', type: 'text' },
      { key: 'stat_4_num', label: 'Número 4', type: 'text' },
      { key: 'stat_4_label', label: 'Label 4', type: 'text' },
    ],
  },
  {
    id: 'contato_info',
    label: 'Informações de Contato',
    fields: [
      { key: 'contato_endereco', label: 'Endereço', type: 'text' },
      { key: 'contato_telefone', label: 'Telefone', type: 'text' },
      { key: 'contato_email', label: 'E-mail', type: 'text' },
      { key: 'horario_1_dia', label: 'Horário 1 — Dia', type: 'text' },
      { key: 'horario_1_hora', label: 'Horário 1 — Hora', type: 'text' },
      { key: 'horario_2_dia', label: 'Horário 2 — Dia', type: 'text' },
      { key: 'horario_2_hora', label: 'Horário 2 — Hora', type: 'text' },
    ],
  },
  {
    id: 'social',
    label: 'Redes Sociais',
    fields: [
      { key: 'social_instagram', label: 'URL Instagram', type: 'text' },
      { key: 'social_facebook', label: 'URL Facebook', type: 'text' },
      { key: 'social_whatsapp', label: 'Número WhatsApp (com DDD)', type: 'text' },
    ],
  },
]

export default function ConteudoPage() {
  const [content, setContent] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const loadContent = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('site_content').select('*').eq('page', 'home')
        if (data) {
          const mapped = Object.fromEntries(data.map(r => [r.key, r.value]))
          setContent(mapped)
        }
      } catch {}
      setLoading(false)
    }
    loadContent()
  }, [])

  const handleChange = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const upserts = Object.entries(content).map(([key, value]) => ({
        page: 'home', key, value, updated_at: new Date().toISOString(),
      }))
      const { error } = await supabase.from('site_content').upsert(upserts, { onConflict: 'page,key' })
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    }
    setSaving(false)
  }

  const currentSection = sections.find(s => s.id === activeSection)

  return (
    <div className="p-6 md:p-10 min-h-screen">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-2">Gerenciar</p>
          <h1 className="font-cinzel text-3xl text-white font-bold">Conteúdo do Site</h1>
          <div className="w-10 h-0.5 bg-primary mt-4" />
        </div>
        <button
          onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-6 py-3 hover:bg-primary-dark transition-all disabled:opacity-60">
          {saved ? <><CheckCircle size={14} /> Salvo!</> : saving ? <><RefreshCw size={14} className="animate-spin" /> Salvando...</> : <><Save size={14} /> Salvar Alterações</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section nav */}
        <div className="flex flex-col gap-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`text-left px-4 py-3 text-sm font-cinzel border transition-all duration-200 ${activeSection === s.id ? 'border-primary bg-primary/10 text-primary' : 'border-dark-border text-gray-400 hover:text-white hover:border-dark-muted'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="lg:col-span-3 bg-dark-card border border-dark-border p-6 md:p-8">
          <h2 className="font-cinzel text-white text-lg font-bold mb-6">{currentSection?.label}</h2>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              <RefreshCw size={20} className="animate-spin mr-3" /> Carregando conteúdo...
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {currentSection?.fields.map(field => (
                <div key={field.key} className="flex flex-col gap-2">
                  <label className="text-gray-400 text-xs font-cinzel tracking-wider uppercase">
                    {field.label}
                    {field.hint && <span className="text-gray-600 ml-2 normal-case font-sans">{field.hint}</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={content[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)}
                      rows={field.rows || 3}
                      className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-y"
                    />
                  ) : (
                    <input
                      type="text" value={content[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)}
                      className="bg-dark border border-dark-border text-white px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
