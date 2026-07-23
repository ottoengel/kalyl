import { format } from "date-fns"
import { Card, CardContent } from "./ui/card"
import { Barber, BarberServices } from "@prisma/client"
import { ptBR } from "date-fns/locale"
import { formatSlotRange } from "../_lib/schedule"

interface BookingSummaryProps {
  service: Pick<BarberServices, "name" | "price">
  barber: Pick<Barber, "name">
  selectedDate: Date
  durationMinutes?: number
  observation?: string | null
}

const BookingSummary = ({
  service,
  barber,
  selectedDate,
  durationMinutes = 30,
  observation,
}: BookingSummaryProps) => {
  return (
    <Card className="rounded-2xl border-border/60 bg-secondary/40">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{service.name}</h2>
          <p className="text-sm font-bold text-primary">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.price))}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">Data</h2>
          <p className="text-sm">
            {format(selectedDate, "d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">Horário</h2>
          <p className="text-sm">
            {formatSlotRange(new Date(selectedDate), durationMinutes)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">Duração</h2>
          <p className="text-sm">
            {durationMinutes === 60 ? "1 hora" : `${durationMinutes} min`}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">Barbeiro</h2>
          <p className="text-sm">{barber.name}</p>
        </div>

        {observation && (
          <div className="border-t border-border/60 pt-3">
            <h2 className="mb-1 text-sm text-muted-foreground">Observação</h2>
            <p className="whitespace-pre-wrap text-sm">{observation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BookingSummary
