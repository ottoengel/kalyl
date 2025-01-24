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
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import BookingSummary from "./booking-summary"
import { useRouter } from "next/navigation"
import { getBlock } from "../_actions/get-block"

interface ServiceItemProps {
  service: BarberServices
  barber: Pick<Barber, "name">
}

const TIME_LIST = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
]

interface GetTimeListProps {
  bookings: Booking[]
  selectedDay: Date
  block: Block[]
}

interface Block {
  id: string;
  userId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const getTimeList = ({ block, bookings, selectedDay }: GetTimeListProps) => {
  return TIME_LIST.filter((time) => {
    const hour = Number(time.split(":")[0])
    const minutes = Number(time.split(":")[1])

    const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
    if (timeIsOnThePast && isToday(selectedDay)) {
      return false
    }

    const hasBookingOnCurrentTime = bookings.some(
      (booking) =>
        booking.date.getHours() === hour &&
        booking.date.getMinutes() === minutes,
    )

    const isBlocked = block.some(
      (block) =>
        block.date.getHours() === hour &&
        block.date.getMinutes() === minutes
    );

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
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [dayBlock, setDayBlock] = useState<Block[]>([]);

  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({
        date: selectedDay,
        serviceId: service.id,
      })
      setDayBookings(bookings)
      const blockings: Block[] = await getBlock({
        date: selectedDay,
      });
      setDayBlock(blockings)
    }
    fetch()
  }, [selectedDay, service.id])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime?.split(":")[0]),
      minutes: Number(selectedTime?.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  //se tiver um usuario logado abrir o Sheet de agendamento
  // se não abrir o dialog de login
  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
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
    // 1. Não exibir horários que já foram agendados
    try {
      if (!selectedDate) return

      await createBooking({
        serviceId: service.id,
        date: selectedDate,
        type: 'Reserva'
      })
      handleBookingSheetOpenChange()
      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver Agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva!")
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return [];
    return getTimeList({
      bookings: dayBookings,
      selectedDay,
      block: dayBlock,
    });
  }, [dayBookings, dayBlock, selectedDay]);
  
  return (
    <>
      <Card className="max-w-4xl mx-auto my-6 shadow-lg">
        <CardContent className="flex flex-col lg:flex-row items-center lg:items-start gap-6 p-6">
          {/* IMAGEM */}
          <div className="relative w-full max-w-[110px] lg:max-w-[110px] aspect-square mx-auto lg:mx-0">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              className="rounded-lg object-cover "
            />
          </div>
  
          {/* DETALHES */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-center lg:text-left">{service.name}</h3>
              <p className="text-sm text-gray-500 text-center lg:text-left">{service.description}</p>
            </div>
  
            {/* PREÇO E AÇÃO */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
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
  
                {/* Modal ocupando a altura total */}
                <SheetContent className="w-full max-w-2xl h-full px-4 flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="text-xl font-bold">Fazer Reserva</SheetTitle>
                  </SheetHeader>
  
                  {/* Conteúdo com rolagem interna */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-100">
                    {/* CALENDÁRIO */}
                    <div className="border-b py-5">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={selectedDay}
                        onSelect={handleDateSelect}
                        fromDate={new Date()}
                      />
                    </div>
  
                    {/* HORÁRIOS DISPONÍVEIS */}
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
                          <p className="text-sm text-center w-full">
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
  
                  {/* BOTÃO DE CONFIRMAR */}
                  <SheetFooter className="mt-5 px-5 flex justify-center">
                    <Button
                      onClick={handleCreateBooking}
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
  
      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-full max-w-md mx-auto p-6">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  );

}  

export default ServiceItem