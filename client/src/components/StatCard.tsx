import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export default function StatCard({ icon: Icon, value, label, trend }: StatCardProps) {
  return (
    <Card className="p-6 hover-elevate">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Icon className="h-8 w-8 text-primary" data-testid="icon-stat" />
          {trend && (
            <span 
              className={`text-sm font-medium ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              data-testid="text-trend"
            >
              {trend.value}
            </span>
          )}
        </div>
        <div>
          <div className="font-mono text-3xl font-bold" data-testid="text-value">{value}</div>
          <div className="text-sm uppercase tracking-wide text-muted-foreground mt-1" data-testid="text-label">
            {label}
          </div>
        </div>
      </div>
    </Card>
  );
}
