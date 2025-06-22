"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// Types for drift data
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
  data: DriftData;
  thresholdPercent?: number;
  type?: 'sector' | 'asset-class' | 'overall';
}

export const DriftVisualization: React.FC<DriftVisualizationProps> = ({
  data,
  thresholdPercent = 5,
  type = 'overall',
}) => {
  const [driftView, setDriftView] = useState<'absolute' | 'relative'>('absolute');
  
  // Sort items by drift amount (highest to lowest) and filter out Overall Allocation
  const sortedItems = useMemo(() => {
    return [...data.items]
      .filter(item => item.name !== 'Overall Allocation') // Remove Overall Allocation row
      .sort((a, b) => {
        const driftA = driftView === 'absolute' ? Math.abs(a.absoluteDrift) : Math.abs(a.relativeDrift);
        const driftB = driftView === 'absolute' ? Math.abs(b.absoluteDrift) : Math.abs(b.relativeDrift);
        return driftB - driftA;
      });
  }, [data.items, driftView]);

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
      return data.totalAbsoluteDrift;
    } else {
      // Calculate relative total drift based on individual items
      // This is an approximation - in real scenarios you might want to get this from the API
      const totalTargetAllocation = data.items.reduce((sum, item) => sum + item.targetAllocation, 0);
      const weightedRelativeDrift = data.items
        .reduce((sum, item) => {
          const weight = item.targetAllocation / totalTargetAllocation;
          return sum + (Math.abs(item.relativeDrift) * weight);
        }, 0);
      return weightedRelativeDrift;
    }
  }, [data, driftView]);

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
            {data.portfolioName} - Last updated {new Date(data.lastUpdated).toLocaleString()}
          </CardDescription>
        </div>
        <Badge 
          variant={data.totalAbsoluteDrift > thresholdPercent ? 'destructive' : 'secondary'}
          className="text-xs font-medium"
        >
          {data.totalAbsoluteDrift.toFixed(2)}% Total Drift
          {data.totalAbsoluteDrift > thresholdPercent && (
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
              
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={5} side="top" align="end" className="max-w-sm p-4 z-50">
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
              </TooltipProvider>
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

  const renderDriftItems = (mode: 'absolute' | 'relative') => (
    <div className="space-y-3">
      {sortedItems.map((item) => {
        const driftValue = mode === 'absolute' ? item.absoluteDrift : item.relativeDrift;
        const driftFormatted = driftValue.toFixed(2);
        const exceededThreshold = Math.abs(driftValue) > thresholdPercent;
        const isOverallAllocation = item.name === 'Overall Allocation';
        
        return (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <div className="font-medium">
                {item.name}
                {isOverallAllocation && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (sum of category drifts)
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className={exceededThreshold ? 'text-red-600 font-medium' : ''}>
                  {driftFormatted}%
                </span>
                {getDriftIcon(driftValue)}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {/* Show target allocation on the left side */}
              <span className="whitespace-nowrap">Target: {item.targetAllocation.toFixed(1)}%</span>
              <div className="flex-1 relative h-6">
                {item.name === 'Overall Allocation' ? (
                  // Special visualization for Overall Allocation
                  <div className="h-full flex items-center justify-center">
                    <div className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded text-xs">
                      Both target and current = 100%, but individual categories are drifting by {item.absoluteDrift.toFixed(1)}% total
                    </div>
                  </div>
                ) : (
                  // Regular visualization for other items
                  <>
                    <div className="absolute h-1.5 bg-gray-200 w-full top-1/2 -translate-y-1/2"></div>
                    <div 
                      className={`absolute h-2.5 rounded-full ${getDriftColor(driftValue)} top-1/2 -translate-y-1/2`} 
                      style={{ 
                        left: `${Math.min(Math.max(0, item.targetAllocation), 100)}%`,
                        width: `${Math.abs(item.currentAllocation - item.targetAllocation)}%`,
                        transform: `translateX(${driftValue < 0 ? '-100%' : '0'}) translateY(-50%)` 
                      }}
                    ></div>
                  </>
                )}
              </div>
              <span className="whitespace-nowrap">Current: {item.currentAllocation.toFixed(1)}%</span>
              
              <div className="flex items-center">
                <ArrowRight size={12} />
                <span className={exceededThreshold ? 'font-medium text-red-600' : ''}>
                  {Math.abs(item.currentAllocation - item.targetAllocation).toFixed(1)}% {driftValue < 0 ? 'under' : 'over'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTotalDrift = () => {
    // Use a wider range (0-25%) for the total portfolio drift visualization
    const maxDriftRange = 25; // Show up to 25% drift range
    const progressPercentage = (totalDrift / maxDriftRange) * 100;
    
    return (
      <div className="mt-6 pt-4 border-t">
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Total Portfolio Drift</span>
            <span className="text-xs text-muted-foreground">
              {driftView === 'absolute' ? 'Absolute' : 'Relative'} drift
            </span>
          </div>
          
          <div className="relative">
            {/* Progress bar */}
            <Progress 
              value={progressPercentage} 
              className={getDriftColor(totalDrift)}
              max={100}
            />
            
            {/* Value indicator that aligns with the actual drift percentage */}
            <div 
              className="absolute bottom-full mb-1"
              style={{ 
                left: `${Math.min(progressPercentage, 98)}%`, 
                transform: 'translateX(-50%)'
              }}
            >
              <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${getDriftColor(totalDrift)} text-white`}>
                {totalDrift.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>{maxDriftRange}%</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      {renderHeader()}
      <CardContent>
        {renderDriftTabs()}
        {renderTotalDrift()}
      </CardContent>
    </Card>
  );
};

export default DriftVisualization;
