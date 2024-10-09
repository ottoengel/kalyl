import { SearchIcon } from "lucide-react"
import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import Image from "next/image"
import { Input } from "./_components/ui/input"
import { db } from "./_lib/prisma"
import BarberItem from "./_components/barbers-item"
import BookingItem from "./_components/booking-item"

const Home = async () => {
  //chamar o banco
  const barbers = await db.barber.findMany({})

  return (
    <div>
      {/* HEADER */}
      <Header />
      <div className="p-5">
        {/* TEXTO */}
        <h2 className="text-xl font-bold">Olá, User</h2>
        <p>Segunda Feira, 00 de setembro.</p>
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

        {/* AGENDAMENTO */}
        <BookingItem />

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
