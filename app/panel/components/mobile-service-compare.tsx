interface ServiceCompareData {
  name: string;
  month: number;
  total: number;
  color: string;
}

interface MobileServiceCompareProps {
  data: ServiceCompareData[];
}

export function MobileServiceCompare({ data }: MobileServiceCompareProps) {
  const maxMonth = Math.max(...data.map(d => d.month));
  const maxTotal = Math.max(...data.map(d => d.total));

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-semibold mb-6">Comparativo de Serviços</h3>
      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.name}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Mês: <span className="font-bold" style={{ color: item.color }}>{item.month}</span>
                </span>
                <span className="text-muted-foreground">
                  Total: <span className="font-bold">{item.total}</span>
                </span>
              </div>
            </div>
            
            {/* Barra de progresso para o mês */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(item.month / maxMonth) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
              
              {/* Barra de progresso para o total */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 opacity-50"
                    style={{ 
                      width: `${(item.total / maxTotal) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Barra sólida = Mês</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary opacity-50" />
          <span>Barra clara = Total</span>
        </div>
      </div>
    </div>
  );
}
