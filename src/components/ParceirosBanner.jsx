'use client';

const PARCEIROS = [
  { nome: 'IKTA',      desc: 'International Karatê Goju-Ryu & Taekwondo Association' },
  { nome: 'ISKA',      desc: 'International Sport Karate Association' },
  { nome: 'CBK',       desc: 'Confederação Brasileira de Karatê Goju-Ryu' },
  { nome: 'CONFEBOXE', desc: 'Confederação Brasileira de Boxe' },
  { nome: 'COB',       desc: 'Comitê Olímpico do Brasil' },
  { nome: 'FESPORTE',  desc: 'Federação Baiana de Esportes' },
  { nome: 'SEL-BA',    desc: 'Secretaria de Esporte e Lazer da Bahia' },
];

// Duplica pra garantir o loop contínuo
const ITEMS = [...PARCEIROS, ...PARCEIROS, ...PARCEIROS];

export default function ParceirosBanner() {
  return (
    <section className="bg-dark-400 border-t border-dark-50/60 py-10 overflow-hidden relative">
      {/* Label centralizada */}
      <p className="text-center text-[10px] font-bold text-ink-700 uppercase tracking-[0.3em] mb-6">
        Parceiros &amp; Reconhecimentos
      </p>

      {/* Fades nas bordas */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #07101a 0%, transparent 100%)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(270deg, #07101a 0%, transparent 100%)' }} />

      {/* Track com animação CSS pura */}
      <div className="flex gap-4 marquee-track">
        {ITEMS.map((p, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-12 px-7 bg-dark-200/70 border border-dark-50/50 rounded-xl
                       flex items-center gap-3 group hover:border-cobalt-500/40 hover:bg-cobalt-500/[0.06]
                       transition-all duration-200 cursor-default"
          >
            <span className="text-xs font-black text-ink-400 tracking-[0.2em] group-hover:text-ink-100 transition-colors">
              {p.nome}
            </span>
            <span className="text-[10px] text-ink-700 group-hover:text-ink-600 transition-colors hidden sm:block">
              {p.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
