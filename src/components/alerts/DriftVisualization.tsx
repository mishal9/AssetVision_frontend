"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

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
  
  // Sort items by drift amount (highest to lowest)
  const sortedItems = useMemo(() => {
    return [...data.items].sort((a, b) => {
      const driftA = driftView === 'absolute' ? Math.abs(a.absoluteDrift) : Math.abs(a.relativeDrift);
      const driftB = driftView === 'absolute' ? Math.abs(b.absoluteDrift) : Math.abs(b.relativeDrift);
      return driftB - driftA;
    });
  }, [data.items, driftView]);

  // Calculate which items exceed the threshold
  const thresholdExceeded = useMemo(() => {
    return sortedItems.filter(item => {
      const driftValue = driftView === 'absolute' 
        ? Math.abs(item.absoluteDrift) 
        : Math.abs(item.relativeDrift);
      return driftValue > thresholdPercent;
    });
  }, [sortedItems, thresholdPercent, driftView]);

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

  const renderDriftTabs = () => (
    <Tabs defaultValue={driftView} onValueChange={(value) => setDriftView(value as 'absolute' | 'relative')}>
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="absolute">Absolute Drift</TabsTrigger>
          <TabsTrigger value="relative">Relative Drift</TabsTrigger>
        </TabsList>
        {thresholdExceeded.length > 0 && (
          <Badge variant="outline" className="bg-red-50">
            {thresholdExceeded.length} items exceed threshold
          </Badge>
        )}
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
        
        return (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <div className="font-medium">{item.name}</div>
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
                <div className="absolute h-1.5 bg-gray-200 w-full top-1/2 -translate-y-1/2"></div>
                <div 
                  className={`absolute h-2.5 rounded-full ${getDriftColor(driftValue)} top-1/2 -translate-y-1/2`} 
                  style={{ 
                    left: `${Math.min(Math.max(0, item.targetAllocation), 100)}%`,
                    width: `${Math.abs(item.currentAllocation - item.targetAllocation)}%`,
                    transform: `translateX(${driftValue < 0 ? '-100%' : '0'}) translateY(-50%)` 
                  }}
                ></div>
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
    const progressPercentage = (data.totalAbsoluteDrift / maxDriftRange) * 100;
    
    return (
      <div className="mt-6 pt-4 border-t">
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Total Portfolio Drift</span>
          </div>
          
          <div className="relative">
            {/* Progress bar */}
            <Progress 
              value={progressPercentage} 
              className={getDriftColor(data.totalAbsoluteDrift)}
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
              <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${getDriftColor(data.totalAbsoluteDrift)} text-white`}>
                {data.totalAbsoluteDrift.toFixed(2)}%
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
