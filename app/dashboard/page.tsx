/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useMemo, useTransition } from "react"
import Header from "../_components/header"
import { getAdminConfirmedBookings } from "../_data/get-admin-confirmed-bookings"
import { getAdminConcludedBookings } from "../_data/get-admin-concluded-bookings"
import BookingItem from "../_components/booking-item"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import { buttonVariants } from "@/app/_components/ui/button"
import { toast } from "sonner"
import { Block, Prisma } from "@prisma/client"
import { getBlock } from "../_actions/get-block"
import { createBlock } from "../_actions/create-block"
import { useRouter } from "next/navigation"
import { isPast, isToday, set } from "date-fns"
import { deleteBlock } from "../_actions/delete-block"
import { getBarbers } from "../_actions/get-barber"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../_components/ui/select"
import { ScrollArea } from "../_components/ui/scroll-area"
import { pt } from "date-fns/locale"
import { useSession } from "next-auth/react"

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    service: {
      include: {
        barber: true
      }
    }
    user: true
  }
}>

const Dashboard = () => {
  const { data, status } = useSession()
  const [adminConfirmedBookings, setAdminConfirmedBookings] = useState<BookingWithRelations[]>([])
  const [adminConcludedBookings, setAdminConcludedBookings] = useState<BookingWithRelations[]>([])
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined)
  const [barberss, setBarberss] = useState<{ id: string; name: string }[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedDay, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined)
  const [dayBlock, setDayBlock] = useState<Block[]>([])
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // Filtro de barbeiros
  const filterBookings = (bookings: BookingWithRelations[], selectedBarber: string | undefined) => {
    if (selectedBarber === "todos" || selectedBarber === undefined) {
      return bookings
    }
    return bookings.filter((booking) => booking.service.barberId === selectedBarber)
  }

  const filteredConfirmedBookings = useMemo(() => {
    return filterBookings(adminConfirmedBookings, selectedBarber)
  }, [adminConfirmedBookings, selectedBarber])

  const filteredConcludedBookings = useMemo(() => {
    return filterBookings(adminConcludedBookings, selectedBarber)
  }, [adminConcludedBookings, selectedBarber])

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const barbersList = await getBarbers()
        setBarberss(barbersList)
      } catch (error) {
        console.error("Erro ao buscar barbeiros:", error)
      }
    }
    fetchBarbers()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading") return

      if (!data?.user?.role || data.user.role !== "ADMIN") {
        return
      }

      setIsAdmin(true)
      const confirmedBookings = await getAdminConfirmedBookings()
      const concludedBookings = await getAdminConcludedBookings()

      setAdminConfirmedBookings(confirmedBookings)
      setAdminConcludedBookings(concludedBookings)
    }

    fetchData()
  }, [data?.user?.role, status, router])

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!selectedDay || !selectedBarber) {
        setDayBlock([])
        return
      }
      const blocks = await getBlock({
        date: selectedDay,
        barberId: selectedBarber,
      })
      setDayBlock(blocks)
    }
    fetchBlocks()
  }, [selectedDay, selectedBarber])

  interface GetTimeListProps {
    block: Block[]
    selectedDay: Date
    barberId: string
  }

  type TimeSlot = {
    time: string
    isBlocked: boolean
  }

  const getTimeList = (blocks: Block[], selectedDay: Date, barberId: string): TimeSlot[] => {
    return hours
      .map((time): TimeSlot => {
        const [hourStr, minStr] = time.split(":")
        const hour = Number(hourStr)
        const minutes = Number(minStr)
   
        const timeIsPast = isPast(set(new Date(), { hours: hour, minutes }))
        if (timeIsPast && isToday(selectedDay)) {
          return { time, isBlocked: true }  
        }

        const isRealBlocked = blocks.some(
          (block) =>
            block.barberId === barberId &&
            block.date.getHours() === hour &&
            block.date.getMinutes() === minutes
        )

        return { time, isBlocked: isRealBlocked }
      })
      .filter(({ isBlocked }) => !isBlocked || true) 
  }

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i
    return `${hour}:00`
  })

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedHour) return undefined
    const [h, m] = selectedHour.split(":")
    return set(selectedDay, { hours: Number(h), minutes: Number(m) })
  }, [selectedDay, selectedHour])

  interface HasBlock {
    id: string
    userId: string
    date: Date
    createdAt: Date
    updatedAt: Date
  }

  // const handleToggleAvailability = async (hasBlock: HasBlock | undefined, barberId: string) => {
  //   try {
  //     if (hasBlock) {
  //       await handleCancelBlock(hasBlock.id)
  //     } else if (selectedDate && barberId) {
  //       if (!selectedDate || !selectedBarber) {
  //         console.error("Erro: Data ou barbeiro não selecionado.")
  //         return
  //       }
  //       await createBlock({ date: selectedDate, barberId: selectedBarber })
  //       toast.success("Horário bloqueado com sucesso!")
  //     }
  //   } catch (error) {
  //     toast.error("Erro ao criar ou cancelar bloqueio!")
  //   }
  // }

  // const handleCancelBlock = async (block: string) => {
  //   try {
  //     await deleteBlock(block)
  //     toast.success("Horario desbloqueado com sucesso!")
  //   } catch (error) {
  //     console.error(error)
  //     toast.error("Erro ao cancelar reserva. Tente novamente.")
  //   }
  // }

  const handleToggleBlock = async (timeSlot: TimeSlot) => {
    startTransition(async () => { 
      try {
        if (timeSlot.isBlocked) {
          const blockToDelete = dayBlock.find(
            (b) => b.date.getHours() === Number(timeSlot.time.split(":")[0]) &&
              b.date.getMinutes() === 0
          )
          if (blockToDelete) {
            await deleteBlock(blockToDelete.id)
            toast.success("✅ Horário desbloqueado!")
          }
        } else {
          if (!selectedDate || !selectedBarber) return
          await createBlock({ date: selectedDate, barberId: selectedBarber })
          toast.success("✅ Horário bloqueado!")
        }

        const newBlocks = await getBlock({
          date: selectedDay!,
          barberId: selectedBarber!,
        })
        setDayBlock(newBlocks)
        setSelectedHour(undefined) 
      } catch (error) {
        toast.error("❌ Erro ao bloquear/desbloquear!")
      }
    })
  }

  const timeList: TimeSlot[] = useMemo(() => {
    if (!selectedDay || !selectedBarber) return []
    return getTimeList(dayBlock, selectedDay, selectedBarber)
  }, [dayBlock, selectedDay, selectedBarber])

  if (!isAdmin) {
    return null
  }

  return (
    <>
      <Header />
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <div className="sm:order-1">
          <div className="flex flex-col items-center">
            <h3 className="mb-3 text-[14px] font-semibold text-gray-400">
              Selecione o Barbeiro
            </h3>
            <Select
              defaultValue="todos"
              onValueChange={(value) => setSelectedBarber(value)}
            >
              <SelectTrigger className="w-[200px] sm:w-[350px] rounded border p-2 shadow-slate-600 shadow-sm">
                <SelectValue placeholder="Barbeiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {barberss.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg p-5 text-white shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Calendário</h2>
            <DayPicker
              showOutsideDays
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDate}
              locale={pt}
              className="p-3"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative",
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                ),
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
              }}
              components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
              }}
            />
          </div>
          {selectedDay && (
            <div>
              <h3 className="mb-2 mt-4 text-center text-lg font-semibold">
                Horários para {selectedDay.toLocaleDateString()}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-4">
                {timeList.map(({ time, isBlocked }) => {
                  const isSelected = selectedHour === time && !isBlocked
                  return (
                    <button
                      key={time}
                      disabled={isPending}
                      onClick={() => {
                        if (isBlocked) {
                          handleToggleBlock({ time, isBlocked: true })
                        } else {
                          setSelectedHour(time)
                        }
                      }}
                      className={cn(
                        "rounded-lg p-3 text-center font-medium transition-all duration-200 shadow-sm",
                        isPending && "opacity-50 cursor-not-allowed",
                        isSelected
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/25"
                          : isBlocked
                            ? "bg-red-500/20 text-red-400 border-2 border-red-500/50 line-through hover:bg-red-500/30"
                            : "bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500"
                      )}
                    >
                      {time}
                      {isBlocked && <span className="ml-1 text-xs">🔒</span>}
                    </button>
                  )
                })}
              </div>

              {selectedHour && !timeList.find(t => t.time === selectedHour)?.isBlocked && (
                <div className="mt-6 text-center">
                  <p className="mb-4 text-sm text-gray-300">
                    Horário selecionado: <strong>{selectedHour}</strong>
                  </p>
                  <button
                    onClick={() => handleToggleBlock({ time: selectedHour!, isBlocked: false })}
                    disabled={isPending}
                    className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white shadow-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isPending ? "..." : "🔒 Bloquear Horário"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-3 sm:order-2">
          <div className="flex flex-row justify-between">
            <h1 className="text-xl font-bold">Agendamentos</h1>
          </div>

          {filteredConfirmedBookings.length === 0 &&
            filteredConcludedBookings.length === 0 && (
              <p className="text-gray-400">Nenhum agendamento encontrado.</p>
            )}

          {filteredConfirmedBookings.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                Confirmados
              </h2>
              <ScrollArea className="h-[500px] w-full">
                <div className="flex flex-col space-y-4 p-4 pt-0">
                  {filteredConfirmedBookings.map((booking) => (
                    <BookingItem
                      key={booking.id}
                      booking={JSON.parse(JSON.stringify(booking))}
                      isAdmin={true}
                    />
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
          {filteredConcludedBookings.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 pt-4 text-xs font-bold uppercase text-gray-400">
                Finalizados
              </h2>
              <ScrollArea className="h-[260px] w-full">
                <div className="flex flex-col space-y-4 p-4 pt-0">
                  {filteredConcludedBookings.map((booking) => (
                    <BookingItem
                      key={booking.id}
                      booking={JSON.parse(JSON.stringify(booking))}
                      isAdmin={true}
                    />
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard