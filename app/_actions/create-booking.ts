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
}

export const createBooking = async (params: CreateBookingParams) => {
  const user = await getServerSession(authOptions)
  if (!user) {
    throw new Error("Usuário não autenticado")
  }
  await db.booking.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...params, date: new Date(params.date.toISOString()), userId: (user.user as any).id },
  })
  revalidatePath("/barbers/[id]")
  revalidatePath("/bookings")
}
