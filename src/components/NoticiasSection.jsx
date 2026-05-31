'use client';

/**
 * NoticiasSection — exibe as últimas notícias publicadas na home.
 * Client Component: busca via fetch da API pública, sem dependência de server modules.
 */

import { useState, useEffect } from 'react';
import { FileText, Star, Newspaper } from 'lucide-react';

const PLACEHOLDERS = [1, 2, 3];

function PlaceholderCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-dark-100" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-dark-100 rounded w-1/3" />
        <div className="h-4 bg-dark-100 rounded w-4/5" />
        <div className="h-3 bg-dark-100 rounded w-full" />
        <div className="h-3 bg-dark-100 rounded w-2/3" />
      </div>
    </div>
  );
}

function EmptyCard({ n }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-dark-100 to-dark-200 flex items-center justify-center">
        <Newspaper size={28} className="text-ink-600" />
      </div>
      <div className="p-6">
        <div className="text-xs text-ink-500 mb-2">Em breve</div>
        <h3 className="font-bold text-ink-100 mb-2">Novidades a caminho</h3>
        <p className="text-sm text-ink-400 leading-relaxed">
          Em breve a equipe da GRKK publicará notícias e atualizações aqui.
        </p>
      </div>
    </div>
  );
}

function NoticiaCard({ noticia }) {
  return (
    <div className="card card-hover overflow-hidden group flex flex-col">
      <div className="h-48 overflow-hidden bg-gradient-to-br from-dark-100 to-dark-200 shrink-0">
        {noticia.imagem_url ? (
          <img
            src={noticia.imagem_url}
            alt={noticia.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText size={32} className="text-ink-600" />
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        {noticia.destaque && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-3 w-fit">
            <Star size={9} /> Destaque
          </span>
        )}
        <div className="text-xs text-ink-500 mb-2">
          {new Date(noticia.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        </div>
        <h3 className="font-bold text-ink-100 mb-2 group-hover:text-brand-300 transition line-clamp-2">
          {noticia.titulo}
        </h3>
        {noticia.resumo && (
          <p className="text-sm text-ink-400 leading-relaxed line-clamp-3 flex-1">
            {noticia.resumo}
          </p>
        )}
      </div>
    </div>
  );
}

export default function NoticiasSection() {
  const [noticias, setNoticias] = useState(null); // null = carregando

  useEffect(() => {
    fetch('/api/noticias?limit=3')
      .then((r) => r.json())
      .then((d) => setNoticias(d.noticias ?? []))
      .catch(() => setNoticias([]));
  }, []);

  const carregando = noticias === null;
  const vazias = !carregando && noticias.length === 0;

  return (
    <section className="bg-dark-400 py-20 md:py-28 border-t border-dark-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">Notícias da Federação</h2>
          <p className="text-ink-400 mt-3 max-w-xl mx-auto">
            Fique por dentro das últimas novidades do Karatê Goju-Ryu baiano
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {carregando
            ? PLACEHOLDERS.map((n) => <PlaceholderCard key={n} />)
            : vazias
              ? PLACEHOLDERS.map((n) => <EmptyCard key={n} n={n} />)
              : noticias.map((n) => <NoticiaCard key={n.id} noticia={n} />)
          }
        </div>
      </div>
    </section>
  );
}
