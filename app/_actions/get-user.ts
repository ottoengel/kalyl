// app/_actions/get-barber.ts
'use server'
import { db } from "../_lib/prisma"; // Certifique-se de que o Prisma esteja configurado corretamente

interface UserTimeResponse {
  users: { createdAt: Date }[]; // A estrutura do users, que contém a data de criação
  totalUsers: number; 
  totalMensalistas: number;     // Contagem total de usuários com a role "MENSALISTA"
  // Contagem total de usuários
}

export const getUserTime = async (): Promise<UserTimeResponse> => {
    
    const users = await db.user.findMany({
    select: { createdAt: true },
  });

  const totalUsers = await db.user.count();

  const totalMensalistas = await db.user.count({
    where: {
      role: "MENSALISTA",
    },
  });
  // Retorna o valor
  return { users, totalUsers, totalMensalistas};
};
