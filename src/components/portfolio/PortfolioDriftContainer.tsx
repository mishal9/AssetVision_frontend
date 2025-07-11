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
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, BugPlay, RefreshCw, PieChart, Settings } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { mockDriftData } from '@/mock/driftData';
import { portfolioApi } from '@/services/api';

const PortfolioDriftContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { driftData, driftLoading, driftError } = useSelector((state: RootState) => state.portfolio);
  const [activeTab, setActiveTab] = useState<'overall' | 'asset-class' | 'sector'>('overall');
  const [useMockData, setUseMockData] = useState(false);
  const [portfolioId, setPortfolioId] = useState<string>('');
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Determine which data to display - real or mock
  // Added logging to check what data is being used
  const displayData = useMockData ? mockDriftData : driftData;
  
  useEffect(() => {
    // Add extensive logging to help debug the data issue
    if (driftData && !driftLoading) {
      console.log('ACTUAL API DRIFT DATA:', JSON.stringify(driftData, null, 2));
      console.log('Is using mock data?', useMockData);
      
      // Check if we have real asset class data
      if (driftData.asset_class?.items && driftData.asset_class.items.length > 0) {
        console.log('Real asset class data available:', 
          driftData.asset_class.items.map(item => `${item.name}: ${item.currentAllocation}%`)
        );
      } else {
        console.warn('No real asset class data available in API response!');
      }
    }
  }, [driftData, driftLoading, useMockData]);

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
          await dispatch(fetchPortfolioDrift()).unwrap();
          
          // Only use real data if we successfully fetched it
          setUseMockData(false);
          
          // Log the success
          console.log('Successfully fetched portfolio drift data');
        } catch (error: any) {
          console.error('Error fetching drift data:', error);
          
          // Only fall back to mock data when explicitly requested or when there's an error
          // The Redux store will already have the error message set
          // But let's not automatically use mock data, as it confuses the user
          // setUseMockData(true);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchPortfolioData();
  }, [dispatch]);

  // Handle loading state
  if (driftLoading && !useMockData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading portfolio drift data...</p>
      </div>
    );
  }

  // Handle error state
  if (driftError && !useMockData) {
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
            onClick={() => setUseMockData(true)}
          >
            <BugPlay className="h-4 w-4" />
            <span>Use Test Data</span>
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
    sector: !!driftData?.sector,
    usingMockData: useMockData
  });
  
  if (!useMockData && !driftData?.overall && !driftData?.asset_class && !driftData?.sector) {
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
            <span>Define Target Allocations</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setUseMockData(true)}
          >
            <BugPlay className="h-4 w-4" />
            <span>Use Test Data</span>
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
      {useMockData && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded text-sm">
            <BugPlay className="h-4 w-4" />
            <span>Using test data</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setUseMockData(false);
              if (portfolioId) {
                dispatch(fetchPortfolioDrift());
              }
            }}
          >
            Try live data
          </Button>
        </div>
      )}
      
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-4">
          {displayData.overall && <TabsTrigger value="overall">Overall</TabsTrigger>}
          {displayData.asset_class && <TabsTrigger value="asset-class">Asset Classes</TabsTrigger>}
          {displayData.sector && <TabsTrigger value="sector">Sectors</TabsTrigger>}
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
            <DriftVisualization data={displayData.sector} type="sector" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PortfolioDriftContainer;
