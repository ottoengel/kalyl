import { Barber } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"

interface BarberItemProps {
  barbers: Barber
}

const BarberItem = ({ barbers }: BarberItemProps) => {
  return (
    <Card className="min-w-[167px] rounded-2xl">
      <CardContent className="p-0 px-1 pt-1">
        {/* IMAGEM */}
        <div className="relative h-[159px] w-full">
          <Image
            fill
            className="rounded-2xls object-cover"
            src={barbers.imageUrl}
            alt={barbers.name}
          />
        </div>

        {/* TEXTO */}
        <div className="px-1 py-3">
          <h3 className="truncate font-semibold">{barbers.name}</h3>
          <Button variant="secondary" className="mt-3 w-full">
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarberItem