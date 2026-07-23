/* eslint-disable react-hooks/exhaustive-deps */
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
import { Clock, Loader2, MessageSquareText } from "lucide-react"
import {
  generateTimeSlots,
  getServiceDuration,
  isSlotAvailable,
  slotToDate,
} from "../_lib/schedule"

interface ServiceItemProps {
  service: BarberServices
  barber: Pick<Barber, "name" | "id">
}

interface Block {
  id: string
  userId: string
  barberId: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

const ServiceItem = ({ service, barber }: ServiceItemProps) => {
  const { data } = useSession()
  const router = useRouter()
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [observation, setObservation] = useState("")
  const [dayBlock, setDayBlock] = useState<Block[]>([])
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Duração definida pelo barbeiro/serviço — o cliente não escolhe
  const serviceDuration = getServiceDuration(barber.id, service.name)

  const loadBookings = async () => {
    if (!selectedDay) return
    const [bookings, blockings] = await Promise.all([
      getBookings({ date: selectedDay, barberId: barber.id }),
      getBlock({ date: selectedDay, barberId: barber.id }),
    ])
    setDayBookings(bookings)
    setDayBlock(blockings as Block[])
  }

  useEffect(() => {
    loadBookings()
  }, [selectedDay, barber.id])

  useEffect(() => {
    if (!selectedDay || !bookingSheetIsOpen) return
    const interval = setInterval(() => {
      loadBookings()
    }, 15000)
    return () => clearInterval(interval)
  }, [selectedDay, bookingSheetIsOpen])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return slotToDate(selectedDay, selectedTime)
  }, [selectedDay, selectedTime])

  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setObservation("")
    setDayBookings([])
    setDayBlock([])
    setBookingSheetIsOpen(false)
  }

  const handleCreateBooking = async () => {
    setIsLoading(true)

    try {
      if (!selectedDate || !data?.user?.email || !selectedDay || !selectedTime) {
        setIsLoading(false)
        return
      }

      const result = await createBooking({
        serviceId: service.id,
        date: selectedDate,
        type: "Reserva",
        barberId: barber.id,
        durationMinutes: serviceDuration,
        observation: observation.trim() || undefined,
      })

      if (!result.success) {
        if (result.error === "blocked") {
          toast.error(
            "Sua conta está bloqueada para agendamentos. Fale com a barbearia.",
          )
        } else {
          toast.error("Erro ao criar reserva!")
        }
        setAlertDialogOpen(false)
        return
      }

      sendConfirmationEmail(data.user.email, selectedDay, selectedTime)

      handleBookingSheetOpenChange()
      setAlertDialogOpen(false)

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
      setIsLoading(false)
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return generateTimeSlots(barber.id, selectedDay, serviceDuration).filter(
      (slot) =>
        isSlotAvailable({
          barberId: barber.id,
          day: selectedDay,
          slot,
          durationMinutes: serviceDuration,
          bookings: dayBookings,
          blocks: dayBlock,
        }),
    )
  }, [dayBookings, dayBlock, selectedDay, barber.id, serviceDuration])

  return (
    <>
      <Card className="card-hover overflow-hidden rounded-2xl border-border/60">
        <CardContent className="flex gap-4 p-4 sm:gap-5 sm:p-5">
          {/* IMAGEM */}
          <div className="relative aspect-square w-[90px] shrink-0 overflow-hidden rounded-xl sm:w-[110px]">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              className="object-cover"
              sizes="110px"
            />
          </div>

          {/* DETALHES */}
          <div className="flex flex-1 flex-col justify-between gap-2">
            <div className="space-y-1">
              <h3 className="font-display text-xl tracking-wide">
                {service.name}
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {service.description}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={12} className="text-primary" />
                {serviceDuration === 60 ? "1 hora" : `${serviceDuration} min`}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-bold text-primary">
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
                  className="font-semibold"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>

                <SheetContent className="flex h-full w-full max-w-2xl flex-col overflow-hidden px-0">
                  <SheetHeader className="border-b border-border/60 px-5 pb-4">
                    <SheetTitle className="text-left font-display text-2xl tracking-wide">
                      Fazer Reserva
                    </SheetTitle>
                    <p className="text-left text-sm text-muted-foreground">
                      {service.name} com {barber.name} —{" "}
                      {serviceDuration === 60 ? "1 hora" : `${serviceDuration} min`}
                    </p>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto">
                    {/* CALENDÁRIO */}
                    <div className="flex justify-center border-b border-border/60 py-4">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={selectedDay}
                        onSelect={setSelectedDay}
                        fromDate={new Date()}
                        disabled={(date) => date.getDay() === 0}
                      />
                    </div>

                    {selectedDay && (
                      <>
                        {/* HORÁRIOS */}
                        <div className="border-b border-border/60 px-5 py-4">
                          <p className="mb-3 text-sm font-semibold">
                            Horários disponíveis
                          </p>
                          {timeList.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                              {timeList.map((time) => (
                                <Button
                                  key={time}
                                  size="sm"
                                  variant={
                                    selectedTime === time
                                      ? "default"
                                      : "outline"
                                  }
                                  className="rounded-full"
                                  onClick={() => setSelectedTime(time)}
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <p className="w-full py-2 text-center text-sm text-muted-foreground">
                              Não há horários disponíveis para este dia.
                            </p>
                          )}
                        </div>

                        {/* OBSERVAÇÃO */}
                        <div className="border-b border-border/60 px-5 py-4">
                          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <MessageSquareText
                              size={15}
                              className="text-primary"
                            />
                            Observação{" "}
                            <span className="font-normal text-muted-foreground">
                              (opcional)
                            </span>
                          </p>
                          <textarea
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            maxLength={300}
                            rows={3}
                            placeholder="Ex.: degradê baixo, chego 5 min atrasado, alergia a algum produto..."
                            className="w-full resize-none rounded-xl border border-input bg-secondary/50 p-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </>
                    )}

                    {selectedDate && (
                      <div className="p-5">
                        <BookingSummary
                          barber={barber}
                          service={service}
                          selectedDate={selectedDate}
                          durationMinutes={serviceDuration}
                          observation={observation.trim() || undefined}
                        />
                      </div>
                    )}
                  </div>

                  <SheetFooter className="border-t border-border/60 p-5">
                    <Button
                      onClick={() => setAlertDialogOpen(true)}
                      disabled={!selectedDay || !selectedTime}
                      className="w-full font-semibold"
                      size="lg"
                    >
                      Confirmar reserva
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={alertDialogOpen}
        onOpenChange={(open) => setAlertDialogOpen(open)}
      >
        <DialogContent className="max-w-[90vw] rounded-2xl p-4 sm:max-w-[450px] sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex justify-center font-display text-2xl tracking-wide">
              Aviso
            </DialogTitle>
            <div className="flex justify-center py-4">
              <Image
                src="/logo.png"
                width={150}
                height={150}
                alt="Logo"
                className="h-auto w-[100px] sm:w-[150px]"
              />
            </div>
            <DialogDescription className="w-full px-2 text-sm text-foreground sm:text-base">
              <span className="font-semibold text-primary">IMPORTANTE:</span>{" "}
              Caso o cliente não compareça no horário agendado sem aviso prévio,
              será cobrada uma taxa de 50% do valor do corte. Agradecemos a
              compreensão!
            </DialogDescription>
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleCreateBooking}
                className="w-full max-w-[300px] font-semibold"
                size="lg"
                disabled={isLoading}
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
