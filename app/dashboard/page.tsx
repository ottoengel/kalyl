/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect, useMemo, useCallback, useTransition } from "react"
import Header from "../_components/header"
import { getAdminConfirmedBookings } from "../_data/get-admin-confirmed-bookings"
import { getAdminConcludedBookings } from "../_data/get-admin-concluded-bookings"
import BookingItem from "../_components/booking-item"
import { DayPicker } from "react-day-picker"
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Loader2,
  Lock,
  LockOpen,
  Scissors,
} from "lucide-react"
import { cn } from "@/app/_lib/utils"
import { buttonVariants, Button } from "@/app/_components/ui/button"
import { toast } from "sonner"
import { Block, Booking, Prisma } from "@prisma/client"
import { getBlock } from "../_actions/get-block"
import { createBlock } from "../_actions/create-block"
import { getBookings } from "../_actions/get-bookings"
import { addMinutes, format, isPast, isToday, startOfMonth, subDays } from "date-fns"
import { deleteBlock } from "../_actions/delete-block"
import { getBarbers } from "../_actions/get-barber"
import {
  getFixedOccupancy,
  FixedOccupancy,
} from "../_actions/fixed-clients"
import FixedClientsPanel from "./fixed-clients-panel"
import {
  getDashboardMetrics,
  getMetricsForPeriod,
  DashboardMetrics,
  PeriodMetrics,
} from "../_actions/get-dashboard-metrics"
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
import {
  generateTimeSlots,
  getSlotStep,
  slotToDate,
} from "../_lib/schedule"

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

type SlotStatus = "free" | "blocked" | "booked" | "fixed" | "past"

interface SlotInfo {
  time: string
  status: SlotStatus
  blockId?: string
  clientName?: string
}

type PeriodPreset = "hoje" | "7dias" | "mes" | "personalizado"

