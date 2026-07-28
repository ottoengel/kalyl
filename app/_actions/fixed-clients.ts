"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { startOfDay } from "date-fns"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { fixedRuleOccursOn } from "../_lib/fixed-clients"
import { slotToDate } from "../_lib/schedule"

const isAdminSession = async () => {
  const session = await getServerSession(authOptions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session?.user as any)?.role === "ADMIN"
}

export interface FixedClientWithSkips {
  id: string
  barberId: string
  clientName: string
  phone: string | null
  frequency: string
  dayOfWeek: number
  time: string
  durationMinutes: number
  startDate: Date
  notes: string | null
  active: boolean
  createdAt: Date
  skips: { id: string; date: Date }[]
}

export const getFixedClients = async (): Promise<FixedClientWithSkips[]> => {
  if (!(await isAdminSession())) return []
  return db.fixedClient.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
    select: {
      id: true,
      barberId: true,
      clientName: true,
      phone: true,
      frequency: true,
      dayOfWeek: true,
      time: true,
      durationMinutes: true,
      startDate: true,
      notes: true,
      active: true,
      createdAt: true,
      skips: {
        where: { date: { gte: startOfDay(new Date()) } },
        orderBy: { date: "asc" },
        select: { id: true, date: true },
      },
    },
  })
}

interface FixedClientInput {
  barberId: string
  clientName: string
  phone?: string
  frequency: string
  dayOfWeek: number
  time: string
  durationMinutes: number
  startDate: Date
  notes?: string
}

const sanitizeInput = (params: FixedClientInput) => ({
  barberId: params.barberId,
  clientName: params.clientName.trim().slice(0, 100),
  phone: params.phone?.trim().slice(0, 30) || null,
  frequency: ["SEMANAL", "QUINZENAL", "MENSAL"].includes(params.frequency)
    ? params.frequency
    : "SEMANAL",
  dayOfWeek: Math.min(6, Math.max(1, Math.round(params.dayOfWeek))),
  time: params.time,
  durationMinutes: params.durationMinutes === 60 ? 60 : 30,
  startDate: startOfDay(new Date(params.startDate)),
  notes: params.notes?.trim().slice(0, 300) || null,
})

export const createFixedClient = async (params: FixedClientInput) => {
  if (!(await isAdminSession())) throw new Error("Não autorizado")
  if (!params.clientName?.trim()) throw new Error("Nome obrigatório")
  await db.fixedClient.create({ data: sanitizeInput(params) })
  revalidatePath("/dashboard")
}

export const updateFixedClient = async (
  id: string,
  params: FixedClientInput,
) => {
  if (!(await isAdminSession())) throw new Error("Não autorizado")
  await db.fixedClient.update({ where: { id }, data: sanitizeInput(params) })
  revalidatePath("/dashboard")
}

export const setFixedClientActive = async (id: string, active: boolean) => {
  if (!(await isAdminSession())) throw new Error("Não autorizado")
  await db.fixedClient.update({ where: { id }, data: { active } })
  revalidatePath("/dashboard")
}

export const deleteFixedClient = async (id: string) => {
  if (!(await isAdminSession())) throw new Error("Não autorizado")
  await db.fixedClient.delete({ where: { id } })
  revalidatePath("/dashboard")
}

/** Desmarca uma ocorrência específica (o horário volta a ficar livre nesse dia) */
export const skipFixedOccurrence = async (fixedClientId: string, date: Date) => {
  if (!(await isAdminSession())) throw new Error("Não autorizado")
  const day = startOfDay(new Date(date))
  await db.fixedClientSkip.upsert({
    where: { fixedClientId_date: { fixedClientId, date: day } },
    create: { fixedClientId, date: day },
    update: {},
  })
  revalidatePath("/dashboard")
}

/** Reativa uma ocorrência que havia sido desmarcada */
export const unskipFixedOccurrence = async (
  fixedClientId: string,
  date: Date,
) => {
  if (!(await isAdminSession())) throw new Error("Não autorizado")
  const day = startOfDay(new Date(date))
  await db.fixedClientSkip.deleteMany({
    where: { fixedClientId, date: day },
  })
  revalidatePath("/dashboard")
}

export interface FixedOccupancy {
  date: Date
  durationMinutes: number
  clientName: string
  fixedClientId: string
}

/**
 * Horários ocupados por clientes fixos em um dia (usado na montagem da agenda).
 * Não exige admin: o cliente comum também precisa ver esses horários como ocupados.
 */
export const getFixedOccupancy = async ({
  date,
  barberId,
}: {
  date: Date
  barberId: string
}): Promise<FixedOccupancy[]> => {
  const day = new Date(date)
  const admin = await isAdminSession()
  const rules = await db.fixedClient.findMany({
    where: { barberId, active: true, dayOfWeek: day.getDay() },
    include: {
      skips: { where: { date: startOfDay(day) }, select: { id: true } },
    },
  })

  return rules
    .filter((rule) => rule.skips.length === 0 && fixedRuleOccursOn(rule, day))
    .map((rule) => ({
      date: slotToDate(day, rule.time),
      durationMinutes: rule.durationMinutes,
      clientName: admin ? rule.clientName : "Cliente fixo",
      fixedClientId: rule.id,
    }))
}
