import { format } from "date-fns"
import { Card, CardContent } from "./ui/card"
import { Barber, BarberServices } from "@prisma/client"
import { ptBR } from "date-fns/locale"

interface BookingSummaryProps {
  service: Pick<BarberServices, "name" | "price">
  barber: Pick<Barber, "name">
  selectedDate: Date
}

const BookingSummary = ({
  service,
  barber,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{service.name}</h2>
          <p className="text-sm font-bold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.price))}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Data</h2>
          <p className="text-sm">
            {format(selectedDate, "d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Horário</h2>
          <p className="text-sm">{format(selectedDate, "HH:mm")}</p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Barbeiro</h2>
          <p className="text-sm">{barber.name}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
