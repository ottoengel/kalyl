"use server";

import { db } from "@/app/_lib/prisma";
import { DashboardResponse } from "../_types/dash";

export async function getDashboardData(): Promise<DashboardResponse> {
  const now = new Date();

  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Buscar barbeiros com serviços e bookings
  const barbers = await db.barber.findMany({
    include: {
      services: true,
      bookings: {
        include: {
          service: true,
        },
      },
    },
  });

  const dashboard = barbers.map((barber) => {
    const monthBookings = barber.bookings.filter(
      (booking) =>
        booking.date >= firstDayOfMonth &&
        booking.date <= lastDayOfMonth
    );

    const totalBookings = barber.bookings;

    // Agrupar por serviço
    const services = barber.services.map((service) => {
      const monthCount = monthBookings.filter(
        (b) => b.serviceId === service.id
      ).length;

      const totalCount = totalBookings.filter(
        (b) => b.serviceId === service.id
      ).length;

      return {
        name: service.name,
        price: Number(service.price),
        month: monthCount,
        total: totalCount,
        monthRevenue: monthCount * Number(service.price),
        totalRevenue: totalCount * Number(service.price),
      };
    });

    const monthRevenue = services.reduce(
      (sum, s) => sum + s.monthRevenue,
      0
    );

    const totalRevenue = services.reduce(
      (sum, s) => sum + s.totalRevenue,
      0
    );

    return {
      id: barber.id,
      name: barber.name,
      services,
      monthRevenue,
      totalRevenue,
    };
  });

  // Totais gerais da barbearia
  const totalMonthRevenue = dashboard.reduce(
    (sum, b) => sum + b.monthRevenue,
    0
  );

  const totalAllRevenue = dashboard.reduce(
    (sum, b) => sum + b.totalRevenue,
    0
  );

  const totalMonthServices = dashboard.reduce(
    (sum, b) =>
      sum + b.services.reduce((s, service) => s + service.month, 0),
    0
  );

  const totalAllServices = dashboard.reduce(
    (sum, b) =>
      sum + b.services.reduce((s, service) => s + service.total, 0),
    0
  );

  return {
    barbers: dashboard,
    totals: {
      totalMonthRevenue,
      totalAllRevenue,
      totalMonthServices,
      totalAllServices,
    },
  };
}