"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

interface CreateBookingParams {
  serviceId: string
  date: Date
  type: string
  barberId: string
  durationMinutes?: number
  observation?: string
}

export type CreateBookingResult =
  | { success: true }
  | { success: false; error: "unauthenticated" | "blocked" | "unknown" }

export const createBooking = async (
  params: CreateBookingParams,
): Promise<CreateBookingResult> => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { success: false, error: "unauthenticated" }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any).id as string

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { blocked: true },
  })
  if (!user || user.blocked) {
    return { success: false, error: "blocked" }
  }

  const observation = params.observation?.trim()

  try {
    await db.booking.create({
      data: {
        serviceId: params.serviceId,
        barberId: params.barberId,
        type: params.type,
        date: new Date(params.date.toISOString()),
        durationMinutes: params.durationMinutes === 60 ? 60 : 30,
        observation: observation ? observation.slice(0, 300) : null,
        userId,
      },
    })
  } catch (error) {
    console.error("Erro ao criar reserva:", error)
    return { success: false, error: "unknown" }
  }

  revalidatePath("/barbers/[id]")
  revalidatePath("/bookings")
  return { success: true }
}
