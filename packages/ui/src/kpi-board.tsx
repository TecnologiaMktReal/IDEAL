import { TrendingUp } from "lucide-react";
import { cn } from "./lib/utils";

interface KpiItem {
  code: string;
  name: string;
  currentValue: number;
  targetValue: number;
  prefix?: string;
  suffix?: string;
}

interface KpiBoardProps {
  kpis: KpiItem[];
}

export function KpiBoard({ kpis }: KpiBoardProps) {
  return (
    <section aria-label="KPI board" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const progress = Math.min(100, (kpi.currentValue / kpi.targetValue) * 100);
          
          return (
            <article
              key={kpi.code}
              className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-mkt-primary/10 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-semibold text-mkt-primary/70">{kpi.name}</span>
                <div className="p-2 bg-mkt-accent/10 rounded-lg text-mkt-accent">
                  <TrendingUp size={16} />
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-black text-mkt-dark">
                  {kpi.prefix}{kpi.currentValue}{kpi.suffix}
                </span>
                <span className="text-xs text-mkt-primary/50 font-medium">
                  meta: {kpi.prefix}{kpi.targetValue}{kpi.suffix}
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-mkt-primary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-mkt-accent transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

