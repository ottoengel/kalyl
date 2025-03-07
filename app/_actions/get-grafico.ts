"use server";

import { db } from "../_lib/prisma";

export const getBookingsData = async () => {
  // Buscar atendimentos diários
  const dailyBookings = await db.booking.groupBy({
    by: ["date"],
    _count: { id: true },
  });

  // Buscar faturamento total
  const totalRevenueData = await db.booking.findMany({
    select: {
      service: { select: { price: true } },
    },
  });

  // Calcular faturamento total
  const totalRevenue = totalRevenueData.reduce((sum, booking) => {
    return sum + Number(booking.service.price);
  }, 0);

  // Buscar número total de clientes atendidos no mês
  const monthlyBookings = await db.booking.count({
    where: {
      date: {
        gte: new Date(new Date().setDate(1)), // Primeiro dia do mês atual
      },
    },
  });

  return {
    dailyBookings: dailyBookings.map((b) => ({
      date: b.date,
      count: b._count.id,
    })),
    totalRevenue,
    monthlyBookings,
  };
};
