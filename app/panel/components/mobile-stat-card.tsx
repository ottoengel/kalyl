import { LucideIcon } from "lucide-react";

interface MobileStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
}

export function MobileStatCard({ title, value, subtitle, icon: Icon, color }: MobileStatCardProps) {
  return (
    <div className="relative overflow-hidden bg-card rounded-2xl border border-border p-6 hover:scale-[1.02] transition-transform duration-300">
      {/* Background gradient effect */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-4xl font-bold mb-1" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
