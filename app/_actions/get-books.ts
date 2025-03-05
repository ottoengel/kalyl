"use server"

import { db } from "../_lib/prisma"

export const countBookings = async () => {
  return await db.booking.count()
}
