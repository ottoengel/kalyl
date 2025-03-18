"use server"

import { db } from "../_lib/prisma"

export const countBookings = async () => {
  return await db.booking.count()
<<<<<<< HEAD

  
=======
>>>>>>> 343138f64c0bb55fc9f90c587befbdb6d5accfc0
}
