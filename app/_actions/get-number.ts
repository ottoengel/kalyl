'use server'

import { db } from "../_lib/prisma";

export const getUserNumber = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { number: true },
  });

  return user?.number ? true : false;
};
