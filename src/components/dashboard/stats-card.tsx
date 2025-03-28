interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <div className="rounded-xl bg-[hsl(var(--card))] p-6 shadow-sm border border-[hsl(var(--border))]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
        {icon && <div className="text-[hsl(var(--muted-foreground))]">{icon}</div>}
      </div>
      <div className="mt-3">
        <h2 className="text-2xl font-bold">{value}</h2>
        {change && (
          <p className="text-sm text-muted-foreground mt-1">
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
