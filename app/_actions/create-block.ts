/* eslint-disable no-unused-vars */
"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
// _actions/create-block.ts
interface CreateBlock {
  date: Date;
  barberId: string;
}

export const createBlock = async (params: CreateBlock) => {
  const user = await getServerSession(authOptions);
  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  await db.block.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...params, userId: (user.user as any).id },
  });

  revalidatePath("/barbers/[id]");
  revalidatePath("/block");
};

