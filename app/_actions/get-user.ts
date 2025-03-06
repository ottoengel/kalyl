"use server";
import { db } from "../_lib/prisma"; // Certifique-se de que o Prisma esteja configurado corretamente

interface UserTimeResponse {
  users: { createdAt: Date }[]; 
  totalUsers: number;
  totalMensalistas: number; 
}

interface UserInfoResponse {
  userInfo: { id: string, name: string | null; image: string | null, role: string; email: string }[];
}

export const getUserTime = async (): Promise<UserTimeResponse> => {
  const users = await db.user.findMany({
    select: { createdAt: true },
  });

  const totalUsers = await db.user.count();

  const totalMensalistas = await db.user.count({
    where: {
      role: {
        in: ["MENSALISTAC", "MENSALISTAB", "MENSALISTACB"],
      },
    },
  });

  return { users, totalUsers, totalMensalistas };
};

export const getUserInfo = async (): Promise<UserInfoResponse> => {
  const userInfo = await db.user.findMany({
    select: {
    id: true,
      name: true,
      image: true,
      role: true,
      email: true,
    },
  });

  return { userInfo };
};
