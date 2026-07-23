"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../_lib/prisma"

interface GetBookingsProps {
  date: Date
  barberId?: string
}

export const getBookings = ({ date, barberId }: GetBookingsProps) => {
  return db.booking.findMany({
    where: {
      ...(barberId ? { barberId } : {}),
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
  })
}
