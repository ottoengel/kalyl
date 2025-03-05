// app/_actions/get-barber.ts
'use server'
import { db } from "../_lib/prisma"; // Certifique-se de que o Prisma esteja configurado corretamente

interface UserTimeResponse {
  users: { createdAt: Date }[]; // A estrutura do users, que contém a data de criação
  totalUsers: number;           // Contagem total de usuários
}

export const getUserTime = async (): Promise<UserTimeResponse> => {
  // Obtém os usuários com a data de criação
  const users = await db.user.findMany({
    select: { createdAt: true },
  });

  // Conta o número total de usuários (você pode usar isso em outro lugar, se necessário)
  const totalUsers = await db.user.count();

  // Retorna o valor
  return { users, totalUsers };
};
