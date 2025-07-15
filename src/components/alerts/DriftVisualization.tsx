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
  
  // DEBUG: Log drift bar data preparation
  console.log('DriftVisualization drift bar data:', {
    itemsCount: effectiveData.items?.length || 0,
    items: effectiveData.items
  });
  
  // Verify the data structure has what we need
  if (data?.items) {
    console.log('Items with drift values:', data.items.map(item => ({
      name: item.name,
      currentAllocation: item.currentAllocation,
      targetAllocation: item.targetAllocation,
      absoluteDrift: item.absoluteDrift,
      relativeDrift: item.relativeDrift
    })));
    
    console.log('Total absolute drift for', type, ':', data.totalAbsoluteDrift);
    
    // Calculate expected total drift for comparison
    const calculatedTotal = data.items.reduce((sum, item) => sum + Math.abs(item.absoluteDrift || 0), 0);
    console.log('Calculated total drift:', calculatedTotal);
    
    if (Math.abs(calculatedTotal - (data.totalAbsoluteDrift || 0)) > 0.01) {
      console.warn('Total drift mismatch! API says:', data.totalAbsoluteDrift, 'but calculated:', calculatedTotal);
    }
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
      console.log('No processed items for drift bar chart');
      return [];
    }

    const barData = processedItems.map((item: any) => ({
      name: item.name,
      drift: driftView === 'absolute' ? item.absoluteDrift : item.relativeDrift,
      color: item.absoluteDrift > 0 ? '#ef4444' : '#22c55e'
    }));
    
    console.log('Drift bar data:', barData);
    console.log('Drift view:', driftView);
    console.log('Non-zero drift values:', barData.filter(item => item.drift !== 0));
    console.log('Drift value range:', {
      min: Math.min(...barData.map(item => item.drift)),
      max: Math.max(...barData.map(item => item.drift))
    });
    console.log('About to render chart with', barData.length, 'items');
    
    return barData;
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
      {/* Tabs for different views */}
      <Tabs value={driftView} onValueChange={(value) => setDriftView(value as 'absolute' | 'relative')}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="absolute">Absolute Drift</TabsTrigger>
            <TabsTrigger value="relative">Relative Drift</TabsTrigger>
          </TabsList>
          {/* Removed inline drift explanation text */}
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
      <div className="mt-6">
        <Card className="p-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sector Allocation Overview</CardTitle>
            <CardDescription>
              Complete view of all sectors with drift indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div className="col-span-3">Sector</div>
                <div className="col-span-2 text-right">Target</div>
                <div className="col-span-2 text-right">Current</div>
                <div className="col-span-3">Allocation Bar</div>
                <div className="col-span-2 text-right">Drift</div>
              </div>
              
              {/* Data rows */}
              {processedItems
                .sort((a: any, b: any) => Math.abs(b.absoluteDrift) - Math.abs(a.absoluteDrift))
                .map((item: any, index) => {
                  const driftValue = driftView === 'absolute' ? item.absoluteDrift : item.relativeDrift;
                  const isSignificantDrift = Math.abs(item.absoluteDrift) > thresholdPercent;
                  
                  return (
                    <div 
                      key={index} 
                      className={`grid grid-cols-12 gap-4 text-sm py-3 border-b border-border/50 last:border-b-0 ${
                        isSignificantDrift ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Sector Name */}
                      <div className="col-span-3 font-medium">
                        {item.name}
                      </div>
                      
                      {/* Target */}
                      <div className="col-span-2 text-right text-muted-foreground">
                        {item.targetAllocation.toFixed(1)}%
                      </div>
                      
                      {/* Current */}
                      <div className="col-span-2 text-right">
                        {item.currentAllocation.toFixed(1)}%
                      </div>
                      
                      {/* Visual Bar */}
                      <div className="col-span-3 flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 relative">
                          {/* Target line */}
                          {item.targetAllocation > 0 && (
                            <div 
                              className="absolute top-0 w-0.5 h-2 bg-gray-400 rounded-full"
                              style={{ left: `${Math.min(item.targetAllocation, 100)}%` }}
                            />
                          )}
                          {/* Current allocation bar */}
                          {item.currentAllocation > 0 && (
                            <div 
                              className={`h-2 rounded-full ${
                                item.absoluteDrift > 0 ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(item.currentAllocation, 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Drift Value with Better Contrast */}
                      <div className="col-span-2 text-right">
                        <span 
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            Math.abs(item.absoluteDrift) <= thresholdPercent 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : Math.abs(item.absoluteDrift) <= thresholdPercent * 2 
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {formatDriftValue(driftValue)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-gray-400 rounded-full"></div>
                  <span>Target allocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-green-500 rounded-full"></div>
                  <span>Under-allocated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-red-500 rounded-full"></div>
                  <span>Over-allocated</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
  
  // Color palette for sectors
  const sectorColors = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280', // Gray
    '#14b8a6', // Teal
    '#a855f7', // Purple
  ];

  // Prepare data for portfolio composition pie chart
  const compositionData = chartData
    .filter(item => item.current > 0)
    .map((item, index) => ({
      name: item.name,
      value: item.current,
      color: sectorColors[index % sectorColors.length]
    }));
  
  // Prepare data for target allocation pie chart
  const targetAllocationData = chartData
    .filter(item => item.target > 0)
    .map((item, index) => ({
      name: item.name,
      value: item.target,
      color: sectorColors[index % sectorColors.length]
    }));

  // Prepare data for sector drift ranking
  const driftRankingData = driftBarData
    .filter(item => item.drift !== 0) // Only show sectors with actual drift
    .sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift))
    .slice(0, 8) // Top 8 sectors with highest drift
    .map(item => ({
      ...item,
      color: item.drift > 0 ? '#ef4444' : item.drift < 0 ? '#10b981' : '#94a3b8'
    }));

  // DEBUG: Log drift ranking data
  console.log('Drift ranking data:', {
    originalData: driftBarData,
    filteredData: driftBarData.filter(item => item.drift !== 0),
    finalData: driftRankingData
  });

  // Calculate dynamic domain for the chart
  const driftValues = driftRankingData.map(item => item.drift);
  
  let chartDomain: number[];
  let minDrift: number;
  let maxDrift: number;
  
  if (driftValues.length === 0) {
    // Fallback domain if no data
    chartDomain = [-10, 10];
    minDrift = -10;
    maxDrift = 10;
  } else {
    minDrift = Math.min(...driftValues);
    maxDrift = Math.max(...driftValues);
    const dataRange = maxDrift - minDrift;
    
    // Calculate dynamic padding (10% of data range, minimum 2%)
    const paddingPercent = Math.max(dataRange * 0.1, 2);
    
    // Ensure threshold lines (±5%) are always visible
    const domainMin = Math.min(minDrift - paddingPercent, -5 - 2);
    const domainMax = Math.max(maxDrift + paddingPercent, 5 + 2);
    
    // Round to nice numbers for cleaner display
    const roundedMin = Math.floor(domainMin / 5) * 5;
    const roundedMax = Math.ceil(domainMax / 5) * 5;
    
    chartDomain = [roundedMin, roundedMax];
  }

  // DEBUG: Log specific values for chart
  console.log('Chart data details:', {
    hasData: driftRankingData.length > 0,
    dataLength: driftRankingData.length,
    allValues: driftRankingData.map(item => ({
      name: item.name,
      drift: item.drift,
      color: item.color,
      driftType: typeof item.drift
    })),
    dataRange: {
      min: minDrift,
      max: maxDrift
    },
    calculatedDomain: chartDomain,
    domainLogic: {
      originalRange: maxDrift - minDrift,
      paddingUsed: driftValues.length > 0 ? Math.max((maxDrift - minDrift) * 0.1, 2) : 0,
      thresholdEnsured: "±5% always visible"
    }
  });

  // DEBUG: Log the exact data being passed to BarChart
  console.log('BarChart data:', driftRankingData);
  console.log('BarChart sample:', driftRankingData.slice(0, 2));
  console.log('Chart rendering check:', {
    hasData: driftRankingData.length > 0,
    firstItem: driftRankingData[0],
    driftValues: driftRankingData.map(item => item.drift)
  });

  return (
    <div className="space-y-6">
      {/* First row - Two main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Portfolio Composition Chart */}
      <Card className="p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Current Portfolio Composition</CardTitle>
          <CardDescription>
            Breakdown of current holdings by sector
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`comp-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number, _name: string, info: any) => [`${value.toFixed(1)}%`, info.payload.name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value: string, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value}: {entry.payload.value.toFixed(1)}%
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

            {/* Target Allocation Chart */}
      <Card className="p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Target Allocation</CardTitle>
          <CardDescription>
            Your desired portfolio allocation by sector
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                >
                  {targetAllocationData.map((entry, index) => (
                    <Cell key={`tgt-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number, _name: string, info: any) => [`${value.toFixed(1)}%`, info.payload.name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value: string, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value}: {entry.payload.value.toFixed(1)}%
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>


      </div>
      
      {/* Second row - Ranking chart */}
      <div className="grid grid-cols-1">
        {/* Sector Drift Ranking Chart */}
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Highest Drift Sectors</CardTitle>
            <CardDescription>
              Sectors ranked by drift magnitude
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {driftRankingData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <BarChart2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No drift data available</p>
                </div>
              </div>
            ) : (
              <div className="h-64" style={{ minHeight: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={driftRankingData} 
                    layout="vertical" // horizontal bars
                    margin={{ left: 140, right: 40, top: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatDriftValue(value)}
                      domain={[-50, 50]}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      width={140}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [formatDriftValue(value), 'Drift']}
                    />
                    {/* Zero line */}
                    <ReferenceLine x={0} stroke="#666" strokeDasharray="2 2" strokeWidth={1} />
                    {/* Threshold lines at ±5% */}
                    <ReferenceLine x={5} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} />
                    <ReferenceLine x={-5} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} />
                    <Bar 
                      dataKey="drift" 
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriftVisualization;
