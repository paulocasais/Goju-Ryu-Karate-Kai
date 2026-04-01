import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpen, Users, Globe, Award, Target, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Serviços' }

const servicos = [
  {
    icon: BookOpen,
    title: 'Treinamento Tradicional',
    desc: 'Aulas completas seguindo o currículo técnico da IOGKF Brasil. Kihon (fundamentos), kata (formas) e kumite (combate) trabalhados com rigor e respeito à tradição.',
    details: ['Kihon — técnicas fundamentais', 'Kata — formas tradicionais', 'Bunkai — aplicação das técnicas', 'Kumite — prática de combate'],
  },
  {
    icon: Users,
    title: 'Karatê Infantil',
    desc: 'Programa especial para crianças e adolescentes, desenvolvendo disciplina, autocontrole, respeito e confiança através da prática do Karatê Goju-Ryu.',
    details: ['Faixa etária: 6 a 15 anos', 'Foco em valores e disciplina', 'Desenvolvimento motor', 'Autodefesa adaptada'],
  },
  {
    icon: Target,
    title: 'Karatê Adulto',
    desc: 'Aulas para adultos iniciantes e praticantes avançados, respeitando o ritmo de cada aluno com o rigor técnico do Goju-Ryu.',
    details: ['A partir de 16 anos', 'Todos os níveis', 'Condicionamento físico', 'Técnica avançada'],
  },
  {
    icon: Award,
    title: 'Preparação para Exames',
    desc: 'Preparação específica para exames de graduação (faixas) seguindo os critérios técnicos estabelecidos pela IOGKF Brasil.',
    details: ['Critérios da IOGKF', 'Treino direcionado', 'Avaliação técnica', 'Certificação oficial'],
  },
  {
    icon: Globe,
    title: 'Gasshukus e Seminários',
    desc: 'Participação em cursos intensivos e workshops com instrutores renomados da IOGKF Brasil e convidados internacionais.',
    details: ['Eventos nacionais', 'Convidados internacionais', 'Imersão técnica', 'Comunidade IOGKF'],
  },
  {
    icon: Heart,
    title: 'Aula Experimental',
    desc: 'Quer conhecer o Karatê Goju-Ryu? Venha fazer uma aula experimental gratuita e descubra essa arte marcial milenar.',
    details: ['Totalmente gratuita', 'Sem compromisso', 'Para todas as idades', 'Agende pelo WhatsApp'],
    cta: true,
  },
]

export default function ServicosPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative pt-40 pb-20 bg-dark-card border-b border-dark-border overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c41e2a 0%, transparent 60%)' }} />
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">O que Oferecemos</p>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-white leading-tight mb-6">Serviços</h1>
            <div className="w-16 h-0.5 bg-primary mb-6" />
            <p className="text-gray-400 max-w-xl text-lg">
              Programas de Karatê Goju-Ryu para todas as idades, do iniciante ao praticante avançado.
            </p>
          </div>
        </section>

        <section className="section-pad bg-dark">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicos.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className={`border bg-dark-card p-8 flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 ${s.cta ? 'border-primary/40 bg-primary/5' : 'border-dark-border hover:border-primary/30'}`}>
                    <div className="w-12 h-12 border border-primary/30 flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-cinzel text-white text-xl font-bold mb-3">{s.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {s.details.map((d, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="text-primary text-xs">—</span> {d}
                        </li>
                      ))}
                    </ul>
                    {s.cta && (
                      <Link href="/contato"
                        className="mt-auto bg-primary text-white font-cinzel text-xs tracking-widest uppercase px-6 py-3 text-center hover:bg-primary-dark transition-colors duration-300">
                        Agendar Aula Grátis
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
