import { Barber } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { CalendarDays } from "lucide-react"

interface BarberItemProps {
  barbers: Barber
}

const BarberItem = ({ barbers }: BarberItemProps) => {
  return (
    <Card className="card-hover group w-full overflow-hidden rounded-2xl border-border/60">
      <CardContent className="p-0">
        {/* IMAGEM */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            src={barbers.imageUrl}
            alt={barbers.name}
            sizes="(max-width: 640px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        {/* TEXTO */}
        <div className="space-y-3 p-3 sm:p-4">
          <h3 className="truncate font-display text-xl tracking-wide">
            {barbers.name}
          </h3>
          <Button className="w-full font-semibold" asChild>
            <Link href={`/barbers/${barbers.id}`}>
              <CalendarDays className="mr-1" />
              Reservar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarberItem
