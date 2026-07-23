"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../_lib/prisma"

interface GetBlockProps {
  date: Date
  barberId?: string
}

export const getBlock = ({ date, barberId }: GetBlockProps) => {
  return db.block.findMany({
    where: {
      ...(barberId ? { barberId } : {}),
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
  })
}
