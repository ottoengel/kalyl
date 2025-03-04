'use server'
// app/_actions/get-barber.ts
import { db } from "../_lib/prisma"; // Certifique-se de que o Prisma esteja configurado corretamente

export const getBarbers = async () => {
  return await db.barber.findMany({
    select: { id: true, name: true },
  });
};
