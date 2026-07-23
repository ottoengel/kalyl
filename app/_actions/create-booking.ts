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

export const createBooking = async (params: CreateBookingParams) => {
  const user = await getServerSession(authOptions)
  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const observation = params.observation?.trim()

  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      barberId: params.barberId,
      type: params.type,
      date: new Date(params.date.toISOString()),
      durationMinutes: params.durationMinutes === 60 ? 60 : 30,
      observation: observation ? observation.slice(0, 300) : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: (user.user as any).id,
    },
  })
  revalidatePath("/barbers/[id]")
  revalidatePath("/bookings")
}
