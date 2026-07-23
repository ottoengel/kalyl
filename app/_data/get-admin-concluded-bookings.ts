"use server"

import { getServerSession } from "next-auth"
import { db } from "../_lib/prisma"
import { authOptions } from "../_lib/auth"

const PAGE_SIZE = 20

interface GetAdminConcludedBookingsParams {
  barberId?: string
  skip?: number
  take?: number
}

/**
 * Histórico de finalizados carregado em blocos (paginação via "Carregar mais"),
 * para o dashboard continuar leve mesmo com muito histórico.
 */
export const getAdminConcludedBookings = async ({
  barberId,
  skip = 0,
  take = PAGE_SIZE,
}: GetAdminConcludedBookingsParams = {}) => {
  const session = await getServerSession(authOptions)

  if (!session?.user) return { bookings: [], hasMore: false }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session.user as any).role === "ADMIN"

  const bookings = await db.booking.findMany({
    where: {
      ...(isAdmin
        ? {}
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { userId: (session.user as any).id }),
      ...(barberId && barberId !== "todos" ? { barberId } : {}),
      date: {
        lt: new Date(),
      },
    },
    include: {
      service: {
        include: {
          barber: true,
        },
      },
      user: true,
    },
    orderBy: {
      date: "desc",
    },
    skip,
    // Busca um a mais só para saber se ainda há histórico
    take: take + 1,
  })

  return {
    bookings: bookings.slice(0, take),
    hasMore: bookings.length > take,
  }
}
