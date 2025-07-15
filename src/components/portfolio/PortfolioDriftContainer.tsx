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
import { AlertTriangle, Loader2, RefreshCw, PieChart, Settings } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { portfolioApi } from '@/services/api';

const PortfolioDriftContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { driftData, driftLoading, driftError } = useSelector((state: RootState) => state.portfolio);
  const [activeTab, setActiveTab] = useState<'overall' | 'sector'>('sector');
  const [portfolioId, setPortfolioId] = useState<string>('');
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Log API data for debugging
    if (driftData && !driftLoading) {
      console.log('Live API drift data:', JSON.stringify(driftData, null, 2));
      
      // Check if we have real data
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
  }, [driftData, driftLoading]);

  useEffect(() => {
    // Get the active portfolio ID and fetch drift data
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
        
        // Fetch drift data from live API
        await dispatch(fetchPortfolioDrift()).unwrap();
        console.log('Successfully fetched live portfolio drift data');
      } catch (error: any) {
        console.error('Error fetching drift data:', error);
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
        
        <div className="flex justify-center">
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
        </div>
      </div>
    );
  }

  // Handle missing data
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
            onClick={() => {
              if (portfolioId) {
                dispatch(fetchPortfolioDrift());
              }
            }}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overall' | 'sector')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="sector">Sector</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overall" className="mt-4">
          <DriftVisualization 
            data={driftData?.overall} 
            thresholdPercent={5}
            type="overall"
          />
        </TabsContent>
        
        <TabsContent value="sector" className="mt-4">
          <DriftVisualization 
            data={driftData?.sector} 
            thresholdPercent={5}
            type="sector"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioDriftContainer;
