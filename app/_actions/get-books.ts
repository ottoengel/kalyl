"use server"

import { db } from "../_lib/prisma"

export const countBookings = async () => {
  return await db.booking.count()

  const dailyBookings = await db.booking.groupBy({
    by: ["date"],
    _count: { id: true },
    _sum: { service: { price: true } },
  });

  const monthlyBookings = await db.booking.groupBy({
    by: ["barberId"],
    _count: { id: true },
  });

  const totalRevenue = await db.booking.aggregate({
    _sum: { service: { price: true } },
  });

  return {
    dailyBookings: dailyBookings.map((b) => ({
      date: b.date,
      count: b._count.id,
      revenue: b._sum.service?.price || 0,
    })),
    totalRevenue: totalRevenue._sum.service?.price || 0,
    monthlyBookings: monthlyBookings.length,
  };
}
