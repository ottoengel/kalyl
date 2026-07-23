import Header from "./_components/header"
import Image from "next/image"
import { db } from "./_lib/prisma"
import BarberItem from "./_components/barbers-item"
import BookingItem from "./_components/booking-item"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getConfirmedBookings } from "./_data/get-confirmed-bookings"
import FAQ from "./_components/faq-item"
import CheckPhoneNumber from "./_components/checkNumber"
import { Button } from "./_components/ui/button"
import Link from "next/link"
import { CalendarDays, MapPin, Scissors } from "lucide-react"
import { BARBER_IDS } from "./_lib/schedule"

// Ordem fixa de exibição: Kalyl, Lucas, Ygor
const BARBER_ORDER = [BARBER_IDS.KALYL, BARBER_IDS.LUCAS, BARBER_IDS.YGOR]

export const metadata = {
  title: "Barbearia Kalyl - Estilo, Tradição e Atendimento de Qualidade",
  description:
    "A Barbearia Kalyl oferece cortes de cabelo, barba e cuidados masculinos com estilo, tradição e atendimento personalizado. Agende seu horário e eleve seu visual.",
  alternates: {
    canonical: "https://www.barbeariakalyl.com.br/",
  },
  openGraph: {
    title: "Barbearia Kalyl - Estilo e Tradição em Cada Corte",
    description:
      "Cortes modernos, barba bem feita e atendimento de primeira. Na Barbearia Kalyl, você encontra o cuidado que merece. Venha viver a experiência Kalyl!",
    url: "https://www.barbeariakalyl.com.br/",
    siteName: "Barbearia Kalyl",
    images: [
      {
        url: "https://www.barbeariakalyl.com.br/logo.png",
        secure_url: "https://www.barbeariakalyl.com.br/logo.png",
        width: 1200,
        height: 630,
        alt: "Barbearia Kalyl - Corte e Barba com Estilo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barbearia Kalyl - Corte e Barba com Estilo",
    description:
      "Transforme seu visual com a Barbearia Kalyl. Especialistas em cortes masculinos, barba e estilo. Agende seu horário agora!",
    creator: "@barbeariakalyl",
    images: ["https://www.barbeariakalyl.com.br/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: "width=device-width, initial-scale=1",
};

const Home = async () => {
  const session = await getServerSession(authOptions)
  const [barbersList, confirmedBookings] = await Promise.all([
    db.barber.findMany({}),
    getConfirmedBookings(),
  ])
  const barbers = [...barbersList].sort(
    (a, b) => BARBER_ORDER.indexOf(a.id) - BARBER_ORDER.indexOf(b.id),
  )

  return (
    <div>
      <CheckPhoneNumber />
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            alt="Barbearia Kalyl"
            src="/banner_main.jpg"
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary">
            <Scissors size={16} />
            Barbearia Kalyl
          </p>
          <h1 className="font-display text-5xl leading-none text-foreground sm:text-7xl">
            Estilo e tradição
            <br />
            <span className="text-gold-gradient">em cada corte</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Olá, {session?.user ? session.user.name : "seja bem-vindo"}!{" "}
            <span className="capitalize">
              {format(new Date(), "EEEE, dd", { locale: ptBR })}
            </span>
            {" de "}
            <span className="capitalize">
              {format(new Date(), "MMMM", { locale: ptBR })}
            </span>
            . Escolha seu barbeiro e garanta seu horário em segundos.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="font-semibold" asChild>
              <Link href="#barbeiros">
                <CalendarDays className="mr-1" />
                Agendar agora
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link
                href="https://www.google.com/maps/place/Barbearia+Kalyl/@-25.4167769,-49.2546765,17z"
                target="_blank"
              >
                <MapPin className="mr-1" />
                Como chegar
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        {/* AGENDAMENTOS */}
        {confirmedBookings.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-display text-2xl tracking-wide text-foreground">
              Seus <span className="text-primary">agendamentos</span>
            </h2>
            <div className="scrollbar-hidden flex gap-4 overflow-x-auto pb-2">
              {confirmedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </div>
          </section>
        )}

        {/* BARBEIROS */}
        <section id="barbeiros" className="mt-12 scroll-mt-24">
          <h2 className="mb-1 font-display text-3xl tracking-wide text-foreground">
            Nossos <span className="text-primary">barbeiros</span>
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Escolha seu barbeiro preferido e veja os horários disponíveis.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {barbers.map((barber) => (
              <BarberItem key={barber.id} barbers={barber} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <FAQ />
        </section>
      </div>
    </div>
  )
}

export default Home
