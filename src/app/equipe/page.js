import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Equipe' }

// Default team members - replaced by DB content when available
const defaultTeam = [
  {
    id: 1,
    name: 'Sensei Nome Sobrenome',
    role: 'Diretor Técnico',
    belt: 'Faixa Preta — X Dan',
    bio: 'Praticante de Karatê Goju-Ryu há mais de 20 anos, formado e graduado pela IOGKF Brasil. Dedicado à preservação e ensino da arte marcial em sua forma mais tradicional.',
    photo_url: null,
  },
  {
    id: 2,
    name: 'Sensei Nome Sobrenome',
    role: 'Instrutor',
    belt: 'Faixa Preta — X Dan',
    bio: 'Instrutor credenciado pela IOGKF Brasil com vasta experiência em competições nacionais e internacionais. Especialista em kata e bunkai.',
    photo_url: null,
  },
]

export default function EquipePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page Hero */}
        <section className="relative pt-40 pb-20 bg-dark-card border-b border-dark-border overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c41e2a 0%, transparent 60%)' }} />
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-4">Quem Nos Guia</p>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-white leading-tight mb-6">Nossa Equipe</h1>
            <div className="w-16 h-0.5 bg-primary mb-6" />
            <p className="text-gray-400 max-w-xl text-lg">
              Instrutores qualificados e comprometidos com a transmissão autêntica do Karatê Goju-Ryu.
            </p>
          </div>
        </section>

        {/* Team grid */}
        <section className="section-pad bg-dark">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {defaultTeam.map((member) => (
                <div key={member.id} className="border border-dark-border bg-dark-card group hover:border-primary/40 transition-all duration-300">
                  {/* Photo */}
                  <div className="aspect-[4/3] bg-dark-muted flex items-center justify-center overflow-hidden">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="font-cinzel text-white text-xl">
                            {member.name.split(' ')[1]?.[0]}{member.name.split(' ')[2]?.[0]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-6">
                    <span className="text-primary font-cinzel text-xs tracking-wider uppercase">{member.belt}</span>
                    <h3 className="font-cinzel text-white text-xl font-bold mt-2 mb-1">{member.name}</h3>
                    <p className="text-gray-500 text-sm font-cinzel tracking-wider uppercase mb-4">{member.role}</p>
                    <div className="w-8 h-px bg-primary mb-4" />
                    <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
