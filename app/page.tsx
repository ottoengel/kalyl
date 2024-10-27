import { SearchIcon } from "lucide-react"
import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import Image from "next/image"
import { Input } from "./_components/ui/input"
import { db } from "./_lib/prisma"
import BarberItem from "./_components/barbers-item"
import BookingItem from "./_components/booking-item"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const Home = async () => {
  //pegar o usuário logado
  const session = await getServerSession(authOptions)
  //chamar o banco
  const barbers = await db.barber.findMany({})
  const confirmedBookings = session?.user
    ? await db.booking.findMany({
        where: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId: (session?.user as any).id,
          date: {
            gte: new Date(),
          },
        },
        include: {
          service: {
            include: {
              barber: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      })
    : []

  return (
    <div>
      {/* HEADER */}
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

        {/* BUSCA */}
        <div className="mt-6 flex items-center gap-2">
          <Input placeholder="Faça sua busca..." />
          <Button className="bg-[#F6484B]" variant="outline">
            <SearchIcon />
          </Button>
        </div>
        {/* IMAGEM */}
        <div className="relative mt-6 h-[150px] w-full">
          <Image
            alt="Agende nos melhores com o Kalyls"
            src="/banner-02.png"
            fill
            className="rounded-xl object-cover"
          />
        </div>

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Agendamentos
        </h2>

        {/* AGENDAMENTO */}
        <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {confirmedBookings.map((booking) => (
            <BookingItem key={booking.id} booking={booking} />
          ))}
        </div>

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Barbeiros
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbers.map((barbers) => (
            <BarberItem key={barbers.id} barbers={barbers} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
