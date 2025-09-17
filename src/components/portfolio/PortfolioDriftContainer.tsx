"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { usePortfolioDrift } from '@/hooks/usePortfolioDrift';
import DriftVisualization from '../alerts/DriftVisualization';
import TargetAllocationEditor from './TargetAllocationEditor';
import DriftAlertsSection from '../alerts/DriftAlertsSection';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, RefreshCw, PieChart, Settings } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

const PortfolioDriftContainer: React.FC = () => {
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  
  // Use optimized portfolio drift hook
  const {
    driftData,
    currentAllocations,
    assetClasses,
    sectors,
    driftLoading,
    assetClassesLoading,
    sectorsLoading,
    isInitialized,
    isInitializing,
    driftError,
    driftSetupRequired,
    driftSetupMessage,
    refresh,
    hasData
  } = usePortfolioDrift({
    autoLoad: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    enablePrefetch: true
  });
  
  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    refresh(true);
  }, [refresh]);
  
  // Memoized debug logging
  const debugData = useMemo(() => {
    if (driftData && !driftLoading) {
      console.log('Live API drift data:', JSON.stringify(driftData, null, 2));
      
      if (driftData.asset_class?.items && driftData.asset_class.items.length > 0) {
        console.log('Asset class data:', 
          driftData.asset_class.items.map(item => `${item.name}: ${item.currentAllocation}%`)
        );
      }
      
      if (driftData.sector?.items && driftData.sector.items.length > 0) {
        console.log('Sector data:', 
          driftData.sector.items.map(item => `${item.name}: ${item.currentAllocation}%`)
        );
      }
    }
    return driftData;
  }, [driftData, driftLoading]);

  // Handle loading state - show loading if we're loading OR if we're initializing OR if we haven't initialized yet
  if (driftLoading || isInitializing || !isInitialized) {
    console.log('🔄 PortfolioDriftContainer: Showing loading state', {
      driftLoading,
      isInitializing,
      isInitialized,
      hasData
    });
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading portfolio drift data...</p>
      </div>
    );
  }

  // Handle setup required state
  if (driftSetupRequired) {
    return (
      <div className="space-y-6">
        {/* Global Dialog for target allocations */}
        <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Target Allocations</DialogTitle>
              <DialogDescription>
                Define target percentages for each sector to track portfolio drift.
              </DialogDescription>
            </DialogHeader>
            <TargetAllocationEditor onClose={() => setAllocationDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Alert>
          <PieChart className="h-4 w-4" />
          <AlertTitle>Portfolio Setup Required</AlertTitle>
          <AlertDescription>
            {driftSetupMessage || "No target allocations are defined for this portfolio. Define target allocations to analyze portfolio drift."}
          </AlertDescription>
        </Alert>

        {/* Show current allocations if available */}
        {currentAllocations && (currentAllocations.sector || currentAllocations.asset_class) && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Portfolio Allocations</h3>
            
            {currentAllocations.asset_class && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Asset Classes</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(currentAllocations.asset_class).map(([assetClass, percentage]) => (
                    <div key={assetClass} className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium capitalize">
                        {assetClass.replace('_', ' ')}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentAllocations.sector && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Sectors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(currentAllocations.sector).map(([sector, percentage]) => (
                    <div key={sector} className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">{sector}</div>
                      <div className="text-lg font-bold text-primary">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-center">
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={() => setAllocationDialogOpen(true)}
          >
            <Settings className="h-4 w-4" />
            <span>Define Target Allocations</span>
          </Button>
        </div>
      </div>
    );
  }

  // Handle error state
  if (driftError) {
    // Special handling for missing target allocations
    const isMissingAllocationsError = driftError?.includes('No target allocations defined') || 
                                      driftError?.includes('target allocations defined') ||
                                      (driftError?.includes('400') && driftError?.includes('Bad Request'));
    
    return (
      <div className="space-y-4">
        <Alert variant={isMissingAllocationsError ? "warning" : "destructive"}>
          {isMissingAllocationsError ? (
            <PieChart className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>{isMissingAllocationsError ? "Action Required" : "Error"}</AlertTitle>
          <AlertDescription>
            {isMissingAllocationsError
              ? "To analyze portfolio drift, you need to define target allocations for each sector. Click the button below to set your target allocation percentages."
              : `${driftError}. Please ensure your portfolio has target allocations defined.`
            }
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            variant={isMissingAllocationsError ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setAllocationDialogOpen(true)}
          >
            <Settings className="h-4 w-4" />
            {isMissingAllocationsError ? "Define Target Allocations" : "Set Target Allocations"}
          </Button>
        </div>
      </div>
    );
  }

  // Handle missing data
  if (!hasData) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No drift data available</AlertTitle>
          <AlertDescription>
            No target allocations are defined for this portfolio. Please set target allocations to see drift visualization.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={() => setAllocationDialogOpen(true)}
          >
            <Settings className="h-4 w-4" />
            <span>Define Target Allocations</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Global Dialog for target allocations */}
      <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Target Allocations</DialogTitle>
            <DialogDescription>
              Define target percentages for each sector to track portfolio drift.
            </DialogDescription>
          </DialogHeader>
          <TargetAllocationEditor onClose={() => setAllocationDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Portfolio Drift</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setAllocationDialogOpen(true)}
          >
            <Settings className="h-4 w-4" />
            <span>Target Allocations</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={driftLoading}
          >
            <RefreshCw className={`h-4 w-4 ${driftLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <MemoizedDriftVisualization 
        data={driftData?.sector} 
        thresholdPercent={5}
        type="sector"
      />

      {/* Drift Alerts section */}
      <DriftAlertsSection />
    </div>
  );
};

// Memoized DriftVisualization component to prevent unnecessary re-renders
const MemoizedDriftVisualization = React.memo(DriftVisualization, (prevProps, nextProps) => {
  // Only re-render if the data actually changes
  return (
    prevProps.data === nextProps.data &&
    prevProps.thresholdPercent === nextProps.thresholdPercent &&
    prevProps.type === nextProps.type
  );
});

MemoizedDriftVisualization.displayName = 'MemoizedDriftVisualization';

export default PortfolioDriftContainer;
