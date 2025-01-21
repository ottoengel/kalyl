"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"

export const deleteBlock = async (blockId: string) => {
  await db.block.delete({
    where: {
      id: blockId,
    },
  })
  revalidatePath("/block")
}
