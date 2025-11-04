import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Toaster } from "sonner"
import Footer from "./_components/footer"
import AuthProvider from "./_providers/auth"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Barbearia Kalyl",
  description:
    "Barbearia Kalyl - Estilo, Tradição e Atendimento de Qualidade.",
  icons: {
    icon: "/iconl.png",
  },
  twitter: {
    card: "summary_large_image",
  },
  keywords:
  "barbearia, barbearia kalyl, corte de cabelo masculino, cortes de cabelo modernos, corte degradê, corte social, corte americano, corte navalhado, corte militar, fade haircut, low fade, mid fade, high fade, disfarçado, cabelo na tesoura, cabelo na máquina, cortes masculinos 2025, barba, barba desenhada, barba completa, barba com toalha quente, barba estilizada, cuidados masculinos, sobrancelha masculina, hidratação capilar, selagem masculina, tintura masculina, relaxamento capilar, corte e barba, barbeiro profissional, barbeiro especializado, barbeiro de confiança, barbearia tradicional, barbearia moderna, barbearia em Curitiba, barbearia com estilo, barbearia premium, estética masculina, visual masculino, moda masculina, tendências masculinas, corte masculino curto, corte masculino médio, corte masculino longo, corte para cabelo crespo, corte para cabelo liso, corte para cabelo ondulado, corte masculino estiloso, penteado masculino, pomada capilar, finalização de cabelo, cuidado com a barba, linha do degradê, experiência kalyl, barbearia com atendimento personalizado, ambiente masculino, estilo e atitude, transformação de visual, corte personalizado, barbearia top, barbearia recomendada, melhor barbearia, corte masculino de qualidade, barbearia perto de mim, melhor barbeiro, barbeiro em Curitiba, barbeiro experiente, barbearia para homens, barbearia conceito, barbearia com agendamento online, barbearia de confiança, corte masculino profissional, corte moderno e estiloso, barbeiro referência, barbearia com tradição, barbearia com atendimento premium, cuidados com cabelo e barba, corte masculino tendência, barbearia masculina curitiba",
  robots: "index, follow",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="flex h-full flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
