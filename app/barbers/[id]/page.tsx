import PhoneItem from "@/app/_components/phone-item"
import ServiceItem from "@/app/_components/service-item"
import SidebarSheet from "@/app/_components/sidebar-sheet"
import { Button } from "@/app/_components/ui/button"
import { Sheet, SheetTrigger } from "@/app/_components/ui/sheet"
import { db } from "@/app/_lib/prisma"
import { BARBER_IDS } from "@/app/_lib/schedule"
import { ChevronLeftIcon, MapPin, MenuIcon, Scissors } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

// Kalyl e Lucas: a foto de capa fica um pouco mais alta que o padrão (topo puro)
const RAISED_COVER_PHOTO_BARBERS: string[] = [BARBER_IDS.KALYL, BARBER_IDS.LUCAS]

interface BarberPageProps {
  params: {
    id: string
  }
}

const BarbersPage = async ({ params }: BarberPageProps) => {
  const barber = await db.barber.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: true,
    },
  })

  if (!barber) {
    return notFound()
  }

  return (
    <div>
      {/* CAPA */}
      <div className="relative h-[220px] w-full sm:h-[280px]">
        <Image
          alt={barber.name}
          src={barber.imageUrl}
          fill
          priority
          className="object-cover"
          style={{
            objectPosition: RAISED_COVER_PHOTO_BARBERS.includes(barber.id)
              ? "center 45%"
              : "center top",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />

        <Button
          size="icon"
          variant="secondary"
          className="absolute left-4 top-4 rounded-full bg-background/70 backdrop-blur"
          asChild
        >
          <Link href="/" aria-label="Voltar">
            <ChevronLeftIcon />
          </Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-4 top-4 rounded-full bg-background/70 backdrop-blur"
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>

        {/* TITULO SOBRE A CAPA */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-4xl px-5 pb-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
              <Scissors size={14} />
              Barbeiro
            </p>
            <h1 className="font-display text-4xl tracking-wide sm:text-5xl">
              {barber.name}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} className="text-primary" />
              R. Augusto Stresser, 725 — Curitiba
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5">
        {/* SERVIÇOS */}
        <section className="mt-8">
          <h2 className="mb-1 font-display text-2xl tracking-wide">
            Serviços <span className="text-primary">disponíveis</span>
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Escolha o serviço, a duração e o melhor horário para você.
          </p>
          <div className="space-y-4">
            {barber.services.map((service) => (
              <ServiceItem
                key={service.id}
                barber={JSON.parse(JSON.stringify(barber))}
                service={JSON.parse(JSON.stringify(service))}
              />
            ))}
          </div>
        </section>

        {/* CONTATO */}
        <section className="mt-10 space-y-3">
          <h2 className="font-display text-2xl tracking-wide">Contato</h2>
          {barber.phones.map((phone) => (
            <PhoneItem key={phone} phone={phone} />
          ))}
        </section>
      </div>
    </div>
  )
}

export default BarbersPage
