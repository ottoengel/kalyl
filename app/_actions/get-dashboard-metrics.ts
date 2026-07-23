"use server"

import { endOfDay, startOfDay, startOfMonth, startOfWeek } from "date-fns"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"

export interface DashboardMetrics {
  today: number
  week: number
  month: number
  monthRevenue: number
}

/**
 * Métricas do dashboard, opcionalmente filtradas por barbeiro.
 * Consultas agregadas leves (counts + soma de preços do mês).
 */
export const getDashboardMetrics = async (
  barberId?: string,
): Promise<DashboardMetrics> => {
  const session = await getServerSession(authOptions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.role !== "ADMIN") {
    return { today: 0, week: 0, month: 0, monthRevenue: 0 }
  }

  const now = new Date()
  const barberFilter = barberId && barberId !== "todos" ? { barberId } : {}

  const [today, week, monthBookings] = await Promise.all([
    db.booking.count({
      where: {
        ...barberFilter,
        date: { gte: startOfDay(now), lte: endOfDay(now) },
      },
    }),
    db.booking.count({
      where: {
        ...barberFilter,
        date: { gte: startOfWeek(now, { weekStartsOn: 1 }) },
      },
    }),
    db.booking.findMany({
      where: {
        ...barberFilter,
        date: { gte: startOfMonth(now) },
      },
      select: { service: { select: { price: true } } },
    }),
  ])

  const monthRevenue = monthBookings.reduce(
    (sum, booking) => sum + Number(booking.service.price),
    0,
  )

  return {
    today,
    week,
    month: monthBookings.length,
    monthRevenue,
  }
}

export interface PeriodMetrics {
  count: number
  revenue: number
}

/**
 * Rendimento (atendimentos + receita) de um período qualquer,
 * opcionalmente filtrado por barbeiro.
 */
export const getMetricsForPeriod = async (
  barberId: string | undefined,
  from: Date,
  to: Date,
): Promise<PeriodMetrics> => {
  const session = await getServerSession(authOptions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.role !== "ADMIN") {
    return { count: 0, revenue: 0 }
  }

  const bookings = await db.booking.findMany({
    where: {
      ...(barberId && barberId !== "todos" ? { barberId } : {}),
      date: {
        gte: startOfDay(from),
        lte: endOfDay(to),
      },
    },
    select: { service: { select: { price: true } } },
  })

  return {
    count: bookings.length,
    revenue: bookings.reduce(
      (sum, booking) => sum + Number(booking.service.price),
      0,
    ),
  }
}
