import PhoneItem from "@/app/_components/phone-item"
import ServiceItem from "@/app/_components/service-item"
import SidebarSheet from "@/app/_components/sidebar-sheet"
import { Button } from "@/app/_components/ui/button"
import { Sheet, SheetTrigger } from "@/app/_components/ui/sheet"
import { db } from "@/app/_lib/prisma"
import { ChevronLeftIcon, MenuIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BarberPageProps {
  params: {
    id: string
  }
}

const BarbersPage = async ({ params }: BarberPageProps) => {
  //chamar o banco
  const barber = await db.barber.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: true,
    },
  })

  //se acessar a url passando um id inválido mostrar erro
  if (!barber) {
    return notFound()
  }

  return (
    <div>
      {/* IMAGEM */}
      <div className="relative h-[50px] w-full">

        <Button
          size="icon"
          variant="secondary"
          className="absolute left-4 top-4"
          asChild
        >
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="absolute right-4 top-4"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </div>
      {/* TITULO */}
      <div className="border-b border-solid p-5">
        <h1 className="text-xl font-bold">{barber.name}</h1>
      </div>
      {/* SERVIÇOS */}
      <div className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Serviços</h2>
        <div className="space-y-3">
          {barber.services.map((service) => (
            <ServiceItem
              key={service.id}
              barber={JSON.parse(JSON.stringify(barber))}
              service={JSON.parse(JSON.stringify(service))}
            />
          ))}
        </div>
      </div>

      {/* CONTATO */}
      <div className="space-y-3 p-5">
        {barber.phones.map((phone) => (
          <PhoneItem key={phone} phone={phone} />
        ))}
      </div>
    </div>
  )
}

export default BarbersPage
