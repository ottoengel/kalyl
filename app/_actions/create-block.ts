"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

interface createBlock {
  date: Date
}

export const createBlock = async (params: createBlock) => {
  const user = await getServerSession(authOptions) 
  if (!user) {
    throw new Error("Usuário não autenticado")
  }
  await db.block.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...params, userId: (user.user as any).id },
  })
  revalidatePath("/barbers/[id]")
  revalidatePath("/block")
}
