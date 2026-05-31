"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Search, Clock, FileText, ScrollText } from "lucide-react";

const ACOES_CORES = {
  INSERT: "text-green-400 bg-green-500/10",
  UPDATE: "text-gold-400 bg-gold-500/10",
  DELETE: "text-red-400 bg-red-500/10",
  LOGIN: "text-blue-400 bg-blue-500/10",
  LOGOUT: "text-ink-500 bg-ink-500/10",
};

const FIELD_LABELS = {
  nome: "Nome",
  cpf: "CPF",
  sexo: "Sexo",
  data_nascimento: "Data nasc.",
  telefone: "Telefone",
  email: "E-mail",
  uf: "UF",
  cidade: "Cidade",
  endereco: "Endereco",
  nome_professor: "Professor",
  modalidades: "Modalidades",
  filial_id: "ID Filial",
  filial_nome: "Nome filial",
  graduacao: "Graduacao",
  faixa: "Faixa",
  status: "Status",
  titulo: "Titulo",
  descricao: "Descricao",
  data_inicio: "Data inicio",
  data_fim: "Data fim",
};

function formatDateTime(iso) {
  if (!iso) return "--";
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", { hour12: false });
}

function formatFieldValue(key, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Nao";

  if (key === "modalidades" && Array.isArray(value)) {
    if (value.length === 0) return "—";

    return value
      .map((item) => {
        const modalidade = item?.modalidade || "Sem modalidade";
        const graduacao = item?.graduacao || "Sem graduacao";
        const data = item?.data_graduacao
          ? new Date(`${item.data_graduacao}T00:00:00`).toLocaleDateString("pt-BR")
          : "Sem data";
        return `${modalidade} | ${graduacao} | ${data}`;
      })
      .join(" ; ");
  }

  if (Array.isArray(value) || typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function AuditDiff({ anterior, novo }) {
  if (!anterior || !novo) return null;

  const changes = [];

  Object.keys(novo).forEach((key) => {
    if (key === "updated_at" || key === "created_at" || key === "id" || key === "senha_hash") return;

    const oldFormatted = formatFieldValue(key, anterior[key]);
    const newFormatted = formatFieldValue(key, novo[key]);

    if (oldFormatted === newFormatted) return;

    changes.push({
      key,
      label: FIELD_LABELS[key] || key,
      old: oldFormatted,
      new: newFormatted,
    });
  });

  if (changes.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-1.5 border-l-2 border-white/10 pl-3 py-1">
      {changes.map((change) => (
        <div key={change.key} className="flex items-baseline gap-2 text-[11px]">
          <span className="text-ink-300 font-bold min-w-[84px] shrink-0 uppercase tracking-tighter">
            {change.label}
          </span>
          <span className="text-ink-400 line-through break-words max-w-[260px]">
            {change.old}
          </span>
          <span className="text-ink-400 px-1">→</span>
          <span className="text-gold-400 font-bold break-words max-w-[260px]">
            {change.new}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AuditoriaPage() {
  const { usuario } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroTabela, setFiltroTabela] = useState("");

  useEffect(() => {
    async function load() {
      if (!usuario) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtroTabela) params.set("tabela", filtroTabela);

        const res = await fetch(`/api/auditoria?${params}`);
        if (!res.ok) throw new Error("Falha ao carregar logs");

        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar auditoria:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [usuario, filtroTabela]);

  const filteredLogs = logs.filter((item) => {
    if (!search) return true;

    const q = search.toLowerCase();
    return [item.user_name, item.action, item.target, item.description, item.tabela]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(q));
  });

  return (
    <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 w-full">
      <div>
        <h1 className="text-xl font-black text-ink-100 flex items-center gap-2">
          <ScrollText size={20} className="text-ink-400" />
          Auditoria / Historico
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">Registro imutavel de todas as acoes no sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-card p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por usuario, acao, tabela..."
            className="input-field pl-10"
          />
        </div>

        <select
          value={filtroTabela}
          onChange={(e) => setFiltroTabela(e.target.value)}
          className="input-field md:w-64 appearance-none"
        >
          <option value="" className="bg-dark-300">Todas as tabelas</option>
          <option value="atletas" className="bg-dark-300">Atletas</option>
          <option value="filiais" className="bg-dark-300">Filiais</option>
          <option value="eventos" className="bg-dark-300">Eventos</option>
          <option value="noticias" className="bg-dark-300">Noticias</option>
          <option value="usuarios" className="bg-dark-300">Usuarios</option>
          <option value="auth" className="bg-dark-300">Autenticacao</option>
        </select>

        <div className="text-xs text-ink-300 font-bold px-2 tracking-widest uppercase">
          {filteredLogs.length} registro(s)
        </div>
      </div>

      <div className="rounded-2xl border border-dark-50 bg-dark-300 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-brand-400" size={32} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-20 text-center text-ink-500 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-dark-400 flex items-center justify-center">
              <FileText size={24} className="text-ink-600" />
            </div>
            <p>Nenhum registro encontrado para os filtros atuais.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {filteredLogs.map((log) => {
              const corClasse = ACOES_CORES[log.action] || "text-ink-100 bg-dark-400";

              return (
                <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-white/[0.01] transition-all group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-current opacity-70 group-hover:opacity-100 transition-opacity ${corClasse}`}>
                    <ScrollText size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${corClasse}`}>
                        {log.action}
                      </span>
                      {log.tabela && (
                        <span className="text-[10px] font-mono text-ink-300 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                          {log.tabela}
                        </span>
                      )}
                      <span className="text-xs text-ink-300 font-bold">por {log.user_name || "Sistema"}</span>
                    </div>

                    <p className="text-sm text-ink-100 font-semibold mb-1">
                      {log.description || log.target || "Acao realizada"}
                    </p>

                    {log.action === "UPDATE" && (
                      <AuditDiff anterior={log.dados_anteriores} novo={log.dados_novos} />
                    )}

                    <div className="flex items-center gap-4 mt-4 text-[11px] text-ink-400 font-medium uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gold-500/80" />
                        {formatDateTime(log.created_at)}
                      </div>
                      {log.registro_id && (
                        <div className="hidden sm:block text-ink-500">
                          ID: <span className="font-mono text-[10px] text-ink-300">{log.registro_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
