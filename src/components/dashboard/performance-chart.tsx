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
import { PerformanceData } from '@/types/portfolio';
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
  currentValue?: number; // Current portfolio value from summary
  currentPeriod: '1D' | '1W' | '1M' | '1Y' | '5Y' | 'all';
  onPeriodChange: (period: '1D' | '1W' | '1M' | '1Y' | '5Y') => Promise<void>;
  isLoading?: boolean;
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
export function PerformanceChart({ data, className, currentValue, currentPeriod, onPeriodChange, isLoading }: PerformanceChartProps) {
  // Use the period from props instead of local state
  const period = currentPeriod as TimePeriod;
  
  // Format data for chart display and ensure it's sorted chronologically
  const chartData = data
    .map(item => ({
      date: new Date(item.date).toISOString(),
      value: item.value
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Handle period change - call API to fetch new data
  const handlePeriodChange = async (newPeriod: TimePeriod) => {
    if (newPeriod === period) return; // Don't refetch if same period
    
    try {
      await onPeriodChange(newPeriod);
    } catch (error) {
      console.error('Error fetching performance data for period:', newPeriod, error);
    }
  };
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate min and max values for Y axis domain
  const values = chartData.map(item => item.value);
  let minValue = 0;
  let maxValue = 100;
  
  if (values.length > 0) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // If all values are identical, create a reasonable range
    if (min === max) {
      minValue = min * 0.98; // 2% below
      maxValue = max * 1.02; // 2% above
    } else {
      minValue = min * 0.95; // Add 5% padding below
      maxValue = max * 1.05; // Add 5% padding above
    }
  }
  
  // Calculate period-specific metrics
  const getPeriodMetrics = () => {
    if (chartData.length === 0) {
      return {
        startValue: 0,
        endValue: 0,
        change: 0,
        changePercent: 0,
        periodLabel: period
      };
    }

    const startValue = chartData[0].value;
    const endValue = chartData[chartData.length - 1].value;
    const change = endValue - startValue;
    const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;

    return {
      startValue,
      endValue,
      change,
      changePercent,
      periodLabel: period
    };
  };

  const metrics = getPeriodMetrics();

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex justify-between mb-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-sm text-muted-foreground">{metrics.periodLabel} Performance:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(metrics.endValue)}
              </span>
            </div>
            <div className="flex items-center">
              <span className={cn(
                "text-sm font-medium",
                metrics.change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {metrics.change >= 0 ? "+" : ""}{formatCurrency(metrics.change)}
              </span>
              <span className={cn(
                "ml-1 text-xs",
                metrics.change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                ({metrics.changePercent >= 0 ? "+" : ""}{metrics.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          {(['1D', '1W', '1M', '1Y', '5Y'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              disabled={isLoading}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all duration-200 font-medium",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                period === p 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
                isLoading && period !== p && "opacity-50 cursor-not-allowed",
                isLoading && period === p && "bg-primary/80 text-primary-foreground"
              )}
            >
              {isLoading && period === p ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>{p}</span>
                </div>
              ) : (
                p
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64 w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
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
                  } else if (period === '1W' || period === '1M') {
                    return d.toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  } else {
                    // For longer periods (1Y, 5Y), show month and year
                    return d.toLocaleDateString(undefined, { 
                      month: 'short', 
                      year: 'numeric' 
                    });
                  }
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
                strokeWidth={chartData.length === 1 ? 3 : 2}
                fillOpacity={chartData.length === 1 ? 0.3 : 1} 
                fill="url(#colorValue)"
                dot={chartData.length === 1 ? { fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 } : false}
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
