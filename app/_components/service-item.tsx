/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Barber, BarberServices, Booking } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { isPast, isToday, set } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { createBooking } from "../_actions/create-booking"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { getBookings } from "../_actions/get-bookings"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import BookingSummary from "./booking-summary"
import { useRouter } from "next/navigation"
import { getBlock } from "../_actions/get-block"
import { sendConfirmationEmail } from "../_actions/send-email"
import { Loader2 } from "lucide-react" // Import do Loader2

interface ServiceItemProps {
  service: BarberServices
  barber: Pick<Barber, "name" | "id">
}

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

interface GetTimeListProps {
  bookings: Booking[]
  selectedDay: Date
  block: Block[]
  barberId: string
}

interface Block {
  id: string
  userId: string
  barberId: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

const getTimeList = ({
  block,
  bookings,
  selectedDay,
  barberId,
}: GetTimeListProps) => {
  const dayOfWeek = selectedDay.getDay()
  const specialBarberId = "4df3ad06-7a67-4941-901a-d8c166139673"
  const barberWithLimitedTime = "9059b8db-51a1-44da-b79b-f63ac251413e"

  let availableTimes = [...TIME_LIST]
  if (barberId === specialBarberId) {
    availableTimes.unshift("08:00", "09:00")

    if (dayOfWeek === 2 || dayOfWeek === 4) {
      availableTimes = availableTimes.filter((time) => Number(time.split(":")[0]) < 12)
    } else if (dayOfWeek === 5) {
      availableTimes = availableTimes.filter((time) => {
        const hour = Number(time.split(":")[0])
        return hour >= 13
      })
    }
  }

  if (dayOfWeek === 6) {
    if (barberId === barberWithLimitedTime) {
      availableTimes.unshift("09:00")
    }
    availableTimes = availableTimes.filter((time) => {
      const hour = Number(time.split(":")[0])

      if (barberId === barberWithLimitedTime) {
        return hour >= 9 && hour <= 15
      } else {
        return hour >= 8 && hour <= 17
      }
    })
  }

  return availableTimes.filter((time) => {
    const hour = Number(time.split(":")[0])
    const minutes = Number(time.split(":")[1])

    const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
    if (timeIsOnThePast && isToday(selectedDay)) {
      return false
    }

    const hasBookingOnCurrentTime = bookings.some(
      (booking) =>
        booking.barberId === barberId &&
        booking.date.getHours() === hour &&
        booking.date.getMinutes() === minutes
    )

    const isBlocked = block.some(
      (block) =>
        block.barberId === barberId &&
        block.date.getHours() === hour &&
        block.date.getMinutes() === minutes
    )

    if (hasBookingOnCurrentTime || isBlocked) {
      return false
    }
    return true
  })
}

const ServiceItem = ({ service, barber }: ServiceItemProps) => {
  const { data } = useSession()
  const router = useRouter()
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [dayBlock, setDayBlock] = useState<Block[]>([])
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Novo estado para loading

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({
        date: selectedDay,
        serviceId: service.id,
        barberId: barber.id,
      })
      setDayBookings(bookings)
      const blockings: Block[] = await getBlock({
        date: selectedDay,
      })
      setDayBlock(blockings)
    }
    fetch()
  }, [selectedDay, service.id, barber.id])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime?.split(":")[0]),
      minutes: Number(selectedTime?.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const alertDialog = () => {
    return setAlertDialogOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    console.log("handleCreateBooking foi chamado!")
    setIsLoading(true) // Atbehaviors Ativa o estado de carregamento

    try {
      if (!selectedDate || !data?.user?.email || !selectedDay || !selectedTime) {
        setIsLoading(false)
        return
      }

      // Usar Promise.all para executar as chamadas em paralelo
      await Promise.all([
        createBooking({
          serviceId: service.id,
          date: selectedDate,
          type: "Reserva",
          barberId: barber.id,
        }),
        sendConfirmationEmail(data.user.email, selectedDay, selectedTime),
      ])

      // Fecha o diálogo e limpa os estados
      handleBookingSheetOpenChange()
      setAlertDialogOpen(false)

      // Exibe o toast de sucesso
      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver Agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error("Erro ao criar reserva!", error)
      toast.error("Erro ao criar reserva!")
    } finally {
      setIsLoading(false) // Desativa o estado de carregamento
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList({
      bookings: dayBookings,
      selectedDay,
      block: dayBlock,
      barberId: barber.id,
    })
  }, [dayBookings, dayBlock, selectedDay, barber.id])

  return (
    <>
      <Card className="mx-auto my-6 max-w-4xl shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-6 lg:flex-row lg:items-start">
          {/* IMAGEM */}
          <div className="relative mx-auto aspect-square w-full max-w-[110px] lg:mx-0 lg:max-w-[110px]">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              className="rounded-lg object-cover"
            />
          </div>

          {/* DETALHES */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-center text-xl font-semibold lg:text-left">
                {service.name}
              </h3>
              <p className="text-center text-sm text-gray-500 lg:text-left">
                {service.description}
              </p>
            </div>

            {/* PREÇO E AÇÃO */}
            <div className="flex flex-col items-center space-y-4 lg:items-start">
              <p className="text-2xl font-bold text-red-600">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>

              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={handleBookingSheetOpenChange}
              >
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>

                <SheetContent className="flex h-full w-full max-w-2xl flex-col px-4">
                  <SheetHeader>
                    <SheetTitle className="text-xl font-bold">
                      Fazer Reserva
                    </SheetTitle>
                  </SheetHeader>

                  <div className="scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-100 flex-1 overflow-y-auto">
                    <div className="border-b py-5">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={selectedDay}
                        onSelect={handleDateSelect}
                        fromDate={new Date()}
                        disabled={(date) => date.getDay() === 0}
                      />
                    </div>

                    {selectedDay && (
                      <div className="flex flex-wrap gap-3 border-b py-5">
                        {timeList.length > 0 ? (
                          timeList.map((time) => (
                            <Button
                              key={time}
                              variant={
                                selectedTime === time ? "default" : "outline"
                              }
                              className="rounded-full px-4 py-2"
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time}
                            </Button>
                          ))
                        ) : (
                          <p className="w-full text-center text-sm">
                            Não há horários disponíveis para este dia.
                          </p>
                        )}
                      </div>
                    )}

                    {selectedDate && (
                      <div className="p-5">
                        <BookingSummary
                          barber={barber}
                          service={service}
                          selectedDate={selectedDate}
                        />
                      </div>
                    )}
                  </div>

                  <SheetFooter className="mt-5 flex justify-center px-5">
                    <Button
                      onClick={alertDialog}
                      disabled={!selectedDay || !selectedTime}
                      className="w-full max-w-sm"
                    >
                      Confirmar
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={alertDialogOpen} onOpenChange={(open) => setAlertDialogOpen(open)}>
        <DialogContent className="max-w-[90vw] sm:max-w-[450px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex justify-center text-lg sm:text-xl font-bold">
              AVISO
            </DialogTitle>
            <div className="flex justify-center py-4">
              <Image
                src="/logo.png"
                width={150}
                height={150}
                alt="Logo"
                className="w-[100px] sm:w-[150px] h-auto"
              />
            </div>
            <DialogDescription className="text-white text-sm sm:text-base w-full px-2 sm:pl-8">
              <span className="font-semibold">IMPORTANTE:</span> Caso o cliente não
              compareça no horário agendado sem aviso prévio, será cobrada uma taxa de
              50% do valor do corte. Agradecemos a compreensão!
            </DialogDescription>
            <div className="flex justify-center pt-6 sm:pt-10">
              <Button
                onClick={handleCreateBooking}
                className="w-full max-w-[80%] sm:max-w-[300px] py-2 text-sm sm:text-base"
                disabled={isLoading} // Desativa o botão durante o carregamento
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Confirmando...</span>
                  </div>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="mx-auto w-full max-w-md p-6">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem