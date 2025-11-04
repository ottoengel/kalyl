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
  //pegar o usuário logado
  const session = await getServerSession(authOptions)
  //chamar o banco  
  const barbers = await db.barber.findMany({})
  const confirmedBookings = await getConfirmedBookings()
  
  return (
    <div>
      {/* HEADER */}
      <CheckPhoneNumber />
      <Header />
      <div className="p-5">
        {/* TEXTO */}
        <h2 className="text-xl font-bold">
          Olá, {session?.user ? session.user.name : "bem vindo"}
        </h2>
        <p>
          <span className="capitalize">
            {format(new Date(), "EEEE, dd", { locale: ptBR })}
          </span>
          <span>&nbsp;de&nbsp;</span>
          <span className="capitalize">
            {format(new Date(), "MMMM", { locale: ptBR })}
          </span>
        </p>

        {/* IMAGEM */}
        <div className="flex justify-center items-center">
          <Image
            alt="Agende nos melhores com o Kalyls"
            src="/banner-02.png"

            className="rounded-xl object-cover"

            width={780}
            height={500}
          />
        </div>

        {/* <div className={styles.container}>

            <Image src={Banner} width={400} height={300}

          </div> */}
        {confirmedBookings.length > 0 && (
          <>
            <h2 className="relative mb-3 mt-6 text-xs font-bold uppercase text-gray-400 justify-center items-center">
              Agendamentos
            </h2>

            {/* AGENDAMENTO */}
            <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {confirmedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Barbeiros
        </h2>
        <div className="grid grid-cols-2 gap-6 justify-items-center">
          {barbers.map((barber, index) => (
            <div
              key={barber.id}
              className={`w-full flex justify-center ${
                index === barbers.length - 1 && barbers.length % 2 !== 0
                  ? "col-span-2 justify-center"
                  : ""
              }`}
            >
              <BarberItem barbers={barber} />
            </div>
          ))}
        </div>


        <div className="pt-3">
          <FAQ />
        </div>
      </div>
    </div>
  )
}

export default Home
