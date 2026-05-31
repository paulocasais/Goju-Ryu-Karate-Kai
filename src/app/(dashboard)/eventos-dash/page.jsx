"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  X,
  Loader2,
  Camera,
  Link as LinkIcon,
  FileText,
  Trophy,
  ChevronDown,
  Save
} from "lucide-react";
import { eventService } from "@/lib/services/eventService";
import { auditService } from "@/lib/services/auditService";
import { useAuth } from "@/context/AuthContext";
import ImageLightbox from "@/components/ImageLightbox";

const EVENT_TYPES = [
  { id: "competicao", label: "Competição" },
  { id: "curso", label: "Curso" },
  { id: "seminario", label: "Seminário" },
  { id: "acao_social", label: "Ação Social" },
];

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function DashboardEventosPage() {
  const { isAdmin, isFilial, user, usuario } = useAuth();
  const canEditEvents = isAdmin;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [form, setForm] = useState({
    id: null,
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    imagem_url: "",
    link_regulamento: "",
    link_resultados: "",
    link_certificados: ""
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (isoDate) => {
    if (!isoDate) return "Sem data";
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', { month: 'long' });
  };

  const groupedEvents = useMemo(() => {
    const groups = {};
    events.forEach(event => {
      const year = event.data_inicio ? event.data_inicio.split("-")[0] : "Sem Data";
      if (!groups[year]) groups[year] = [];
      groups[year].push(event);
    });
    return Object.keys(groups).sort((a, b) => b - a).map(year => ({
      year,
      events: groups[year]
    }));
  }, [events]);

  const openCreate = () => {
    setEditingEvent(null);
    setPhotoPreview(null);
    setForm({
      id: null,
      titulo: "",
      descricao: "",
      data_inicio: "",
      data_fim: "",
      imagem_url: "",
      link_regulamento: "",
      link_resultados: "",
      link_certificados: ""
    });
    setShowModal(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setPhotoPreview(event.imagem_url || null);
    setForm({ ...event });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Deseja realmente excluir este evento?")) {
      try {
        const target = events.find((e) => e.id === id)?.titulo || "Evento";
        await eventService.delete(id);

        try {
          await auditService.log({
            user_id: user?.id,
            user_name: user?.name || usuario?.nome,
            target,
            action: "DELETE",
            tabela: "eventos",
            registro_id: id,
            description: `Evento "${target}" excluído`,
            dados_anteriores: events.find((e) => e.id === id) || null,
          });
        } catch {
        }

        setEvents(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        alert("Erro ao excluir evento.");
      }
    }
  };

  const handleSave = async () => {
    if (!form.titulo) return alert("Título é obrigatório.");
    if (!form.data_inicio) return alert("Data de início é obrigatória.");

    try {
      setSaving(true);
      const dataToSave = { ...form, imagem_url: photoPreview };
      const saved = await eventService.save(dataToSave);

      const diff = editingEvent
        ? Object.entries(dataToSave)
            .filter(([key, value]) => editingEvent[key] !== value)
            .map(([key, value]) => `${key}: "${editingEvent[key] ?? ""}" → "${value ?? ""}"`) 
            .join("; ")
        : null;

      try {
        await auditService.log({
          user_id: user?.id,
          user_name: user?.name || usuario?.nome,
          target: saved.titulo,
          action: editingEvent ? "UPDATE" : "INSERT",
          tabela: "eventos",
          registro_id: saved.id,
          description: editingEvent
            ? `Evento "${saved.titulo}" atualizado`
            : `Evento "${saved.titulo}" criado`,
          dados_anteriores: editingEvent || null,
          dados_novos: saved,
        });
      } catch {
      }

      await fetchEvents();
      setShowModal(false);
    } catch (err) {
      alert("Erro ao salvar evento.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20 text-ink-500">
        <Loader2 className="animate-spin mb-2" size={32} />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-ink-100 uppercase tracking-tighter">Eventos</h1>
          <div className="w-12 h-1 bg-brand-500 mt-1 rounded-full"></div>
        </div>
        {canEditEvents && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-brand-500 text-white text-xs font-bold px-5 py-3 rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
          >
            <Plus size={16} /> Novo Evento
          </button>
        )}
      </div>

      <div className="space-y-12">
        {groupedEvents.map(group => (
          <section key={group.year} className="space-y-6">
            <h2 className="text-xl font-black text-ink-100 border-b border-dark-50 pb-2">{group.year}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.events.map(event => (
                <div key={event.id} className="relative group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-dark-50 flex flex-col h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    
                    <div className="aspect-[4/5] relative overflow-hidden bg-dark-100">
                      <ImageLightbox
                        src={event.imagem_url || eventService.getDefaultImage()}
                        alt={event.titulo}
                        className="w-full h-full"
                      />

                      
                      {canEditEvents && (
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(event)}
                            className="p-2 bg-white/90 backdrop-blur rounded-lg text-gold-600 hover:bg-white shadow-lg"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-600 hover:bg-white shadow-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    
                    <div className="p-5 space-y-3 bg-dark-200/5 mt-auto border-t border-dark-50/10 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-100 bg-brand-500/15 rounded-full">
                          {formatMonth(event.data_inicio)}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-800 bg-green-100 rounded-full">
                          {(event.status || 'aberto').replace('_', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <a
                          href={event.link_resultados || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition shadow-sm
                            ${event.link_resultados
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                              : "bg-blue-900/30 text-white/30 cursor-not-allowed"}
                          `}
                        >
                          Resultados
                        </a>
                        <a
                          href={event.link_regulamento || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition shadow-sm
                            ${event.link_regulamento
                              ? "bg-dark-400 text-white hover:bg-dark-500 shadow-black/20"
                              : "bg-dark-400/30 text-white/30 cursor-not-allowed"}
                          `}
                        >
                          Regulamento
                        </a>
                        <a
                          href={event.link_certificados || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition shadow-sm
                            ${event.link_certificados
                              ? "bg-ink-100/10 text-ink-500 border border-ink-100/20 hover:bg-ink-100/20"
                              : "bg-ink-100/5 text-ink-500/20 cursor-not-allowed"}
                          `}
                        >
                          Certificados
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="bg-dark-200 border border-dark-50 rounded-3xl w-full max-w-2xl my-8 relative shadow-2xl page-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-dark-50/50">
              <h3 className="font-black text-ink-100 uppercase tracking-tight">{editingEvent ? "Editar Evento" : "Novo Evento"}</h3>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="p-2 rounded-xl hover:bg-dark-300 text-ink-500 transition disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full aspect-video bg-dark-300 rounded-2xl border-2 border-dashed border-dark-50 overflow-hidden flex flex-col items-center justify-center hover:border-brand-500 transition group"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-ink-500 group-hover:text-brand-400">
                      <Camera size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Banner do Evento</span>
                    </div>
                  )}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} accept="image/*" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-ink-500 tracking-widest mb-1.5 block">Título do Evento *</label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ex: Campeonato Baiano 2026"
                    className="w-full px-4 py-3.5 bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-ink-500 tracking-widest mb-1.5 block">Data Início *</label>
                  <input
                    type="date"
                    value={form.data_inicio}
                    onChange={e => setForm({ ...form, data_inicio: e.target.value })}
                    className="w-full px-4 py-3.5 bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-ink-500 tracking-widest mb-1.5 block">Data Fim</label>
                  <input
                    type="date"
                    value={form.data_fim}
                    onChange={e => setForm({ ...form, data_fim: e.target.value })}
                    className="w-full px-4 py-3.5 bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                  />
                </div>

                <div className="pt-4 sm:col-span-2 border-t border-dark-50/50">
                  <h4 className="text-[10px] font-black uppercase text-gold-500 tracking-[0.2em] mb-4">Links Adicionais</h4>
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-ink-500 tracking-widest mb-1.5 block">Link de Resultados</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={form.link_resultados}
                        onChange={e => setForm({ ...form, link_resultados: e.target.value })}
                        placeholder="https://..."
                        className="w-full pl-10 pr-4 py-3.5 bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                      />
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-ink-500 tracking-widest mb-1.5 block">Link de Regulamento</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={form.link_regulamento}
                        onChange={e => setForm({ ...form, link_regulamento: e.target.value })}
                        placeholder="https://..."
                        className="w-full pl-10 pr-4 py-3.5 bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                      />
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-100" size={14} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-ink-500 tracking-widest mb-1.5 block">Link de Certificados</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={form.link_certificados}
                        onChange={e => setForm({ ...form, link_certificados: e.target.value })}
                        placeholder="https://..."
                        className="w-full pl-10 pr-4 py-3.5 bg-dark-300 border border-dark-50 rounded-xl text-ink-100 outline-none"
                      />
                      <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-500" size={14} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-8 border-t border-dark-50/50 bg-dark-300/30 flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 px-6 py-4 rounded-2xl bg-dark-300 text-ink-300 font-black uppercase tracking-widest hover:bg-dark-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] px-6 py-4 rounded-2xl bg-brand-500 text-white font-black uppercase tracking-widest hover:bg-brand-600 transition shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Save size={18} />
                    {editingEvent ? "Salvar Alterações" : "Criar Evento"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
