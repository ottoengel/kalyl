import { Scissors, TrendingUp } from "lucide-react";

interface ServiceData {
  name: string;
  month: number;
  total: number;
}

interface BarberCardProps {
  name: string;
  services: ServiceData[];
  monthRevenue: number;
  totalRevenue: number;
  color: string;
}

export function BarberCard({ name, services, monthRevenue, totalRevenue, color }: BarberCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Scissors className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">Barbeiro</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Serviços</h4>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{service.name}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Mês: <span className="font-semibold text-foreground">{service.month}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Total: <span className="font-semibold text-foreground">{service.total}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Faturamento (Mês)
          </span>
          <span className="text-lg font-semibold" style={{ color }}>
            R$ {monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Faturamento (Total)</span>
          <span className="text-lg font-semibold">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
