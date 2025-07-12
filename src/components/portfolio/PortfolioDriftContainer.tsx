"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPortfolioDrift } from '@/store/portfolioSlice';
import DriftVisualization from '../alerts/DriftVisualization';
import TargetAllocationEditor from './TargetAllocationEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
import { portfolioApi } from '@/services/api';
import { DriftResponse } from '@/types/portfolio';

const PortfolioDriftContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { driftData, driftLoading, driftError } = useSelector((state: RootState) => state.portfolio);
  const [activeTab, setActiveTab] = useState<'overall' | 'asset-class' | 'sector' | 'holdings'>('overall');
  const [portfolioId, setPortfolioId] = useState<string>('');
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Use data from the API
  const displayData: DriftResponse = driftData || {} as DriftResponse;
  
  // Log the data we're using for debugging
  useEffect(() => {
    console.log('Current drift data:', displayData);
  }, [displayData]);
  
  useEffect(() => {
    // Add logging to help debug the data
    if (driftData && !driftLoading) {
      // Check if we have asset class data
      if (driftData.asset_class?.items && driftData.asset_class.items.length > 0) {
        console.log('Asset class data available:', 
          driftData.asset_class.items.map(item => `${item.name}: ${item.currentAllocation}%`)
        );
      } else {
        console.warn('No asset class data available in API response!');
      }
    }
  }, [driftData, driftLoading]);

  useEffect(() => {
    // Get the active portfolio ID and then fetch drift data
    async function fetchPortfolioData() {
      try {
        setLoading(true);
        // Default to 'default' portfolio ID if the active one can't be retrieved
        let activePortfolioId = 'default';
        try {
          const fetchedId = await portfolioApi.getActivePortfolioId();
          if (fetchedId) {
            activePortfolioId = fetchedId;
          }
        } catch (error) {
          console.warn('Could not get active portfolio ID, using default', error);
        }
        
        setPortfolioId(activePortfolioId);
        
        // Attempt to fetch drift data
        try {
          // Fetch data from the API
          await dispatch(fetchPortfolioDrift()).unwrap();
          console.log('Successfully fetched portfolio drift data');
        } catch (error: any) {
          console.error('Error fetching drift data:', error);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchPortfolioData();
  }, [dispatch]);

  // Handle loading state
  if (driftLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading portfolio drift data...</p>
      </div>
    );
  }

  // Handle error state
  if (driftError) {
    // Special handling for missing target allocations
    const isMissingAllocationsError = driftError?.includes('No target allocations defined');
    
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
              ? "No target allocations defined for this portfolio. Please set your target allocations to view drift analysis."
              : `${driftError}. Please ensure your portfolio has target allocations defined.`
            }
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between">
          {isMissingAllocationsError && (
            <Button 
              variant="default" 
              className="flex items-center gap-2"
              onClick={() => setAllocationDialogOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Define Target Allocations
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => dispatch(fetchPortfolioDrift())}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>
    );
  }

  // Handle missing data
  // Log what data is available to help troubleshoot
  console.log('Drift data available:', {
    overall: !!driftData?.overall,
    asset_class: !!driftData?.asset_class,
    sector: !!driftData?.sector
  });
  
  if (!driftData?.overall && !driftData?.asset_class && !driftData?.sector) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No drift data available</AlertTitle>
          <AlertDescription>
            No target allocations are defined for this portfolio. Please set target allocations to see drift visualization.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between">
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={() => setAllocationDialogOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Define Target Allocations
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => dispatch(fetchPortfolioDrift())}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
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
              Define target percentages for each asset class to track portfolio drift.
            </DialogDescription>
          </DialogHeader>
          <TargetAllocationEditor onClose={() => setAllocationDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Portfolio Drift</h2>
        
        {/* Use a regular button without DialogTrigger */}
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setAllocationDialogOpen(true)}
        >
          <Settings className="h-4 w-4" />
          <span>Target Allocations</span>
        </Button>
        

      </div>

      
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          {displayData.overall && <TabsTrigger value="overall">Overall</TabsTrigger>}
          {displayData.asset_class && <TabsTrigger value="asset-class">Asset Classes</TabsTrigger>}
          {displayData.sector && <TabsTrigger value="sector">Sectors</TabsTrigger>}
          {displayData.holdings && <TabsTrigger value="holdings">Holdings</TabsTrigger>}
        </TabsList>
        
        {displayData.overall && (
          <TabsContent value="overall">
            <DriftVisualization data={displayData.overall} type="overall" />
          </TabsContent>
        )}
        
        {displayData.asset_class && (
          <TabsContent value="asset-class">
            <DriftVisualization data={displayData.asset_class} type="asset-class" />
          </TabsContent>
        )}
        
        {displayData.sector && (
          <TabsContent value="sector">
            <DriftVisualization 
              data={displayData.sector} 
              type="sector" 
              thresholdPercent={5} 
            />
          </TabsContent>
        )}
        
        {displayData.holdings && (
          <TabsContent value="holdings">
            <DriftVisualization 
              data={displayData.holdings} 
              type="holdings" 
              thresholdPercent={3} 
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PortfolioDriftContainer;
