"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../_lib/prisma"

interface GetBookingsProps {
  serviceId: string
  date: Date
  barberId?: string
}

export const getBookings = ({ date }: GetBookingsProps) => {
  return db.booking.findMany({
    where: {
      date: {
        lte: endOfDay(date), //mennor ou igual
        gte: startOfDay(date), //maior ou igual
      },
    },
  })
}
