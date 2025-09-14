"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, Save, PlusCircle, MinusCircle, Trash2, AlertTriangle } from 'lucide-react';
import { fetchAssetClasses, saveTargetAllocations, fetchPortfolioDrift, fetchSectors, saveSectorTargetAllocations } from '@/store/portfolioSlice';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BugPlay } from "lucide-react";

/**
 * Component for editing and setting target allocations for portfolio assets
 */
interface TargetAllocationEditorProps {
  onClose?: () => void;
}

const TargetAllocationEditor: React.FC<TargetAllocationEditorProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { assetClasses, sectors, assetClassesLoading, sectorsLoading, sectorsError, assetClassesError } = useSelector((state: RootState) => state.portfolio);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<{[key: string]: number}>({});
  const [sectorAllocations, setSectorAllocations] = useState<{[key: string]: number}>({});
  const [totalAllocation, setTotalAllocation] = useState<number>(0);
  const [totalSectorAllocation, setTotalSectorAllocation] = useState<number>(0);
  const [assetClassesInitialized, setAssetClassesInitialized] = useState(false);
  const [sectorsInitialized, setSectorsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'asset-class' | 'sector'>('sector');
  const [isSaving, setIsSaving] = useState(false);

  // Generate colors for the bars
  const COLORS = '#0088FE';
  

  // Fetch asset classes and sectors when component loads
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to fetch latest asset classes with current target allocations
        if (!assetClasses.length) {
          try {
            await dispatch(fetchAssetClasses()).unwrap();
          } catch (assetError) {
            console.warn('Failed to fetch asset classes:', assetError);
            // Continue - user can still set allocations even if API fails
          }
        }
        // Try to fetch latest sectors with current target allocations
        if (!sectors.length) {
          try {
            await dispatch(fetchSectors()).unwrap();
          } catch (sectorError) {
            console.warn('Failed to fetch sectors:', sectorError);
            // Continue - user can still set allocations even if API fails
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Don't block the UI - user can still proceed
      }
    };
    
    loadData();
  }, [dispatch, assetClasses.length, sectors.length]);
  
  // Initialize from asset classes when they're available
  useEffect(() => {
    if (assetClasses.length && !assetClassesInitialized) {
      initializeFromExistingAllocations();
      setAssetClassesInitialized(true);
    }
  }, [assetClasses, assetClassesInitialized]);
  
  // Initialize sectors separately
  useEffect(() => {
    if (sectors.length && !sectorsInitialized) {
      initializeFromExistingSectorAllocations();
      setSectorsInitialized(true);
    }
  }, [sectors, sectorsInitialized]);

  /**
   * Initialize from existing target allocations in the Redux store
   */
  const initializeFromExistingAllocations = () => {
    const initialAllocations: {[key: string]: number} = {};
    
    // Initialize from asset classes in the store (API data)
    assetClasses.forEach(assetClass => {
      // Prefer camelCase 'targetAllocation' from converted data, fallback to snake_case
      const targetValue =
        (assetClass as any).targetAllocation !== undefined
          ? (assetClass as any).targetAllocation
          : assetClass.target_allocation !== undefined
            ? assetClass.target_allocation
            : 0;
      initialAllocations[assetClass.id] = targetValue;
    });
    
    setAllocations(initialAllocations);
    calculateTotalAllocation(initialAllocations);
    console.log('Initialized allocations from API:', initialAllocations);
  };
  
  /**
   * Initialize from existing sector target allocations in the Redux store
   */
  const initializeFromExistingSectorAllocations = () => {
    const initialAllocations: {[key: string]: number} = {};
    
    // Initialize from sectors in the store (API data)
    sectors.forEach(sector => {
      const targetValue =
        (sector as any).targetAllocation !== undefined
          ? (sector as any).targetAllocation
          : sector.target_allocation !== undefined
            ? sector.target_allocation
            : 0;
      initialAllocations[sector.id] = targetValue;
    });
    
    setSectorAllocations(initialAllocations);
    calculateTotalSectorAllocation(initialAllocations);
    console.log('Initialized sector allocations from API:', initialAllocations);
  };

  const calculateTotalAllocation = (allocations: {[key: string]: number}) => {
    const total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    setTotalAllocation(total);
  };
  
  const calculateTotalSectorAllocation = (allocations: {[key: string]: number}) => {
    const total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    setTotalSectorAllocation(total);
  };

  /**
   * Handle allocation change for an asset
   */
  const handleAllocationChange = (assetId: string, value: number) => {
    const newAllocations = { ...allocations, [assetId]: value };
    setAllocations(newAllocations);
    calculateTotalAllocation(newAllocations);
  };

  /**
   * Handle allocation change for a sector
   */
  const handleSectorAllocationChange = (sectorId: string, value: number) => {
    const newAllocations = { ...sectorAllocations, [sectorId]: value };
    setSectorAllocations(newAllocations);
    calculateTotalSectorAllocation(newAllocations);
  };

  /**
   * Reset all allocations to 0
   */
  const resetAllocations = () => {
    if (activeTab === 'asset-class') {
      const resetAllocations = Object.keys(allocations).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {} as {[key: string]: number});
      setAllocations(resetAllocations);
      calculateTotalAllocation(resetAllocations);
    } else {
      const resetAllocations = Object.keys(sectorAllocations).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {} as {[key: string]: number});
      setSectorAllocations(resetAllocations);
      calculateTotalSectorAllocation(resetAllocations);
    }
  };

  /**
   * Auto-balance allocations by distributing remaining percentage
   */
  const distributeRemaining = () => {
    if (activeTab === 'asset-class') {
      const remaining = 100 - totalAllocation;
      const nonZeroCount = Object.values(allocations).filter(val => val > 0).length;
      
      if (nonZeroCount > 0) {
        const distributionAmount = remaining / nonZeroCount;
        const newAllocations = { ...allocations };
        
        Object.keys(newAllocations).forEach(assetId => {
          if (newAllocations[assetId] > 0) {
            newAllocations[assetId] = Math.max(0, newAllocations[assetId] + distributionAmount);
          }
        });
        
        setAllocations(newAllocations);
        calculateTotalAllocation(newAllocations);
      }
    } else {
      const remaining = 100 - totalSectorAllocation;
      const nonZeroCount = Object.values(sectorAllocations).filter(val => val > 0).length;
      
      if (nonZeroCount > 0) {
        const distributionAmount = remaining / nonZeroCount;
        const newAllocations = { ...sectorAllocations };
        
        Object.keys(newAllocations).forEach(sectorId => {
          if (newAllocations[sectorId] > 0) {
            newAllocations[sectorId] = Math.max(0, newAllocations[sectorId] + distributionAmount);
          }
        });
        
        setSectorAllocations(newAllocations);
        calculateTotalSectorAllocation(newAllocations);
      }
    }
  };

  /**
   * Auto-balance sectors by distributing remaining percentage
   */
  const distributeSectorRemaining = () => {
    const remaining = 100 - totalSectorAllocation;
    const nonZeroCount = Object.values(sectorAllocations).filter(val => val > 0).length;
    
    if (nonZeroCount > 0) {
      const distributionAmount = remaining / nonZeroCount;
      const newAllocations = { ...sectorAllocations };
      
      Object.keys(newAllocations).forEach(sectorId => {
        if (newAllocations[sectorId] > 0) {
          newAllocations[sectorId] = Math.max(0, newAllocations[sectorId] + distributionAmount);
        }
      });
      
      setSectorAllocations(newAllocations);
      calculateTotalSectorAllocation(newAllocations);
    }
  };

  /**
   * Save target allocations to the backend
   */
  const saveAllocations = async () => {
    if (activeTab === 'asset-class') {
      // Validate total allocation
      if (Math.abs(totalAllocation - 100) > 0.01) {
        setFormError('Total allocation must equal 100%');
        return;
      }
      
      setIsSaving(true);
      setFormError(null);
      
      try {
        // Prepare data for the API
        const allocationData = Object.entries(allocations).map(([assetId, targetPercentage]) => ({
          asset_id: assetId,
          target_percentage: targetPercentage
        }));
        
        console.log('Saving allocations:', allocationData);
        
        // Call the Redux action
        await dispatch(saveTargetAllocations(allocationData)).unwrap();
        
        // Refresh drift data after saving
        await dispatch(fetchPortfolioDrift()).unwrap();
        
        // Close the dialog
        onClose?.();
      } catch (error) {
        console.error('Failed to save allocations:', error);
        setFormError('Failed to save allocations. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Validate total sector allocation
      if (Math.abs(totalSectorAllocation - 100) > 0.01) {
        setFormError('Total sector allocation must equal 100%');
        return;
      }
      
      setIsSaving(true);
      setFormError(null);
      
      try {
        // Prepare data for the API
        const allocationData = Object.entries(sectorAllocations).map(([sectorId, targetPercentage]) => ({
          asset_id: sectorId,
          target_percentage: targetPercentage
        }));
        
        console.log('Saving sector allocations:', allocationData);
        
        // Call the Redux action
        await dispatch(saveSectorTargetAllocations(allocationData)).unwrap();
        
        // Refresh drift data after saving
        await dispatch(fetchPortfolioDrift()).unwrap();
        
        // Close the dialog
        onClose?.();
      } catch (error) {
        console.error('Failed to save sector allocations:', error);
        setFormError('Failed to save sector allocations. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Prepare data for visualization
  const assetData = assetClasses.map(assetClass => ({
    id: assetClass.id,
    name: assetClass.name,
    description: assetClass.description,
    current: assetClass.current_allocation || 0,
    target: allocations[assetClass.id] || 0
  }));

  const sectorData = sectors.map(sector => ({
    id: sector.id,
    name: sector.name,
    description: sector.description,
    current: sector.current_allocation || 0,
    target: sectorAllocations[sector.id] || 0
  }));

  // Show loading state while fetching data
  if (assetClassesLoading || sectorsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading allocation data...</span>
      </div>
    );
  }

  // Show warning if no data is available, but still allow user to proceed
  const hasApiErrors = sectorsError || assetClassesError;
  const hasNoData = !assetClasses.length && !sectors.length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle>Target Allocations</CardTitle>
        <CardDescription>
          Define target percentages for your portfolio's sectors and asset classes.
          Total allocation should equal 100%.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-2">
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {hasApiErrors && hasNoData && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Limited Data Available</AlertTitle>
            <AlertDescription>
              Unable to load existing portfolio data. You can still set target allocations, but you may need to create sectors or asset classes manually.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'asset-class' | 'sector')}>
          <TabsList className="mb-4">
            <TabsTrigger value="sector">Sectors</TabsTrigger>
            <TabsTrigger value="asset-class">Asset Classes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="asset-class" className="space-y-4">
            <div className="flex flex-col gap-4">
              {/* Sliders for asset allocation */}
              <div className="space-y-4">

                {assetData && assetData.map(asset => (
                  <div key={asset.id} className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor={`allocation-${asset.id}`}>{asset.name}</Label>
                      <div className="flex items-center">
                        <Input
                          id={`allocation-input-${asset.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={allocations[asset.id] || 0}
                          onChange={(e) => handleAllocationChange(asset.id, parseFloat(e.target.value) || 0)}
                          className="w-20 text-right mr-2"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                    <Slider
                      id={`allocation-${asset.id}`}
                      min={0}
                      max={100}
                      step={0.1}
                      value={[allocations[asset.id] || 0]}
                      onValueChange={(value) => handleAllocationChange(asset.id, value[0])}
                    />
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <span className="font-semibold">Total:</span> 
                    <span className={`ml-2 text-lg ${Math.abs(totalAllocation - 100) > 0.01 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                      {totalAllocation.toFixed(1)}%
                    </span>
                  </div>
                  
                  {Math.abs(totalAllocation - 100) > 0.01 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={distributeRemaining}
                      className="flex items-center justify-center gap-1 w-full sm:w-auto"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Balance to 100%</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sector" className="space-y-4">
            <div className="flex flex-col gap-4">
              {/* Sliders for sector allocation */}
              <div className="space-y-4">
                {sectors.map(sector => (
                  <div key={sector.id} className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor={`sector-allocation-${sector.id}`}>{sector.name}</Label>
                      <div className="flex items-center">
                        <Input
                          id={`sector-allocation-input-${sector.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={sectorAllocations[sector.id] || 0}
                          onChange={(e) => handleSectorAllocationChange(sector.id, parseFloat(e.target.value) || 0)}
                          className="w-20 text-right mr-2"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                    <Slider
                      id={`sector-allocation-${sector.id}`}
                      min={0}
                      max={100}
                      step={0.1}
                      value={[sectorAllocations[sector.id] || 0]}
                      onValueChange={(value) => handleSectorAllocationChange(sector.id, value[0])}
                    />
                    <p className="text-sm text-muted-foreground">{sector.description}</p>
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <span className="font-semibold">Total:</span> 
                    <span className={`ml-2 text-lg ${Math.abs(totalSectorAllocation - 100) > 0.01 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                      {totalSectorAllocation.toFixed(1)}%
                    </span>
                  </div>
                  
                  {Math.abs(totalSectorAllocation - 100) > 0.01 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={distributeSectorRemaining}
                      className="flex items-center justify-center gap-1 w-full sm:w-auto"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Balance to 100%</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between px-4 sm:px-6">
        <Button
          variant="outline"
          onClick={resetAllocations}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Reset All
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={saveAllocations}
            disabled={isSaving || (activeTab === 'asset-class' ? Math.abs(totalAllocation - 100) > 0.01 : Math.abs(totalSectorAllocation - 100) > 0.01)}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Allocations
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TargetAllocationEditor;
