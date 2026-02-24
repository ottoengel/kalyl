"use client"
import { Scissors, TrendingUp } from "lucide-react";

interface ServiceData {
  name: string;
  month: number;
  total: number;
}

interface MobileBarberCardProps {
  name: string;
  services: ServiceData[];
  monthRevenue: number;
  totalRevenue: number;
  color: string;
}

export function MobileBarberCard({
  name,
  services,
  monthRevenue,
  totalRevenue,
  color,
}: MobileBarberCardProps) {

  const totalMonthServices = services.reduce((sum, s) => sum + s.month, 0);

  return (
    <div className="bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Scissors className="w-7 h-7" style={{ color }} />
        </div>

        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {totalMonthServices} cortes este mês
          </p>
        </div>
      </div>

      {/* Serviços */}
      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.name}
            className="bg-secondary/50 rounded-xl p-4 border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{service.name}</h4>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Este mês</p>
                <p className="text-2xl font-bold" style={{ color }}>
                  {service.month}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold">
                  {service.total}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divisor */}
      <div className="border-t border-border" />

      {/* Faturamento */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border">
          <TrendingUp className="w-5 h-5" style={{ color }} />
          <div>
            <p className="text-xs text-muted-foreground">Faturamento Mês</p>
            <p className="text-xl font-bold" style={{ color }}>
              R$ {monthRevenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Faturamento Total</p>
            <p className="text-xl font-bold">
              R$ {totalRevenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}