import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import Link from "next/link";
import { ArrowRight, Heart, Users, GraduationCap, Building, Target, Trophy, BookOpen, Handshake } from "lucide-react";

export const metadata = { title: "Projetos" };

const PROJETOS = [
  {
    icon: <Trophy size={24} />,
    title: "Campeonatos oficiais da GRKK",
    desc: "Competições estaduais organizadas com chancela oficial, promovendo o desenvolvimento competitivo do esporte.",
  },
  {
    icon: <GraduationCap size={24} />,
    title: "Circuitos de formação técnica",
    desc: "Programas de capacitação para atletas, técnicos e treinadores em diversas modalidades da Karatê Goju-Ryu."
  },
  {
    icon: <BookOpen size={24} />,
    title: "Oficinas de arbitragem",
    desc: "Formação e atualização de árbitros e oficiais para atuação em eventos oficiais.",
  },
  {
    icon: <Heart size={24} />,
    title: "Ações educativas em escolas e comunidades",
    desc: "Projetos que levam a Karatê Goju-Ryu como ferramenta de inclusão social para jovens em situação de vulnerabilidade."
  },
  {
    icon: <Handshake size={24} />,
    title: "Parcerias institucionais",
    desc: "Cooperação com órgãos públicos estaduais e municipais, instituições de ensino, empresas privadas e entidades do terceiro setor.",
  },
];

export default function ProjetosPage() {
  return (
    <>
      <PageHero
        title="Projetos e Eventos"
        subtitle="A GRKK desenvolve e coordena projetos esportivos e sociais que fortalecem a Karatê Goju-Ryu na Bahia."
        breadcrumb="Projetos"
      />

      <section className="bg-dark-300 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-ink-300 leading-relaxed">
            <p>
              A GRKK desenvolve e coordena projetos esportivos e sociais, além de organizar eventos oficiais que
              fortalecem a Karatê Goju-Ryu na Bahia e ampliam sua visibilidade nacional e internacional.
            </p>
            <p>
              Nossos projetos são estruturados com base em planejamento técnico, impacto social e transparência
              institucional.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-dark-400 py-20 border-y border-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Exemplos de Ações"
            subtitle="Conheça as principais frentes de atuação da GRKK"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJETOS.map((projeto, i) => (
              <div key={i} className="card card-hover p-6 group">
                <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                  {projeto.icon}
                </div>
                <h3 className="font-bold text-ink-100 mb-2 group-hover:text-brand-300 transition">
                  {projeto.title}
                </h3>
                <p className="text-sm text-ink-400 leading-relaxed">{projeto.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-dark-300 to-dark-300" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink-100 mb-3">
            Apoie a Karatê Goju-Ryu Baiana
          </h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-ink-300 leading-relaxed mb-4">
            Transformando vidas por meio do esporte, educação e inclusão social.
          </p>
          <p className="text-sm text-ink-400 mb-8">
            A Federação Baiana de Karatê Goju-Ryu desenvolve projetos esportivos e sociais que impactam atletas,
            comunidades e municípios em toda a Bahia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contato" className="btn-primary inline-flex">
              Quero apoiar um projeto <Heart size={16} />
            </Link>
            <Link href="/contato" className="btn-outline inline-flex">
              Falar com a GRKK
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
