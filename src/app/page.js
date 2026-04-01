import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroVideo from '@/components/HeroVideo'
import SobreSection from '@/components/sections/SobreSection'
import DojoKunSection from '@/components/sections/DojoKunSection'
import ProgramasSection from '@/components/sections/ProgramasSection'
import MetodoSection from '@/components/sections/MetodoSection'
import StatsSection from '@/components/sections/StatsSection'
import ContatoSection from '@/components/sections/ContatoSection'

// Fallback content (replaced by DB content when available)
const defaultContent = {
  hero_title: 'Karatê <span class="text-primary">Goju-Ryu</span><br/>Tradicional',
  hero_subtitle: 'IOGKF Brasil · Salvador, Bahia',
  hero_description: 'Onde o caminho começa e nunca termina. Tradição, disciplina e respeito do Karatê Goju-Ryu Okinawano.',
  hero_video_url: 'https://videos.pexels.com/video-files/4441001/4441001-hd_1920_1080_25fps.mp4',
  sobre_eyebrow: 'Honrando a Arte',
  sobre_title: 'Karatê Goju-Ryu Okinawano',
  sobre_p1: 'Nosso compromisso é preservar a disciplina, a tradição e o respeito do Karatê Goju-Ryu Okinawano, promovendo um aprendizado autêntico e inspirador para todos os praticantes.',
  sobre_p2: 'Através da prática do karatê, trabalhamos valores fundamentais como respeito, disciplina, autocontrole, perseverança e responsabilidade, formando cidadãos preparados para os desafios dentro e fora do tatame.',
}

async function getContent() {
  // Dynamic content from Supabase
  // When Supabase is connected, fetch content here
  // const supabase = createClient()
  // const { data } = await supabase.from('site_content').select('*').eq('page', 'home')
  // return Object.fromEntries(data?.map(r => [r.key, r.value]) || [])
  return defaultContent
}

export default async function HomePage() {
  const content = await getContent()

  return (
    <>
      <Navbar />
      <main>
        <HeroVideo
          title={content.hero_title}
          subtitle={content.hero_subtitle}
          description={content.hero_description}
          videoUrl={content.hero_video_url}
        />
        <StatsSection />
        <SobreSection content={{
          eyebrow: content.sobre_eyebrow,
          title: content.sobre_title,
          paragraph1: content.sobre_p1,
          paragraph2: content.sobre_p2,
        }} />
        <DojoKunSection />
        <ProgramasSection />
        <MetodoSection />
        <ContatoSection />
      </main>
      <Footer />
    </>
  )
}
