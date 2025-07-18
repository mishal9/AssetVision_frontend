import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OptimizationResults } from '@/store/optimizationSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface OptimizedPortfolioTabProps {
  results: OptimizationResults;
}

const MetricCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export function OptimizedPortfolioTab({ results }: OptimizedPortfolioTabProps) {
  const optimizedScenario = results.scenarios[0];

  const allocationData = optimizedScenario.allocation.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Optimized Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <MetricCard title="Expected Return" value={`${optimizedScenario.expectedReturn.toFixed(2)}%`} />
            <MetricCard title="Volatility" value={`${optimizedScenario.volatility.toFixed(2)}%`} />
            <MetricCard title="Sharpe Ratio" value={optimizedScenario.sharpeRatio.toFixed(2)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 