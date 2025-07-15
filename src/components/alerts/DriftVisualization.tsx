"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle, Info, BarChart2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, LabelList,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Label,
  PieChart, Pie, Sector, LineChart, Line, ReferenceLine
} from 'recharts';
import { DriftResponse } from '@/types/portfolio';
import { groupSectorItems } from '@/utils/sectorMapping';

/**
 * DriftVisualization Component
 * 
 * This component visualizes portfolio drift - the difference between the current allocation
 * and target allocation of assets in a portfolio. It shows:
 * 
 * 1. Comparison Bar Chart: Shows target vs. current allocation for each asset category
 * 2. Drift Visualization Chart: A horizontal bar chart showing how much each category has
 *    drifted from its target (positive values = over-allocated, negative = under-allocated)
 * 3. Gauge Chart: Shows the total portfolio drift against safe/warning/critical thresholds
 * 4. Drift Timeline: Displays how the total drift has changed over time
 * 
 * The component supports two views of drift:
 * - Absolute: Raw percentage point differences (e.g., 65% vs 60% = 5% drift)
 * - Relative: Percentage change relative to the target (e.g., 65% vs 60% = 8.3% drift)
 */

// Re-define DriftItem and DriftData interfaces to match our component needs
interface DriftItem {
  name: string;
  currentAllocation: number;
  targetAllocation: number;
  absoluteDrift: number; // Current - Target
  relativeDrift: number; // (Current - Target) / Target * 100
}

interface DriftData {
  portfolioId: string;
  portfolioName: string;
  lastUpdated: string;
  totalAbsoluteDrift: number;
  items: DriftItem[];
}

interface DriftVisualizationProps {
  data?: DriftData;
  thresholdPercent?: number;
  type: 'overall' | 'asset-class' | 'sector';
}

