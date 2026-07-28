import { addMinutes, isPast, isToday, set } from "date-fns"

/**
 * Configuração de horário de cada barbeiro.
 * `close` é exclusivo: um atendimento precisa TERMINAR até o horário de fechamento.
 * Horários em horas decimais (ex.: 9.5 = 09:30).
 */
export interface DaySchedule {
  open: number
  close: number
}

export interface BarberSchedule {
  weekdays: DaySchedule // segunda a sexta
  saturday: DaySchedule
}

const DEFAULT_SCHEDULE: BarberSchedule = {
  weekdays: { open: 10, close: 20 },
  saturday: { open: 8, close: 16 },
}

// IDs dos barbeiros (mesmos do banco)
export const BARBER_IDS = {
  KALYL: "9059b8db-51a1-44da-b79b-f63ac251413e",
  YGOR: "ecc5f06c-1cc3-4ddd-a418-37b95a193f86",
  LUCAS: "4df3ad06-7a67-4941-901a-d8c166139673",
}

// Horários específicos por barbeiro
const BARBER_SCHEDULES: Record<string, BarberSchedule> = {
  // Lucas — abre mais cedo
  [BARBER_IDS.LUCAS]: {
    weekdays: { open: 8, close: 20 },
    saturday: { open: 8, close: 16 },
  },
  // Kalyl — sábado reduzido (abre 10h: o horário das 9h é de cliente fixo anual)
  [BARBER_IDS.KALYL]: {
    weekdays: { open: 10, close: 20 },
    saturday: { open: 10, close: 15 },
  },
  // Ygor
  [BARBER_IDS.YGOR]: {
    weekdays: { open: 10, close: 19 },
    saturday: { open: 10, close: 16 },
  },
}

/**
 * Granularidade da agenda de cada barbeiro:
 * - Ygor trabalha de 30 em 30 min;
 * - Lucas e Kalyl, de 1 em 1 hora.
 */
export const getSlotStep = (barberId: string): number =>
  String(barberId).trim() === BARBER_IDS.YGOR ? 30 : 60

/**
 * Duração do serviço, definida automaticamente (o cliente não escolhe):
 * - Lucas e Kalyl: todo serviço dura 1 hora;
 * - Ygor: Cabelo e Barba dura 1 hora, os demais 30 min.
 */
export const getServiceDuration = (
  barberId: string,
  serviceName: string,
): number => {
  if (getSlotStep(barberId) === 60) return 60
  return serviceName.toLowerCase().includes("cabelo e barba") ? 60 : 30
}

export const getBarberSchedule = (barberId: string): BarberSchedule =>
  BARBER_SCHEDULES[String(barberId).trim()] ?? DEFAULT_SCHEDULE

export const getDaySchedule = (
  barberId: string,
  day: Date,
): DaySchedule | null => {
  const dayOfWeek = day.getDay()
  if (dayOfWeek === 0) return null // domingo fechado
  const schedule = getBarberSchedule(barberId)
  return dayOfWeek === 6 ? schedule.saturday : schedule.weekdays
}

const hourToLabel = (decimalHour: number) => {
  const hours = Math.floor(decimalHour)
  const minutes = Math.round((decimalHour - hours) * 60)
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export const slotToDate = (day: Date, slot: string) =>
  set(day, {
    hours: Number(slot.split(":")[0]),
    minutes: Number(slot.split(":")[1]),
    seconds: 0,
    milliseconds: 0,
  })

/**
 * Gera os horários de início possíveis para um barbeiro em um dia,
 * seguindo a granularidade dele (30 min ou 1h) e garantindo que o
 * atendimento termine antes do fechamento.
 */
export const generateTimeSlots = (
  barberId: string,
  day: Date,
  durationMinutes?: number,
): string[] => {
  const daySchedule = getDaySchedule(barberId, day)
  if (!daySchedule) return []

  const step = getSlotStep(barberId) / 60
  const duration = (durationMinutes ?? getSlotStep(barberId)) / 60

  const slots: string[] = []
  for (
    let hour = daySchedule.open;
    hour + duration <= daySchedule.close;
    hour += step
  ) {
    slots.push(hourToLabel(hour))
  }
  return slots
}

interface OccupiedInterval {
  date: Date
  durationMinutes?: number | null
}

const intervalsOverlap = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) => startA < endB && startB < endA

/**
 * Verifica se um horário está livre considerando reservas (com duração)
 * e bloqueios (que ocupam um slot inteiro do barbeiro) já existentes.
 */
export const isSlotAvailable = ({
  barberId,
  day,
  slot,
  durationMinutes,
  bookings,
  blocks,
}: {
  barberId: string
  day: Date
  slot: string
  durationMinutes: number
  bookings: OccupiedInterval[]
  blocks: { date: Date }[]
}): boolean => {
  const slotStart = slotToDate(day, slot)
  const slotEnd = addMinutes(slotStart, durationMinutes)
  const blockDuration = getSlotStep(barberId)

  if (isToday(day) && isPast(slotStart)) return false

  const bookingConflict = bookings.some((booking) => {
    const bookingStart = new Date(booking.date)
    const bookingEnd = addMinutes(bookingStart, booking.durationMinutes ?? 30)
    return intervalsOverlap(slotStart, slotEnd, bookingStart, bookingEnd)
  })
  if (bookingConflict) return false

  const blockConflict = blocks.some((block) => {
    const blockStart = new Date(block.date)
    const blockEnd = addMinutes(blockStart, blockDuration)
    return intervalsOverlap(slotStart, slotEnd, blockStart, blockEnd)
  })
  return !blockConflict
}

/** Formata um intervalo de atendimento, ex.: "14:00 – 15:00" */
export const formatSlotRange = (start: Date, durationMinutes: number) => {
  const end = addMinutes(start, durationMinutes)
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  return `${fmt(start)} – ${fmt(end)}`
}
