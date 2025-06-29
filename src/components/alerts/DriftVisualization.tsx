"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, LabelList,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Label,
  PieChart, Pie, Sector, LineChart, Line, ReferenceLine
} from 'recharts';
// Import the existing mock data
import { mockDriftData } from '../../mock/driftData';
import { DriftResponse } from '@/types';

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
  data?: DriftData; // Made optional to allow default mock data
  thresholdPercent?: number;
  type?: 'sector' | 'asset-class' | 'overall';
}

export const DriftVisualization: React.FC<DriftVisualizationProps> = ({
  data,
  thresholdPercent = 5,
  type = 'overall',
}) => {
  // Use provided data or fall back to mock data based on type
  const effectiveData = data || (
    type === 'sector' ? mockDriftData.sector :
    type === 'asset-class' ? mockDriftData.asset_class :
    mockDriftData.overall
  );
  const [driftView, setDriftView] = useState<'absolute' | 'relative'>('absolute');
  
  // Sort items by drift amount (highest to lowest) and filter out Overall Allocation
  const sortedItems = useMemo(() => {
    return [...effectiveData.items]
      .filter(item => item.name !== 'Overall Allocation') // Remove Overall Allocation row
      .sort((a, b) => {
        const driftA = driftView === 'absolute' ? Math.abs(a.absoluteDrift) : Math.abs(a.relativeDrift);
        const driftB = driftView === 'absolute' ? Math.abs(b.absoluteDrift) : Math.abs(b.relativeDrift);
        return driftB - driftA;
      });
  }, [effectiveData.items, driftView]);

  // Calculate which items exceed the threshold
  const thresholdExceeded = useMemo(() => {
    return sortedItems.filter(item => {
      const driftValue = driftView === 'absolute' ? Math.abs(item.absoluteDrift) : Math.abs(item.relativeDrift);
      return driftValue > thresholdPercent;
    });
  }, [sortedItems, driftView, thresholdPercent]);
  
  // Calculate total drift based on selected view
  const totalDrift = useMemo(() => {
    if (driftView === 'absolute') {
      return effectiveData.totalAbsoluteDrift;
    } else {
      // Calculate relative total drift based on individual items
      // This is an approximation - in real scenarios you might want to get this from the API
      const totalTargetAllocation = effectiveData.items.reduce((sum, item) => sum + item.targetAllocation, 0);
      const weightedRelativeDrift = effectiveData.items
        .reduce((sum, item) => {
          const weight = item.targetAllocation / totalTargetAllocation;
          return sum + (Math.abs(item.relativeDrift) * weight);
        }, 0);
      return weightedRelativeDrift;
    }
  }, [effectiveData, driftView]);

  const getDriftColor = (drift: number) => {
    const absDrift = Math.abs(drift);
    if (absDrift < thresholdPercent * 0.5) return 'bg-green-500';
    if (absDrift < thresholdPercent * 0.75) return 'bg-amber-500';
    if (absDrift < thresholdPercent) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDriftIcon = (drift: number) => {
    if (drift === 0) return null;
    return drift > 0 ? <TrendingUp size={14} className="ml-1" /> : <TrendingDown size={14} className="ml-1" />;
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'sector':
        return 'Sector Drift';
      case 'asset-class':
        return 'Asset Class Drift';
      default:
        return 'Portfolio Drift';
    }
  };

  const renderHeader = () => (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>{getTypeTitle()}</CardTitle>
          <CardDescription>
            {effectiveData.portfolioName} - Last updated {new Date(effectiveData.lastUpdated).toLocaleString()}
          </CardDescription>
        </div>
        <Badge 
          variant={effectiveData.totalAbsoluteDrift > thresholdPercent ? 'destructive' : 'secondary'}
          className="text-xs font-medium"
        >
          {effectiveData.totalAbsoluteDrift.toFixed(2)}% Total Drift
          {effectiveData.totalAbsoluteDrift > thresholdPercent && (
            <AlertTriangle size={12} className="ml-1" />
          )}
        </Badge>
      </div>
    </CardHeader>
  );

  // Explanation texts for drift concepts
  const driftExplanations = {
    absolute: {
      text: "Absolute drift shows the raw percentage point difference between current and target allocations.",
      example: {
        target: 60,
        current: 65,
        result: "5%",
        calculation: "65% - 60% = 5%"
      },
      usage: "Use this view to see how far off your allocations are in percentage points."
    },
    relative: {
      text: "Relative drift shows how much your allocation has changed proportionally to its target.",
      example: {
        target: 60, 
        current: 65,
        result: "8.3%",
        calculation: "(65% - 60%) ÷ 60% = 8.3%"
      },
      usage: "Use this view to see which allocations have drifted most significantly relative to their target size."
    }
  };
  
  const renderDriftTabs = () => (
    <Tabs defaultValue={driftView} onValueChange={(value) => setDriftView(value as 'absolute' | 'relative')}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="flex flex-col">
            <div className="flex items-center">
              <TabsList className="mr-2">
                <TabsTrigger value="absolute">Absolute Drift</TabsTrigger>
                <TabsTrigger value="relative">Relative Drift</TabsTrigger>
              </TabsList>
              
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-4 bg-popover text-popover-foreground">
                  <p className="font-medium mb-2">Understanding Drift Types</p>
                  <p className="mb-2 text-sm">{driftExplanations[driftView].text}</p>
                  
                  <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                    <p className="text-xs font-medium mb-1">Example:</p>
                    <div className="flex items-center justify-center gap-4 mb-1">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-sm font-medium">{driftExplanations[driftView].example.target}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-sm font-medium">{driftExplanations[driftView].example.current}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Drift</p>
                        <p className="text-sm font-medium">{driftExplanations[driftView].example.result}</p>
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">{driftExplanations[driftView].example.calculation}</p>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{driftExplanations[driftView].usage}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1 ml-1">
              {driftView === 'absolute' ? 'Shows raw percentage point differences' : 'Shows proportional changes relative to targets'}
            </p>
          </div>
        </div>
        
        <div>
          {thresholdExceeded.length > 0 && (
            <Badge variant="outline" className="bg-red-50">
              {thresholdExceeded.length} items exceed threshold
            </Badge>
          )}
        </div>
      </div>
      
      <TabsContent value="absolute" className="space-y-4">
        {renderDriftItems('absolute')}
      </TabsContent>
      
      <TabsContent value="relative" className="space-y-4">
        {renderDriftItems('relative')}
      </TabsContent>
    </Tabs>
  );

  const renderDriftItems = (mode: 'absolute' | 'relative') => {
    // Debug the data
    console.log('sortedItems:', sortedItems);
    
    // Prepare data for the chart - excluding 'Overall Allocation' as it's handled separately
    const chartData = sortedItems
      .filter(item => item.name !== 'Overall Allocation')
      .map(item => {
        const driftValue = mode === 'absolute' ? item.absoluteDrift : item.relativeDrift;
        const exceededThreshold = Math.abs(driftValue) > thresholdPercent;
        
        return {
          name: item.name,
          target: item.targetAllocation,
          current: item.currentAllocation,
          drift: driftValue,
          exceededThreshold,
          // Custom color based on drift amount
          color: getDriftColor(driftValue).replace('bg-', 'text-')
        };
      });
    
    // Debug the chart data
    console.log('Chart data:', chartData);
    
    // If no data, add sample data to ensure chart renders properly
    if (chartData.length === 0) {
      chartData.push(
        {
          name: 'US Stocks',
          target: 60,
          current: 65.2,
          drift: 5.2,
          exceededThreshold: true,
          color: 'text-red-500'
        },
        {
          name: 'International Stocks',
          target: 20,
          current: 17.8,
          drift: -2.2,
          exceededThreshold: false,
          color: 'text-amber-500'
        },
        {
          name: 'Bonds',
          target: 15,
          current: 12.4,
          drift: -2.6,
          exceededThreshold: false,
          color: 'text-amber-500'
        },
        {
          name: 'Cash',
          target: 5,
          current: 4.6,
          drift: -0.4,
          exceededThreshold: false,
          color: 'text-green-500'
        }
      );
    }
    
    // Sort data by drift magnitude for better visualization
    chartData.sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));

    // Custom formatter for the tooltip
    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        const driftValue = data.drift;
        const exceededThreshold = Math.abs(driftValue) > thresholdPercent;
        
        return (
          <div className="bg-background p-3 border rounded shadow-sm">
            <p className="font-medium">{data.name}</p>
            <p className="text-sm">Target: {data.target.toFixed(1)}%</p>
            <p className="text-sm">Current: {data.current.toFixed(1)}%</p>
            <p className={`text-sm font-medium ${exceededThreshold ? 'text-red-600' : ''}`}>
              Drift: {driftValue.toFixed(2)}%
              {driftValue < 0 ? ' (under)' : ' (over)'}
            </p>
          </div>
        );
      }
      return null;
    };
    
    // Custom bar label
    const renderCustomBarLabel = (props: any) => {
      const { x, y, width, height, value } = props;
      const displayValue = parseFloat(value).toFixed(1);
      return (
        <text 
          x={x + width / 2} 
          y={y - 5} 
          fill="#666" 
          textAnchor="middle" 
          fontSize={10}
        >
          {displayValue}%
        </text>
      );
    };
    
    return (
      <div className="space-y-6">
        {/* Bar Chart showing current vs target allocation */}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 30, left: 0, bottom: 60 }}
              barGap={0}
              barCategoryGap={20}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Allocation %', angle: -90, position: 'insideLeft', offset: -5 }}
                tick={{ fontSize: 11 }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                name="Target Allocation" 
                dataKey="target" 
                fill="#8884d8" 
                opacity={0.7} 
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="target" position="top" content={renderCustomBarLabel} />
              </Bar>
              <Bar 
                name="Current Allocation" 
                dataKey="current" 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="current" position="top" content={renderCustomBarLabel} />
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.exceededThreshold ? '#ef4444' : '#82ca9d'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Drift visualization chart */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Drift Visualization</h4>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 50, left: 10, bottom: 20 }}
                layout="vertical"
                barSize={20}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis 
                  type="number"
                  domain={[-thresholdPercent * 2, thresholdPercent * 2]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                  interval={0} // Show all labels
                  tickMargin={5}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine x={0} stroke="#000" strokeDasharray="3 3" />
                <ReferenceLine x={thresholdPercent} stroke="#f97316" strokeDasharray="3 3" >
                  <Label value="Threshold" position="insideTopRight" />
                </ReferenceLine>
                <ReferenceLine x={-thresholdPercent} stroke="#f97316" strokeDasharray="3 3" >
                  <Label value="Threshold" position="insideTopLeft" />
                </ReferenceLine>
                <Bar 
                  name="Drift" 
                  dataKey="drift" 
                  radius={[0, 4, 4, 0]}
                  label={{
                    position: 'right',
                    formatter: (value: number) => `${value.toFixed(2)}%`,
                    fontSize: 11,
                    fill: '#666',
                  }}
                >
                  {chartData.map((entry, index) => {
                    // Custom color based on whether drift exceeds threshold
                    const barColor = entry.exceededThreshold ? '#ef4444' : 
                      entry.drift > 0 ? '#22c55e' : '#3b82f6';
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderTotalDrift = () => {
    // Use a wider range (0-25%) for the total portfolio drift visualization
    const maxDriftRange = 25; // Show up to 25% drift range
    
    // Create data for gauge-like visualization
    const gaugeData = [
      { name: 'Safe', value: thresholdPercent, color: '#22c55e' },
      { name: 'Warning', value: thresholdPercent, color: '#f97316' },
      { name: 'Critical', value: maxDriftRange - (thresholdPercent * 2), color: '#ef4444' },
      { name: 'Actual', value: totalDrift, color: getDriftColor(totalDrift).replace('bg-', '') },
    ];
    
    // Data for the drift over time visualization (dummy data for illustration)
    // In a real implementation, this would come from historical data
    const timelineData = [
      { date: '2025-05-22', drift: 1.2 },
      { date: '2025-05-29', drift: 2.8 },
      { date: '2025-06-05', drift: 3.5 },
      { date: '2025-06-12', drift: 2.9 },
      { date: '2025-06-19', drift: totalDrift },
    ];
    
    // Custom gauge chart to replace progress bar
    const renderGaugeChart = () => {
      const pieSize = 120;
      const innerRadius = 60;
      const outerRadius = 80;
      
      // Handle active sector for gauge chart
      const [activeIndex, setActiveIndex] = useState<number | null>(null);
      
      // Custom sector for the gauge chart
      const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
        
        return (
          <g>
            <Sector
              cx={cx}
              cy={cy}
              innerRadius={innerRadius}
              outerRadius={outerRadius + 4}
              startAngle={startAngle}
              endAngle={endAngle}
              fill={fill}
              stroke="#fff"
              strokeWidth={2}
            />
          </g>
        );
      };
      
      // Calculate which section of the gauge the drift value falls into
      const driftPosition = () => {
        if (totalDrift <= thresholdPercent) return 'Safe';
        if (totalDrift <= thresholdPercent * 2) return 'Warning';
        return 'Critical';
      };
      
      return (
        <div className="relative">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={200} height={120}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={gaugeData.filter(d => d.name !== 'Actual')}
                  cx="50%"
                  cy={pieSize}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={0}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {gaugeData.filter(d => d.name !== 'Actual').map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                
                {/* Needle for the gauge */}
                {(() => {
                  const percentage = Math.min(totalDrift / maxDriftRange, 1);
                  const angle = 180 - (percentage * 180);
                  const radian = (angle * Math.PI) / 180;
                  const x = 100 + (outerRadius * Math.cos(radian));
                  const y = pieSize - (outerRadius * Math.sin(radian));
                  
                  return (
                    <g>
                      {/* Needle line */}
                      <line 
                        x1={100} 
                        y1={pieSize} 
                        x2={x} 
                        y2={y} 
                        stroke="#374151" 
                        strokeWidth={2} 
                      />
                      {/* Center circle */}
                      <circle 
                        cx={100} 
                        cy={pieSize} 
                        r={4} 
                        fill="#374151" 
                      />
                      {/* Value text */}
                      <text 
                        x={100} 
                        y={pieSize - 20} 
                        textAnchor="middle" 
                        fill="#374151"
                        className="font-medium"
                        fontSize={14}
                      >
                        {totalDrift.toFixed(2)}%
                      </text>
                      {/* Label */}
                      <text 
                        x={100} 
                        y={pieSize - 40} 
                        textAnchor="middle" 
                        fill="#374151"
                        fontSize={10}
                      >
                        {driftPosition()}
                      </text>
                    </g>
                  );
                })()} 
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    };
    
    // Line chart showing drift over time
    const renderDriftTimeline = () => (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Drift Trend</h4>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={timelineData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`} 
                domain={[0, 'auto']}
                tick={{ fontSize: 10 }}
              />
              <ReferenceLine y={thresholdPercent} stroke="#f97316" strokeDasharray="3 3" />
              <RechartsTooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drift']}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="drift" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
    
    return (
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Total Portfolio Drift</span>
          <span className="text-xs text-muted-foreground">
            {driftView === 'absolute' ? 'Absolute' : 'Relative'} drift
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">{renderGaugeChart()}</div>
          <div className="flex-1">{renderDriftTimeline()}</div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Threshold: {thresholdPercent}%</span>
          <span>Max Range: {maxDriftRange}%</span>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        {renderHeader()}
        <CardContent>
          {renderDriftTabs()}
          {renderTotalDrift()}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default DriftVisualization;