export const DriftVisualization: React.FC<DriftVisualizationProps> = ({
  data,
  thresholdPercent = 5,
  type = 'overall',
}) => {
  // Use provided data or empty structure if no data available
  const effectiveData = data || {
    portfolioId: '',
    portfolioName: 'No Data',
    lastUpdated: new Date().toISOString(),
    totalAbsoluteDrift: 0,
    items: []
  };
  
  // Log if we're missing data to help debugging
  if (!data) {
    console.warn(`Missing ${type} drift data - rendering empty state`);
  }
  
  // DEBUG: Log what data we're actually using
  console.log('DriftVisualization receiving data:', { 
    providedData: data, 
    effectiveData, 
    type 
  });
  
  // Verify the data structure has what we need
  if (data?.items) {
    console.log('Items with current allocations:', data.items.map(item => ({
      name: item.name,
      currentAllocation: item.currentAllocation,
      targetAllocation: item.targetAllocation
    })));
  }

  const [driftView, setDriftView] = useState<'absolute' | 'relative'>('absolute');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedSegment, setSelectedSegment] = useState<DriftItem | null>(null);

  // Process items for consolidated display (only group sectors, not asset classes)
  const processedItems = useMemo(() => {
    if (!effectiveData.items || effectiveData.items.length === 0) {
      return [];
    }
    
    // Only apply sector grouping for sector-type data
    if (type === 'sector') {
      return groupSectorItems(effectiveData.items);
    }
    
    // Return items as-is for asset-class and overall types
    return effectiveData.items;
  }, [effectiveData.items, type]);

  // Transform data for visualization
  const chartData = useMemo(() => {
    if (!processedItems.length) {
      return [];
    }

    return processedItems.map((item: any) => ({
      name: item.name,
      target: item.targetAllocation,
      current: item.currentAllocation,
      drift: driftView === 'absolute' ? item.absoluteDrift : item.relativeDrift,
      absoluteDrift: item.absoluteDrift,
      relativeDrift: item.relativeDrift,
      // Color based on drift direction and magnitude
      color: item.absoluteDrift > thresholdPercent ? '#ef4444' : 
             item.absoluteDrift < -thresholdPercent ? '#f59e0b' : 
             '#22c55e'
    }));
  }, [processedItems, driftView, thresholdPercent]);

  // Drift bar chart data (horizontal bars showing drift amounts)
  const driftBarData = useMemo(() => {
    if (!processedItems.length) {
      return [];
    }

    return processedItems.map((item: any) => ({
      name: item.name,
      drift: driftView === 'absolute' ? item.absoluteDrift : item.relativeDrift,
      color: item.absoluteDrift > 0 ? '#ef4444' : '#22c55e'
    }));
  }, [processedItems, driftView]);

  // Format drift value for display
  const formatDriftValue = (value: number) => {
    if (driftView === 'absolute') {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    } else {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    }
  };

  // Calculate risk level based on total drift
  const riskLevel = useMemo(() => {
    const totalDrift = effectiveData.totalAbsoluteDrift;
    if (totalDrift <= thresholdPercent) return 'low';
    if (totalDrift <= thresholdPercent * 2) return 'medium';
    return 'high';
  }, [effectiveData.totalAbsoluteDrift, thresholdPercent]);

  const riskColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444'
  };

  const riskLabels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk'
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Target:</span> {data.target?.toFixed(1)}%
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Current:</span> {data.current?.toFixed(1)}%
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Drift:</span> {formatDriftValue(data.drift)}
          </p>
        </div>
      );
    }
    return null;
  };

  // If no data available, show empty state
  if (!effectiveData.items || effectiveData.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No {type} data available</h3>
        <p className="text-muted-foreground">
          {type === 'overall' 
            ? 'Overall portfolio drift data is not available.'
            : `No ${type.replace('-', ' ')} drift data is available. Please ensure target allocations are defined.`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with overall drift summary */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {type === 'overall' ? 'Overall Portfolio' : 
             type === 'asset-class' ? 'Asset Class' : 'Sector'} Drift
          </h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(effectiveData.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={riskLevel === 'low' ? 'default' : riskLevel === 'medium' ? 'secondary' : 'destructive'}>
            {riskLabels[riskLevel]}
          </Badge>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: riskColors[riskLevel] }}>
              {effectiveData.totalAbsoluteDrift.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Total Drift</div>
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={driftView} onValueChange={(value) => setDriftView(value as 'absolute' | 'relative')}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="absolute">Absolute Drift</TabsTrigger>
            <TabsTrigger value="relative">Relative Drift</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>
              {driftView === 'absolute' 
                ? 'Percentage point difference from target'
                : 'Percentage change relative to target'
              }
            </span>
          </div>
        </div>

        <TabsContent value="absolute" className="mt-4">
          <DriftCharts 
            chartData={chartData} 
            driftBarData={driftBarData} 
            formatDriftValue={formatDriftValue}
            CustomTooltip={CustomTooltip}
            thresholdPercent={thresholdPercent}
          />
        </TabsContent>

        <TabsContent value="relative" className="mt-4">
          <DriftCharts 
            chartData={chartData} 
            driftBarData={driftBarData} 
            formatDriftValue={formatDriftValue}
            CustomTooltip={CustomTooltip}
            thresholdPercent={thresholdPercent}
          />
        </TabsContent>
      </Tabs>

      {/* Individual item details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedItems.map((item: any, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{item.name}</h4>
              <Badge variant={
                Math.abs(item.absoluteDrift) <= thresholdPercent ? 'default' : 
                Math.abs(item.absoluteDrift) <= thresholdPercent * 2 ? 'secondary' : 
                'destructive'
              }>
                {formatDriftValue(driftView === 'absolute' ? item.absoluteDrift : item.relativeDrift)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target:</span>
                <span>{item.targetAllocation.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current:</span>
                <span>{item.currentAllocation.toFixed(1)}%</span>
              </div>
              <Progress 
                value={item.currentAllocation} 
                className="h-2"
                style={{ 
                  '--progress-foreground': item.absoluteDrift > 0 ? '#ef4444' : '#22c55e' 
                } as React.CSSProperties}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Separate component for charts to keep the main component clean
const DriftCharts: React.FC<{
  chartData: any[];
  driftBarData: any[];
  formatDriftValue: (value: number) => string;
  CustomTooltip: any;
  thresholdPercent: number;
}> = ({ chartData, driftBarData, formatDriftValue, CustomTooltip, thresholdPercent }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Target vs Current Allocation Chart */}
      <Card className="p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Target vs Current Allocation</CardTitle>
          <CardDescription>
            Comparison of target allocation percentages with current holdings
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="target" fill="#94a3b8" name="Target" />
                <Bar dataKey="current" fill="#3b82f6" name="Current" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Drift Amount Chart */}
      <Card className="p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Drift Amount</CardTitle>
          <CardDescription>
            How much each category has drifted from its target allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driftBarData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [formatDriftValue(value), 'Drift']}
                />
                <ReferenceLine x={0} stroke="#666" strokeDasharray="2 2" />
                <ReferenceLine x={thresholdPercent} stroke="#ef4444" strokeDasharray="2 2" />
                <ReferenceLine x={-thresholdPercent} stroke="#ef4444" strokeDasharray="2 2" />
                <Bar dataKey="drift" fill="#3b82f6">
                  {driftBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriftVisualization;
