/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Calendar } from "@/app/_components/ui/calendar"
import { Button } from "@/app/_components/ui/button"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import { isPast, isToday, set } from "date-fns"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { createBooking } from "@/app/_actions/create-booking"
import { getBookings } from "@/app/_actions/get-bookings"
import { Barber, BarberServices } from "@prisma/client"

interface ServiceItemProps {
  service: Pick<BarberServices, "name" | "price" | "id"> // Aceitando apenas name, price e id
  barber: Pick<Barber, "name" | "id">
}
console.log("Variáveis de Ambiente:", {
  MENSALISTA_CABELO_ID: process.env.NEXT_PUBLIC_MENSALISTA_CABELO_ID,
  MENSALISTA_BARBA_ID: process.env.NEXT_PUBLIC_MENSALISTA_BARBA_ID,
  MENSALISTA_CABELO_E_BARBA_ID:
    process.env.NEXT_PUBLIC_MENSALISTA_CABELO_E_BARBA_ID,
})

const TIME_LIST = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
]

const getServiceIdFromRole = (role: string): string | undefined => {
  console.log("Recebido role:", role)

  switch (role) {
    case "MENSALISTA_CABELO":
      console.log(
        "Retornando MENSALISTA_CABELO_ID:",
        process.env.NEXT_PUBLIC_MENSALISTA_CABELO_ID,
      )
      return (
        process.env.NEXT_PUBLIC_MENSALISTA_CABELO_ID || "fallback-cabelo-id"
      )
    case "MENSALISTA_BARBA":
      console.log(
        "Retornando MENSALISTA_BARBA_ID:",
        process.env.NEXT_PUBLIC_MENSALISTA_BARBA_ID,
      )
      return process.env.NEXT_PUBLIC_MENSALISTA_BARBA_ID || "fallback-barba-id"
    case "MENSALISTA_CABELO_E_BARBA":
      console.log(
        "Retornando MENSALISTA_CABELO_E_BARBA_ID:",
        process.env.NEXT_PUBLIC_MENSALISTA_CABELO_E_BARBA_ID,
      )
      return (
        process.env.NEXT_PUBLIC_MENSALISTA_CABELO_E_BARBA_ID ||
        "fallback-cabeloe-barba-id"
      )
    default:
      console.error("Role não reconhecido no switch:", role)
      return undefined
  }
}

const Booking = ({ service, barber }: ServiceItemProps) => {
  const { data } = useSession()
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [dayBookings, setDayBookings] = useState<any[]>([])
  const [userBookings, setUserBookings] = useState<number>(0)

  useEffect(() => {
    if (!data?.user || !selectedDay || !service || !barber) return

    const fetchBookings = async () => {
      try {
        const serviceId = data.user.role
          ? getServiceIdFromRole(data.user.role)
          : undefined

        if (!serviceId) {
          console.error(
            "Não foi possível determinar o serviço com base no plano do usuário.",
          )
          return
        }

        const allBookings = await getBookings({
          serviceId,
          date: selectedDay,
          barberId: barber.id,
        })

        const userBookings = allBookings.filter(
          (booking) => booking.userId === data.user.id,
        )
        setUserBookings(userBookings.length)

        const dayBookings = userBookings.filter(
          (booking) =>
            new Date(booking.date).toDateString() ===
            selectedDay.toDateString(),
        )
        setDayBookings(dayBookings)
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error)
      }
    }

    fetchBookings()
  }, [selectedDay, data, service, barber])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime.split(":")[0]),
      minutes: Number(selectedTime.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate) {
        toast.error("Selecione um horário antes de prosseguir.")
        return
      }
      if (!barber || !barber.id) {
        console.error("Barber ou barber.id estão indefinidos:", barber)
        toast.error("Erro ao identificar o barbeiro para a reserva.")
        return
      }

      console.log("Role do usuário:", data?.user?.role)
      console.log("Chamando getServiceIdFromRole para o role:", data?.user.role)
      const serviceId = data?.user?.role
        ? getServiceIdFromRole(data.user.role)
        : undefined
      console.log("ServiceId obtido pelo getServiceIdFromRole:", serviceId)
      console.log(`Role recebido do usuário: "${data?.user?.role}"`)
      console.log("Tipo de role:", typeof data?.user?.role)

      console.log("ServiceId obtido:", serviceId)

      if (!serviceId) {
        console.error("ServiceId não encontrado para o role:", data?.user?.role)
        toast.error(
          "Não foi possível determinar o serviço com base no plano do usuário.",
        )
        return
      }

      console.log("ServiceId encontrado:", serviceId)

      await createBooking({
        serviceId,
        date: selectedDate,
        type: "Reserva",
        barberId: barber.id,
      })

      toast.success("Reserva criada com sucesso!")
      setUserBookings(userBookings + 1)
    } catch (error) {
      console.error("Erro ao criar reserva:", error)
      toast.error("Erro ao criar reserva!")
    }
  }

  const availableTimes = useMemo(() => {
    if (!selectedDay) return []
    return TIME_LIST.filter((time) => {
      const hour = Number(time.split(":")[0])
      const minutes = Number(time.split(":")[1])
      const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
      if (timeIsOnThePast && isToday(selectedDay)) return false
      const hasBooking = dayBookings.some(
        (booking) =>
          new Date(booking.date).getHours() === hour &&
          new Date(booking.date).getMinutes() === minutes,
      )
      return !hasBooking
    })
  }, [selectedDay, dayBookings])

  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  return (
    <section className="bg-black py-20">
      <div className="container mx-auto">
        <h2 className="text-center text-5xl font-medium tracking-tighter">
          Faça seu agendamento
        </h2>
        <p className="mt-5 text-center text-lg tracking-tight text-white/70">
          Faça até 4 agendamentos no mês
        </p>
        <div className="mt-10 flex flex-row justify-center gap-3">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDay}
            onSelect={handleDateSelect}
            fromDate={firstDayOfMonth}
            toDate={lastDayOfMonth}
            disabled={(date) => date.getDay() === 0}
          />
        </div>
        {selectedDay && (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))
            ) : (
              <p className="text-center text-white">
                Nenhum horário disponível.
              </p>
            )}
          </div>
        )}
        {selectedDate && (
          <div className="mt-5 text-center">
            <Button onClick={handleCreateBooking} disabled={userBookings >= 4}>
              Confirmar Agendamento
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Booking
