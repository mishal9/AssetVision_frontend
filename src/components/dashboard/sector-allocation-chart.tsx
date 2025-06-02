'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { AssetAllocation } from '@/services/api';
import { cn } from '@/lib/utils';

/**
 * Props for the SectorAllocationChart component
 */
interface SectorAllocationChartProps {
  data: AssetAllocation[];
  className?: string;
}

/**
 * Custom tooltip component for the sector allocation chart
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-sm">
        <p className="text-sm font-medium">{data.category}</p>
        <p className="text-sm text-primary">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
          }).format(data.value)}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.percentage.toFixed(1)}% of portfolio
        </p>
      </div>
    );
  }

  return null;
};

/**
 * Custom legend component for the sector allocation chart
 */
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs truncate">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Color palette for the pie chart sectors
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.4)',
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
];

/**
 * Sector Allocation Chart Component
 * Displays portfolio sector allocation as a pie chart
 */
export function SectorAllocationChart({ data, className }: SectorAllocationChartProps) {
  // Format data for chart display
  const chartData = data.map(item => ({
    category: item.category,
    value: item.value,
    percentage: item.percentage
  }));
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="hsl(var(--primary))"
                dataKey="value"
                nameKey="category"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No allocation data available</p>
          </div>
        )}
      </div>
      
      {chartData.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-2">
            {chartData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            {chartData.length > 5 && (
              <div className="text-xs text-muted-foreground text-right mt-1">
                +{chartData.length - 5} more sectors
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
