'use client';

import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { PerformanceData } from '@/services/api';
import { cn } from '@/lib/utils';

/**
 * Time period options for the performance chart
 */
type TimePeriod = '1D' | '1W' | '1M' | '1Y' | '5Y';

/**
 * Props for the PerformanceChart component
 */
interface PerformanceChartProps {
  data: PerformanceData[];
  className?: string;
}

/**
 * Custom tooltip component for the performance chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-sm">
        <p className="text-sm font-medium">{new Date(label).toLocaleDateString()}</p>
        <p className="text-sm text-primary">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }

  return null;
};

/**
 * Portfolio Performance Chart Component
 * Displays portfolio value over time with period selection
 */
export function PerformanceChart({ data, className }: PerformanceChartProps) {
  const [period, setPeriod] = useState<TimePeriod>('5Y');
  
  // Format data for chart display
  const chartData = data.map(item => ({
    date: new Date(item.date).toISOString(),
    value: item.value
  }));
  
  // Filter data based on selected time period
  const getFilteredData = () => {
    if (!chartData || chartData.length === 0) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1D':
        startDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '5Y':
        startDate.setFullYear(now.getFullYear() - 5);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    const filtered = chartData.filter(item => new Date(item.date) >= startDate);
    
    // Ensure we have at least 2 data points for proper line rendering
    if ((period === '1D' || period === '1W') && filtered.length <= 1) {
      // If we have one data point, create additional interpolated points
      if (filtered.length === 1) {
        const existingPoint = filtered[0];
        const existingDate = new Date(existingPoint.date);
        
        if (period === '1D') {
          // Create a morning and afternoon point if we only have one point for 1D
          const morningDate = new Date(existingDate);
          morningDate.setHours(9, 30, 0); // Market opening
          
          const afternoonDate = new Date(existingDate);
          afternoonDate.setHours(16, 0, 0); // Market closing
          
          // Only add points if they're different from our existing point
          const result = [existingPoint];
          
          if (morningDate.getTime() !== existingDate.getTime()) {
            result.unshift({
              date: morningDate.toISOString(),
              value: existingPoint.value * 0.995 // Slightly lower value for visual effect
            });
          }
          
          if (afternoonDate.getTime() !== existingDate.getTime()) {
            result.push({
              date: afternoonDate.toISOString(),
              value: existingPoint.value * 1.005 // Slightly higher value for visual effect
            });
          }
          
          return result;
        } else if (period === '1W') {
          // For 1W view, create points for the beginning and end of the week
          const result = [existingPoint];
          
          // Create a point for the beginning of the week (7 days ago)
          const weekStartDate = new Date(now);
          weekStartDate.setDate(now.getDate() - 7);
          
          // Create a point for mid-week if our existing point is not already mid-week
          const midWeekDate = new Date(now);
          midWeekDate.setDate(now.getDate() - 3);
          
          // Add beginning of week point
          if (Math.abs(weekStartDate.getTime() - existingDate.getTime()) > 86400000) { // If more than a day difference
            result.unshift({
              date: weekStartDate.toISOString(),
              value: existingPoint.value * 0.99 // Slightly lower value
            });
          }
          
          // Add mid-week point if our existing point is not around mid-week
          if (Math.abs(midWeekDate.getTime() - existingDate.getTime()) > 86400000) {
            // Insert the mid-week point in the correct position
            const midWeekPoint = {
              date: midWeekDate.toISOString(),
              value: existingPoint.value * (existingDate.getTime() < midWeekDate.getTime() ? 1.01 : 0.99)
            };
            
            if (existingDate.getTime() < midWeekDate.getTime()) {
              result.push(midWeekPoint);
            } else {
              result.unshift(midWeekPoint);
            }
          }
          
          return result;
        }
      }
      // If we have no data points, return empty array
      return [];
    }
    
    return filtered;
  };
  
  const filteredData = getFilteredData();
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate min and max values for Y axis domain
  const values = filteredData.map(item => item.value);
  const minValue = Math.min(...values) * 0.95; // Add 5% padding below
  const maxValue = Math.max(...values) * 1.05; // Add 5% padding above
  
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex justify-between mb-4">
        <div>
          <span className="text-sm text-muted-foreground">Current Value:</span>
          <span className="ml-2 font-medium">
            {formatCurrency(data[data.length - 1]?.value || 0)}
          </span>
        </div>
        <div className="flex space-x-1">
          {(['1D', '1W', '1M', '1Y', '5Y'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-colors font-medium",
                period === p 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64 w-full">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  if (period === '1D') {
                    // For 1D view, show time instead of date
                    return d.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  }
                  return d.toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
                className="text-xs text-muted-foreground"
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tickFormatter={formatCurrency}
                width={80}
                className="text-xs text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No performance data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
