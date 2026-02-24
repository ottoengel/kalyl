/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Scissors, DollarSign, TrendingUp, Users } from "lucide-react";
import { MobileStatCard } from "./components/mobile-stat-card";
import { MobileBarberCard } from "./components/mobile-barber-card";
// import { MobileServiceCompare } from "./components/mobile-service-compare";
import Header from "../_components/header";
import { getUserTime } from "../_actions/get-user";
import { useEffect, useState } from "react";
import { getDashboardData } from "../_actions/get-dashboard";
import { DashboardResponse } from "../_types/dash";

export default function App() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getDashboardData();
      setDashboard(data);
    }

    load();
  }, []);

  const barbersData = dashboard?.barbers ?? [];

  const totalMonthRevenue = dashboard?.totals.totalMonthRevenue ?? 0;
  const totalAllRevenue = dashboard?.totals.totalAllRevenue ?? 0;
  const totalMonthServices = dashboard?.totals.totalMonthServices ?? 0;
  const totalAllServices = dashboard?.totals.totalAllServices ?? 0;
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserTime();
      if (data.totalUsers > 0) {
        setTotalUsers(data.totalUsers);
      }
    };

    fetchData();
  }, []);

  const colorBarber = (name: string) => {
  const colors: Record<string, string> = {
    "Kalyl": "#ef4444",
    "Ygor": "#3b82f6",
    "Lucas": "#10b981",
  };

  return colors[name] ?? "#a855f7";
};

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-background dark">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard Barbearia Kalyl</h1>
            <span className="text-green-400 font-bold text-xl">{totalUsers} Usuários</span>
          </div>

          {/* Cards de Resumo Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <MobileStatCard
              title="Serviços (Mês)"
              value={totalMonthServices}
              subtitle="Total de cortes no mês"
              icon={Scissors}
              color="hsl(var(--primary))"
            />
            <MobileStatCard
              title="Serviços (Total)"
              value={totalAllServices}
              subtitle="Total de cortes geral"
              icon={TrendingUp}
              color="#10b981"
            />
            <MobileStatCard
              title="Faturamento (Mês)"
              value={`R$ ${totalMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle="Receita do mês atual"
              icon={DollarSign}
              color="hsl(var(--primary))"
            />
            <MobileStatCard
              title="Faturamento (Total)"
              value={`R$ ${totalAllRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle="Receita total acumulada"
              icon={DollarSign}
              color="#3b82f6"
            />
          </div>

          {/* Cards dos Barbeiros */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h2 className="text-xl md:text-2xl font-semibold">Desempenho por Barbeiro</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {barbersData.map((barber: any) => (
                <MobileBarberCard
                  key={barber.name}
                  name={barber.name}
                  services={barber.services}
                  monthRevenue={barber.monthRevenue}
                  totalRevenue={barber.totalRevenue}
                  color={colorBarber(barber.name)}
                />
              ))}
            </div>
          </div>

          {/* Comparativo de Serviços */}
          {/* <div className="mb-8">
            <MobileServiceCompare
              data={barbersData.flatMap(barber =>
                barber.services.map(service => ({
                  name: `${service.name} - ${barber.name.split(' ')[0]}`,
                  month: service.month,
                  total: service.total,
                  color: colorBarber(barber.name)
                }))
              )}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
}

