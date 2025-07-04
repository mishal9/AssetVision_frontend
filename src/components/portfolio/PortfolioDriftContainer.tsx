"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPortfolioDrift } from '@/store/portfolioSlice';
import DriftVisualization from '../alerts/DriftVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertTriangle, Loader2, BugPlay, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState<boolean>(true);
  
  // Determine which data to display - real or mock
  const displayData = useMockData ? mockDriftData : driftData;

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
        } catch (error) {
          console.error('Error fetching drift data:', error);
          // Automatically fall back to mock data when there's an API error
          setUseMockData(true);
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
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {driftError}. Please ensure your portfolio has target allocations defined.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-end">
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
  if (!useMockData && !driftData.overall && !driftData.asset_class && !driftData.sector) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No drift data available</AlertTitle>
          <AlertDescription>
            No target allocations are defined for this portfolio. Please set target allocations in your portfolio settings.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-end">
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
                dispatch(fetchPortfolioDrift(portfolioId));
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
