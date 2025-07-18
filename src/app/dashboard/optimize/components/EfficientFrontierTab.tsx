import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { OptimizationResults } from '@/store/optimizationSlice';

interface EfficientFrontierTabProps {
  results: OptimizationResults;
}

export function EfficientFrontierTab({ results }: EfficientFrontierTabProps) {
  const frontierData = results.efficientFrontier.map((point) => ({
    risk: point.risk,
    return: point.return,
    sharpe: point.sharpe,
  }));

  const optimizedPoint = {
    risk: results.scenarios[0].volatility,
    return: results.scenarios[0].expectedReturn,
    sharpe: results.scenarios[0].sharpeRatio,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Efficient Frontier</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number" dataKey="risk" name="Volatility" unit="%" />
            <YAxis type="number" dataKey="return" name="Expected Return" unit="%" />
            <ZAxis type="number" dataKey="sharpe" name="Sharpe Ratio" range={[100, 1000]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Efficient Frontier" data={frontierData} fill="#8884d8" shape="circle" />
            <Scatter name="Optimized Portfolio" data={[optimizedPoint]} fill="#82ca9d" shape="star" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 