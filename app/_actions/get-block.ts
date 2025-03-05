"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../_lib/prisma"

interface GetBlockProps {
  date: Date
  barberId?: string
}
 // pegar seção do create
export const  getBlock = ({ date }: GetBlockProps) => {
  return db.block.findMany({
    where: {
      date: {
        lte: endOfDay(date), //mennor ou igual
        gte: startOfDay(date), //maior ou igual
      },
    },
  })
}