const Dashboard = () => {
  const { data, status } = useSession()
  const [confirmedBookings, setConfirmedBookings] = useState<BookingWithRelations[]>([])
  const [concludedBookings, setConcludedBookings] = useState<BookingWithRelations[]>([])
  const [concludedHasMore, setConcludedHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string>("todos")
  const [barbers, setBarbers] = useState<{ id: string; name: string }[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [dayBlocks, setDayBlocks] = useState<Block[]>([])
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [dayFixed, setDayFixed] = useState<FixedOccupancy[]>([])
  const [activeTab, setActiveTab] = useState<
    "confirmados" | "finalizados" | "fixos"
  >("confirmados")
  const [isPending, startTransition] = useTransition()

  // Filtro de período do rendimento
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("mes")
  const [periodFrom, setPeriodFrom] = useState<string>(
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  )
  const [periodTo, setPeriodTo] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  )
  const [periodMetrics, setPeriodMetrics] = useState<PeriodMetrics | null>(null)
  const [isLoadingPeriod, setIsLoadingPeriod] = useState(false)

  // Barbeiro usado na gestão de horários (precisa ser um barbeiro específico)
  const scheduleBarberId =
    selectedBarber !== "todos" ? selectedBarber : barbers[0]?.id

  // ---- Carregamento inicial em paralelo (menos lag) ----
  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading") return
      if (!data?.user?.role || data.user.role !== "ADMIN") {
        setIsLoadingData(false)
        return
      }

      setIsAdmin(true)
      try {
        const [barbersList, confirmed, concluded, initialMetrics] =
          await Promise.all([
            getBarbers(),
            getAdminConfirmedBookings(),
            getAdminConcludedBookings(),
            getDashboardMetrics(),
          ])
        setBarbers(barbersList)
        setConfirmedBookings(confirmed)
        setConcludedBookings(concluded.bookings)
        setConcludedHasMore(concluded.hasMore)
        setMetrics(initialMetrics)
      } catch (error) {
        console.error(error)
        toast.error("Erro ao carregar o dashboard.")
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [data?.user?.role, status])

  // ---- Métricas por barbeiro ----
  useEffect(() => {
    if (!isAdmin) return
    getDashboardMetrics(selectedBarber)
      .then(setMetrics)
      .catch(() => toast.error("Erro ao carregar métricas."))
  }, [selectedBarber, isAdmin])

  // ---- Finalizados: recarrega ao trocar o barbeiro (paginação no servidor) ----
  useEffect(() => {
    if (!isAdmin) return
    getAdminConcludedBookings({ barberId: selectedBarber })
      .then((result) => {
        setConcludedBookings(result.bookings)
        setConcludedHasMore(result.hasMore)
      })
      .catch(() => toast.error("Erro ao carregar finalizados."))
  }, [selectedBarber, isAdmin])

  const handleLoadMoreConcluded = async () => {
    setIsLoadingMore(true)
    try {
      const result = await getAdminConcludedBookings({
        barberId: selectedBarber,
        skip: concludedBookings.length,
      })
      setConcludedBookings((prev) => [...prev, ...result.bookings])
      setConcludedHasMore(result.hasMore)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar mais finalizados.")
    } finally {
      setIsLoadingMore(false)
    }
  }

  // ---- Rendimento por período ----
  useEffect(() => {
    if (!isAdmin) return

    let from: Date
    let to: Date = new Date()
    if (periodPreset === "hoje") {
      from = new Date()
    } else if (periodPreset === "7dias") {
      from = subDays(new Date(), 6)
    } else if (periodPreset === "mes") {
      from = startOfMonth(new Date())
    } else {
      if (!periodFrom || !periodTo) return
      from = new Date(`${periodFrom}T00:00:00`)
      to = new Date(`${periodTo}T00:00:00`)
      if (from > to) return
    }

    setIsLoadingPeriod(true)
    getMetricsForPeriod(selectedBarber, from, to)
      .then(setPeriodMetrics)
      .catch(() => toast.error("Erro ao calcular rendimento."))
      .finally(() => setIsLoadingPeriod(false))
  }, [isAdmin, selectedBarber, periodPreset, periodFrom, periodTo])

  // ---- Bloqueios + reservas do dia selecionado ----
  const loadDaySchedule = useCallback(async () => {
    if (!selectedDay || !scheduleBarberId) {
      setDayBlocks([])
      setDayBookings([])
      setDayFixed([])
      return
    }
    const [blocks, bookings, fixed] = await Promise.all([
      getBlock({ date: selectedDay, barberId: scheduleBarberId }),
      getBookings({ date: selectedDay, barberId: scheduleBarberId }),
      getFixedOccupancy({ date: selectedDay, barberId: scheduleBarberId }),
    ])
    setDayBlocks(blocks)
    setDayBookings(bookings)
    setDayFixed(fixed)
  }, [selectedDay, scheduleBarberId])

  useEffect(() => {
    loadDaySchedule()
  }, [loadDaySchedule])

  // ---- Confirmados: filtro por barbeiro (lista pequena, filtra no cliente) ----
  const filteredConfirmed = useMemo(() => {
    if (selectedBarber === "todos") return confirmedBookings
    return confirmedBookings.filter((b) => b.barberId === selectedBarber)
  }, [confirmedBookings, selectedBarber])

  const confirmedBookingsById = useMemo(() => {
    const map = new Map<string, BookingWithRelations>()
    confirmedBookings.forEach((b) => map.set(b.id, b))
    return map
  }, [confirmedBookings])

  // ---- Grade de horários (segue o passo do barbeiro: 30 min ou 1h) ----
  const slots: SlotInfo[] = useMemo(() => {
    if (!selectedDay || !scheduleBarberId) return []
    const step = getSlotStep(scheduleBarberId)

    return generateTimeSlots(scheduleBarberId, selectedDay).map((time) => {
      const slotStart = slotToDate(selectedDay, time)
      const slotEnd = addMinutes(slotStart, step)

      const booking = dayBookings.find((b) => {
        const bookingStart = new Date(b.date)
        const bookingEnd = addMinutes(bookingStart, b.durationMinutes ?? 30)
        return slotStart < bookingEnd && bookingStart < slotEnd
      })
      if (booking) {
        const fullBooking = confirmedBookingsById.get(booking.id)
        return {
          time,
          status: "booked" as SlotStatus,
          clientName: fullBooking?.user?.name ?? undefined,
        }
      }

      const fixed = dayFixed.find((f) => {
        const fixedStart = new Date(f.date)
        const fixedEnd = addMinutes(fixedStart, f.durationMinutes ?? 30)
        return slotStart < fixedEnd && fixedStart < slotEnd
      })
      if (fixed) {
        return {
          time,
          status: "fixed" as SlotStatus,
          clientName: fixed.clientName,
        }
      }

      const block = dayBlocks.find((b) => {
        const blockStart = new Date(b.date)
        const blockEnd = addMinutes(blockStart, step)
        return slotStart < blockEnd && blockStart < slotEnd
      })
      if (block) {
        return { time, status: "blocked" as SlotStatus, blockId: block.id }
      }

      if (isToday(selectedDay) && isPast(slotStart)) {
        return { time, status: "past" as SlotStatus }
      }

      return { time, status: "free" as SlotStatus }
    })
  }, [selectedDay, scheduleBarberId, dayBlocks, dayBookings, dayFixed, confirmedBookingsById])

  // ---- Ações sobre a grade ----
  const handleSlotClick = (slot: SlotInfo) => {
    if (!selectedDay || !scheduleBarberId) return
    if (
      slot.status === "booked" ||
      slot.status === "fixed" ||
      slot.status === "past"
    )
      return

    startTransition(async () => {
      try {
        if (slot.status === "blocked" && slot.blockId) {
          await deleteBlock(slot.blockId)
          toast.success(`Horário ${slot.time} liberado!`)
        } else if (slot.status === "free") {
          await createBlock({
            date: slotToDate(selectedDay, slot.time),
            barberId: scheduleBarberId,
          })
          toast.success(`Horário ${slot.time} bloqueado!`)
        }
        await loadDaySchedule()
      } catch (error) {
        console.error(error)
        toast.error("Erro ao atualizar horário.")
      }
    })
  }

  const handleBlockDay = () => {
    if (!selectedDay || !scheduleBarberId) return
    const freeSlots = slots.filter((s) => s.status === "free")
    if (freeSlots.length === 0) return

    startTransition(async () => {
      try {
        await Promise.all(
          freeSlots.map((slot) =>
            createBlock({
              date: slotToDate(selectedDay, slot.time),
              barberId: scheduleBarberId,
            }),
          ),
        )
        toast.success("Dia inteiro bloqueado!")
        await loadDaySchedule()
      } catch (error) {
        console.error(error)
        toast.error("Erro ao bloquear o dia.")
      }
    })
  }

  const handleUnblockDay = () => {
    const blockedSlots = slots.filter((s) => s.status === "blocked" && s.blockId)
    if (blockedSlots.length === 0) return

    startTransition(async () => {
      try {
        await Promise.all(blockedSlots.map((slot) => deleteBlock(slot.blockId!)))
        toast.success("Bloqueios do dia removidos!")
        await loadDaySchedule()
      } catch (error) {
        console.error(error)
        toast.error("Erro ao desbloquear o dia.")
      }
    })
  }

  const scheduleBarberName = barbers.find((b) => b.id === scheduleBarberId)?.name

  const formatCurrency = (value: number) =>
    Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value)

  if (status === "loading" || isLoadingData) {
    return (
      <>
        <Header />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    )
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="flex h-[60vh] flex-col items-center justify-center gap-2 px-5 text-center">
          <h1 className="font-display text-2xl">Acesso restrito</h1>
          <p className="text-muted-foreground">
            Esta área é exclusiva dos barbeiros.
          </p>
        </div>
      </>
    )
  }

  const metricCards = [
    {
      label: "Hoje",
      value: metrics?.today ?? "–",
      icon: Scissors,
      hint: "atendimentos",
    },
    {
      label: "Semana",
      value: metrics?.week ?? "–",
      icon: CalendarDays,
      hint: "atendimentos",
    },
    {
      label: "Mês",
      value: metrics?.month ?? "–",
      icon: CalendarRange,
      hint: "atendimentos",
    },
    {
      label: "Receita do mês",
      value: metrics != null ? formatCurrency(metrics.monthRevenue) : "–",
      icon: DollarSign,
      hint: "estimada",
    },
  ]

  const concludedCount = `${concludedBookings.length}${concludedHasMore ? "+" : ""}`

  return (
    <>
      <Header />
      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* TOPO: título + filtro */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wide">
              Dashboard <span className="text-primary">da barbearia</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Métricas, agendamentos e gestão de horários.
            </p>
          </div>
          <Select value={selectedBarber} onValueChange={setSelectedBarber}>
            <SelectTrigger className="w-full rounded-xl sm:w-[240px]">
              <SelectValue placeholder="Barbeiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os barbeiros</SelectItem>
              {barbers.map((barber) => (
                <SelectItem key={barber.id} value={barber.id}>
                  {barber.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* MÉTRICAS */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <card.icon size={16} className="text-primary" />
              </div>
              <p className="mt-2 font-display text-3xl">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.hint}</p>
            </div>
          ))}
        </div>

        {/* RENDIMENTO POR PERÍODO
        <div className="mb-8 rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rendimento por período
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={periodPreset}
                onValueChange={(value) => setPeriodPreset(value as PeriodPreset)}
              >
                <SelectTrigger className="h-9 w-[160px] rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {periodPreset === "personalizado" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={periodFrom}
                    max={periodTo}
                    onChange={(e) => setPeriodFrom(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-secondary/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">até</span>
                  <input
                    type="date"
                    value={periodTo}
                    min={periodFrom}
                    onChange={(e) => setPeriodTo(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-secondary/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-8">
            <div>
              <p className="text-xs text-muted-foreground">Atendimentos</p>
              <p className="font-display text-3xl">
                {isLoadingPeriod ? "..." : (periodMetrics?.count ?? "–")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receita</p>
              <p className="font-display text-3xl text-primary">
                {isLoadingPeriod
                  ? "..."
                  : periodMetrics != null
                    ? formatCurrency(periodMetrics.revenue)
                    : "–"}
              </p>
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* GESTÃO DE HORÁRIOS */}
          <section className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="font-display text-xl tracking-wide">
              Gestão de <span className="text-primary">horários</span>
            </h2>
            <p className="mb-3 text-sm text-muted-foreground">
              {scheduleBarberName
                ? `Agenda de ${scheduleBarberName} (${
                    scheduleBarberId && getSlotStep(scheduleBarberId) === 30
                      ? "30 em 30 min"
                      : "1 em 1 hora"
                  }). Toque em um horário livre para bloquear ou em um bloqueado para liberar.`
                : "Selecione um barbeiro para gerenciar a agenda."}
            </p>

            <div className="flex justify-center">
              <DayPicker
                showOutsideDays
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                locale={pt}
                disabled={{ dayOfWeek: [0] }}
                className="p-3"
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium capitalize",
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
                  day_disabled: "text-muted-foreground opacity-40",
                }}
                components={{
                  IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                  IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
              />
            </div>

            {selectedDay && scheduleBarberId && (
              <div className="mt-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold capitalize">
                    {selectedDay.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBlockDay}
                      disabled={isPending || slots.every((s) => s.status !== "free")}
                    >
                      <Lock size={13} />
                      Bloquear dia
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUnblockDay}
                      disabled={
                        isPending || slots.every((s) => s.status !== "blocked")
                      }
                    >
                      <LockOpen size={13} />
                      Liberar dia
                    </Button>
                  </div>
                </div>

                {slots.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Sem expediente neste dia.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={
                          isPending ||
                          slot.status === "booked" ||
                          slot.status === "fixed" ||
                          slot.status === "past"
                        }
                        onClick={() => handleSlotClick(slot)}
                        title={
                          slot.status === "booked"
                            ? `Reservado${slot.clientName ? ` — ${slot.clientName}` : ""}`
                            : slot.status === "fixed"
                              ? `Cliente fixo${slot.clientName ? ` — ${slot.clientName}` : ""}`
                              : slot.status === "blocked"
                                ? "Bloqueado — toque para liberar"
                                : slot.status === "past"
                                  ? "Horário já passou"
                                  : "Livre — toque para bloquear"
                        }
                        className={cn(
                          "rounded-lg border p-2 text-center text-sm font-medium transition-all",
                          isPending && "cursor-not-allowed opacity-50",
                          slot.status === "free" &&
                            "border-border bg-secondary/40 hover:border-primary/60 hover:bg-secondary",
                          slot.status === "blocked" &&
                            "border-destructive/50 bg-destructive/15 text-red-400 line-through hover:bg-destructive/25",
                          slot.status === "booked" &&
                            "cursor-default border-primary/50 bg-primary/15 text-primary",
                          slot.status === "fixed" &&
                            "cursor-default border-amber-500/50 bg-amber-500/15 text-amber-400",
                          slot.status === "past" &&
                            "cursor-default border-border/40 bg-transparent text-muted-foreground/40",
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}

                {/* LEGENDA */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                    Livre
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    Reservado
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    Bloqueado
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Cliente fixo
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* AGENDAMENTOS */}
          <section className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-xl tracking-wide">
                Agendamentos
              </h2>
              <div className="flex w-fit max-w-full overflow-x-auto rounded-full border border-border/60 p-0.5">
                <button
                  onClick={() => setActiveTab("confirmados")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                    activeTab === "confirmados"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Confirmados ({filteredConfirmed.length})
                </button>
                <button
                  onClick={() => setActiveTab("finalizados")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                    activeTab === "finalizados"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Finalizados ({concludedCount})
                </button>
                <button
                  onClick={() => setActiveTab("fixos")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                    activeTab === "fixos"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Fixos
                </button>
              </div>
            </div>

            <ScrollArea className="h-[640px] w-full pr-2">
              <div className="flex flex-col space-y-4">
                {activeTab === "confirmados" ? (
                  <>
                    {filteredConfirmed.map((booking) => (
                      <BookingItem
                        key={booking.id}
                        booking={JSON.parse(JSON.stringify(booking))}
                        isAdmin={true}
                      />
                    ))}
                    {filteredConfirmed.length === 0 && (
                      <p className="py-10 text-center text-sm text-muted-foreground">
                        Nenhum agendamento encontrado.
                      </p>
                    )}
                  </>
                ) : activeTab === "fixos" ? (
                  <FixedClientsPanel
                    barbers={barbers}
                    onChanged={loadDaySchedule}
                  />
                ) : (
                  <>
                    {concludedBookings.map((booking) => (
                      <BookingItem
                        key={booking.id}
                        booking={JSON.parse(JSON.stringify(booking))}
                        isAdmin={true}
                      />
                    ))}
                    {concludedBookings.length === 0 && (
                      <p className="py-10 text-center text-sm text-muted-foreground">
                        Nenhum agendamento encontrado.
                      </p>
                    )}
                    {concludedHasMore && (
                      <Button
                        variant="outline"
                        className="mx-auto w-full max-w-[240px]"
                        onClick={handleLoadMoreConcluded}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando...
                          </>
                        ) : (
                          "Carregar mais"
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </section>
        </div>
      </div>
    </>
  )
}

export default Dashboard
