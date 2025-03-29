import { cn } from "@/utils";

/**
 * StatsCard component displays a metric with title, value, and optional change indicator
 * Used in dashboard to show key performance indicators
 */
interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ title, value, change, icon, className }: StatsCardProps) {
  // Determine if change is positive, negative or neutral
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');
  const isNeutral = !isPositive && !isNegative;
  
  return (
    <div className={cn(
      "rounded-xl bg-card p-6 shadow-sm border border-border",
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-3">
        <h2 className="text-2xl font-bold">{value}</h2>
        {change && (
          <p className={cn(
            "text-sm mt-1 flex items-center",
            isPositive && "text-green-600 dark:text-green-500",
            isNegative && "text-red-600 dark:text-red-500",
            isNeutral && "text-muted-foreground"
          )}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
