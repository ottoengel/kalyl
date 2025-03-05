/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "../_components/header"
import { notFound } from "next/navigation"
import { getAdminConfirmedBookings } from "../_data/get-admin-confirmed-bookings"
import { getAdminConcludedBookings } from "../_data/get-admin-concluded-bookings"
import BookingItem from "../_components/booking-item"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import { buttonVariants } from "@/app/_components/ui/button"
import { toast } from "sonner"
import { Block } from "@prisma/client"
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

const Dashboard = () => {
  const [adminConfirmedBlock, setAdminConfirmedBookings] = useState<Block[]>([])
  const [adminConcludedBlock, setAdminConcludedBookings] = useState<Block[]>([])

  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(
    undefined,
  )
  const [barberss, setBarberss] = useState<{ id: string; name: string }[]>([])

  // filtro barber

  const filterBookings = (
    bookings: Block[],
    selectedBarber: string | undefined,
  ) => {
    if (selectedBarber === "todos" || selectedBarber === undefined) {
      return bookings // Retorna todos os agendamentos se "todos" estiver selecionado
    }
    return bookings.filter((booking) => booking.barberId === selectedBarber) // Filtra os agendamentos pelo barbeiro selecionado
  }

  const filteredConfirmedBookings = useMemo(() => {
    return filterBookings(adminConfirmedBlock, selectedBarber)
  }, [adminConfirmedBlock, selectedBarber])

  const filteredConcludedBookings = useMemo(() => {
    return filterBookings(adminConcludedBlock, selectedBarber)
  }, [adminConcludedBlock, selectedBarber])

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

  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  const [selectedDay, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedHour, setSelectedHour] = useState<string | undefined>(
    undefined,
  )

  const [dayBlock, setDayBlock] = useState<Block[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const session = await fetch("/api/auth/session").then((res) => res.json())

      if (!session?.user || session.user.role !== "ADMIN") {
        notFound()
        return
      }

      setIsAdmin(true)
      const confirmedBlock = await getAdminConfirmedBookings()
      const concludedBlock = await getAdminConcludedBookings()

      setAdminConfirmedBookings(confirmedBlock)
      setAdminConcludedBookings(concludedBlock)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay || !selectedBarber) return
      const blockings = await getBlock({
        date: selectedDay,
        barberId: selectedBarber,
      })
      console.log("Bloqueios retornados:", blockings)
      setDayBlock(blockings)
    }
    fetch()
  }, [selectedDay, selectedBarber])

  interface GetTimeListProps {
    block: Block[]
    selectedDay: Date
    barberId: string
  }

  const getTimeList = ({ block, selectedDay, barberId }: GetTimeListProps) => {
    return hours.filter((time) => {
      const hour = Number(time.split(":")[0])
      const minutes = Number(time.split(":")[1])

      const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
      if (timeIsOnThePast && isToday(selectedDay)) {
        return false
      }

      const hasBookingOnCurrentTime = block.some(
        (block) =>
          block.barberId === barberId && // Filtra pelo barberId
          block.date.getHours() === hour &&
          block.date.getMinutes() === minutes,
      )
      // if (hasBookingOnCurrentTime) {
      //   return false
      // }
      return true
    })
  }

  const hours = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i
    return `${hour}:00`
  })

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedHour) return
    return set(selectedDay, {
      hours: Number(selectedHour?.split(":")[0]),
      minutes: Number(selectedHour?.split(":")[1]),
    })
  }, [selectedDay, selectedHour])

  interface HasBlock {
    id: string
    userId: string
    date: Date
    createdAt: Date
    updatedAt: Date
  }
  const handleToggleAvailability = async (
    hasBlock: HasBlock | undefined,
    barberId: string,
  ) => {
    try {
      if (hasBlock) {
        await handleCancelBlock(hasBlock.id)
      } else if (selectedDate && barberId) {
        if (!selectedDate || !selectedBarber) {
          console.error("Erro: Data ou barbeiro não selecionado.")
          return
        }
        await createBlock({ date: selectedDate, barberId: selectedBarber })
        toast.success("Horário bloqueado com sucesso!")
      }
    } catch (error) {
      toast.error("Erro ao criar ou cancelar bloqueio!")
    }
  }

  const handleCancelBlock = async (block: string) => {
    try {
      await deleteBlock(block)
      toast.success("Horario desbloqueado com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva. Tente novamente.")
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay || !selectedBarber) return []
    return getTimeList({
      selectedDay,
      block: dayBlock,
      barberId: selectedBarber,
    })
  }, [dayBlock, selectedDay, selectedBarber])

  if (!isAdmin) {
    return null
  }

  return (
    <>
      <Header />
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <div className="sm:order-1">
          <div className="rounded-lg p-5 text-white shadow-lg">
            {/* <button
                onClick={() => { console.log("TESTE", selectedDay, dayBlock )}}
              >Teste</button> */}
            <h2 className="mb-4 text-2xl font-bold">Calendário</h2>
            <DayPicker
              showOutsideDays
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDate}
              locale={pt}
              className="p-3"
              classNames={{
                months:
                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
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
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
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
          <div className="p-5">
            <label className="mb-2 block">Selecione o barbeiro:</label>
            <Select onValueChange={(value) => setSelectedBarber(value)}>
              <SelectTrigger className="rounded border p-2">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {barberss.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedDay && (
            <div>
              <h3 className="mb-2 mt-4 text-center text-lg font-semibold">
                Horários para {selectedDay.toLocaleDateString()}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {timeList.map((hour) => (
                  <button
                    key={hour}
                    className={`rounded-lg p-3 text-center transition-colors duration-200 ${
                      selectedHour === hour
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour}
                  </button>
                ))}
              </div>

              {selectedHour && (
                <div className="mt-6 text-center">
                  <p className="mb-4">Horário selecionado: {selectedHour}</p>
                  <button
                    onClick={() => {
                      if (selectedBarber && selectedDate) {
                        handleToggleAvailability(
                          dayBlock.find(
                            (block) =>
                              block.barberId === selectedBarber &&
                              new Date(block.date).toISOString() ===
                                new Date(selectedDate).toISOString(),
                          ),
                          selectedBarber,
                        )
                      } else {
                        console.error("Barbeiro ou data não definidos.")
                      }
                    }}
                    className={`rounded-lg px-4 py-2 ${
                      dayBlock.some(
                        (block) =>
                          block.barberId === selectedBarber &&
                          new Date(block.date).toISOString() ===
                            new Date(selectedDate ?? new Date()).toISOString(),
                      )
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {dayBlock.some(
                      (block) =>
                        block.barberId === selectedBarber &&
                        new Date(block.date).toISOString() ===
                          new Date(selectedDate ?? new Date()).toISOString(),
                    )
                      ? "Desbloquear Horário"
                      : "Bloquear Horário"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-3 sm:order-2">
          <div className="flex flex-row justify-between">
            <h1 className="text-xl font-bold">Agendamentos</h1>
            <div>
              <h3 className="mb-3 text-[14px] font-semibold text-gray-400">
                Selecione o Barbeiro
              </h3>
              <Select
                defaultValue="todos"
                onValueChange={(value) => setSelectedBarber(value)}
              >
                <SelectTrigger className="w-[150px] rounded border p-2">
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

interface CalendarProps {
  adminConfirmedBlock: Array<{
    id: string
    date: string
  }>
}
export default Dashboard
