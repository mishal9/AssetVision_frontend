'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { AssetAllocation } from '@/types/portfolio';
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
interface TooltipPayload {
  name: string;
  value: number;
  payload: {
    category: string;
    percentage: number;
    value: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
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
interface LegendPayload {
  value: string;
  color: string;
}

interface CustomLegendProps {
  payload?: LegendPayload[];
}

const CustomLegend = ({ payload }: CustomLegendProps) => {
  return null; // Disable the built-in legend as we'll use our custom list below
};

// Color palette for the pie chart sectors with more distinct colors
const COLORS = [
  '#000000', // Black for Consumer Cyclical (largest sector)
  '#3b82f6', // Blue for Technology
  '#8b5cf6', // Violet for Utilities
  '#ec4899', // Pink for Consumer Defensive
  '#f97316', // Orange for Other
  '#84cc16', // Lime for Healthcare
  '#06b6d4', // Cyan for Communication Services
  '#ef4444', // Red for Energy
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#a3e635', // Lime-400
  '#fbbf24', // Amber-400
];

/**
 * Sector Allocation Chart Component
 * Displays portfolio sector allocation as a pie chart
 */
export function SectorAllocationChart({ data, className }: SectorAllocationChartProps) {
  // Ensure we have valid data to work with
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No allocation data available</p>
      </div>
    );
  }
  
  // Format data for chart display
  const chartData = data.map(item => ({
    name: item.category, // Use category for display name
    category: item.category,
    value: parseFloat((item.value || 0).toString()), // Ensure value is a number
    percentage: parseFloat((item.percentage || 0).toString()) // Ensure percentage is a number
  }));
  
  // If no valid data after parsing, show empty state
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No allocation data available</p>
      </div>
    );
  }
  
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
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-64">
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
                paddingAngle={1}
                cornerRadius={0}
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
        </div>
        
        <div className="w-full md:w-1/2 md:pl-6 mt-4 md:mt-0">
          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
            {chartData.map((item, index) => (
              <div key={`legend-${item.category}-${index}`} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-2 rounded-sm" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
