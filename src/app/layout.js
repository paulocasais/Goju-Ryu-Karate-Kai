import './globals.css'

export const metadata = {
  title: {
    default: 'Goju-Ryu Karate Kai — Karatê Goju-Ryu Tradicional em Salvador',
    template: '%s | Goju-Ryu Karate Kai',
  },
  description: 'Academia filiada à IOGKF Brasil, dedicada à preservação e ensino do Karatê Goju-Ryu Okinawano tradicional em Salvador, Bahia.',
  keywords: ['karate', 'goju-ryu', 'IOGKF', 'artes marciais', 'Salvador', 'Bahia'],
  openGraph: {
    title: 'Goju-Ryu Karate Kai',
    description: 'Karatê Goju-Ryu Tradicional de Okinawa em Salvador, Bahia.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-dark text-white font-body antialiased">
        {children}
      </body>
    </html>
  )
}
