"use client"

import { Prisma } from "@prisma/client"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import Image from "next/image"
import PhoneItem from "./phone-item"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { deleteBooking } from "../_actions/delete-booking"
import { toast } from "sonner"
import { useState } from "react"
import BookingSummary from "./booking-summary"
import Link from "next/link"
import { Clock, MessageSquareText } from "lucide-react"
import { formatSlotRange } from "../_lib/schedule"

interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: {
        include: {
          barber: true
        }
      }
      user: true
    }
  }>
  isAdmin?: boolean
}

const BookingItem = ({ booking, isAdmin = false }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const bookingDate = new Date(booking.date)
  const isConfirmed = isFuture(bookingDate)
  const duration = booking.durationMinutes ?? 30

  const handleCancelBooking = async () => {
    try {
      await deleteBooking(booking.id)
      setIsSheetOpen(false)
      toast.success("Agendamento cancelado com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva. Tente novamente.")
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger className="w-full min-w-[85%] rounded-2xl text-left sm:min-w-[380px]">
        <Card className="card-hover rounded-2xl border-border/60">
          <CardContent className="flex justify-between p-0">
            {/* ESQUERDA */}
            <div className="flex flex-col gap-2 py-5 pl-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className="w-fit"
                  variant={isConfirmed ? "default" : "secondary"}
                >
                  {isConfirmed ? "Confirmado" : "Finalizado"}
                </Badge>
                <Badge
                  variant="outline"
                  className="flex w-fit items-center gap-1 border-border/80 text-muted-foreground"
                >
                  <Clock size={11} />
                  {duration === 60 ? "1h" : `${duration} min`}
                </Badge>
              </div>
              <h3 className="font-semibold">{booking.service.name}</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      booking.service.barber.imageUrl || "/default-avatar.png"
                    }
                  />
                </Avatar>
                <p className="text-sm text-muted-foreground">
                  {booking.service.barber.name}
                </p>
              </div>
              {isAdmin && booking.user && (
                <p className="text-sm font-medium">
                  Cliente: {booking.user.name}
                </p>
              )}
              {booking.observation && (
                <p className="flex items-start gap-1.5 text-xs text-amber-200/90">
                  <MessageSquareText size={13} className="mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{booking.observation}</span>
                </p>
              )}
            </div>
            {/* DIREITA */}
            <div className="flex min-w-[100px] flex-col items-center justify-center border-l border-border/60 px-4">
              <p className="text-sm capitalize text-muted-foreground">
                {format(bookingDate, "MMMM", { locale: ptBR })}
              </p>
              <p className="font-display text-3xl text-primary">
                {format(bookingDate, "dd", { locale: ptBR })}
              </p>
              <p className="text-sm">{formatSlotRange(bookingDate, duration)}</p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent className="w-[85%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left font-display text-2xl tracking-wide">
            Informações da Reserva
          </SheetTitle>
        </SheetHeader>

        <div className="relative mt-6 flex h-[180px] w-full items-end">
          <Link
            target="_blank"
            href="https://www.google.com/maps/place/Barbearia+Kalyl/@-25.4167769,-49.2546765,17z/data=!3m1!4b1!4m6!3m5!1s0x94dce592cbbdeedf:0xda8c6fc77c01c1b!8m2!3d-25.4167769!4d-49.2546765!16s%2Fg%2F11mqh_zvk7?entry=ttu&g_ep=EgoyMDI1MTAxMi4wIKXMDSoASAFQAw%3D%3D"
          >
            <Image
              alt="Mapa da barbearia"
              src="/mapskl.png"
              fill
              className="rounded-xl object-cover"
            />
          </Link>
          <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
            <CardContent className="flex items-center gap-3 px-5 py-3">
              <Avatar>
                <AvatarImage src="/kalyl.jpg" />
              </Avatar>
              <div>
                <h3 className="font-bold">Barbearia Kalyl</h3>
                <p className="text-xs text-muted-foreground">
                  R. Augusto Stresser, 725
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Badge
            className="w-fit"
            variant={isConfirmed ? "default" : "secondary"}
          >
            {isConfirmed ? "Confirmado" : "Finalizado"}
          </Badge>

          {isAdmin && booking.user && (
            <div className="mt-4">
              <p className="text-sm font-medium">
                Cliente: {booking.user.name}
              </p>
              <p className="text-sm font-medium">
                Telefone: {booking.user.number}
              </p>
            </div>
          )}

          <div className="mb-3 mt-6">
            <BookingSummary
              barber={booking.service.barber}
              service={booking.service}
              selectedDate={bookingDate}
              durationMinutes={duration}
              observation={booking.observation}
            />
          </div>

          <div className="space-y-3">
            {booking.service.barber.phones.map((phone) => (
              <PhoneItem key={phone} phone={phone} />
            ))}
          </div>
        </div>
        <SheetFooter className="mt-6">
          <div className="flex items-center gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Voltar
              </Button>
            </SheetClose>
            {isConfirmed && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancelar Reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Você quer cancelar sua reserva?</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja fazer o cancelamento? Essa ação é
                      irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">
                        Voltar
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleCancelBooking}
                      >
                        Confirmar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingItem
