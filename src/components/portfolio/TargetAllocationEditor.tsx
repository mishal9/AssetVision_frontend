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
import { Loader2, Save, PlusCircle, MinusCircle, Trash2 } from 'lucide-react';
import { fetchAssetClasses, saveTargetAllocations, fetchPortfolioDrift } from '@/store/portfolioSlice';
import { ASSET_CLASSES } from '@/constants/assetClasses';
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
  const { portfolioData, assetClasses } = useSelector((state: RootState) => state.portfolio);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<{[key: string]: number}>({}); 
  const [totalAllocation, setTotalAllocation] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'asset-class' | 'sector'>('asset-class');
  const [isSaving, setIsSaving] = useState(false);

  // Generate colors for the bars
  const COLORS = '#0088FE';
  
  // Fetch asset classes when component loads
  useEffect(() => {
    const loadAssetClasses = async () => {
      try {
        // Fetch latest asset classes with current target allocations
        await dispatch(fetchAssetClasses()).unwrap();
      } catch (error) {
        console.error('Failed to fetch asset classes:', error);
      }
    };
    
    if (!assetClasses.length) {
      loadAssetClasses();
    }
  }, [dispatch]);
  
  // Initialize from asset classes when they're available
  useEffect(() => {
    if (assetClasses.length && !isInitialized) {
      initializeFromExistingAllocations();
      setIsInitialized(true);
    }
  }, [assetClasses, isInitialized]);

  /**
   * Initialize from existing target allocations in the Redux store
   */
  const initializeFromExistingAllocations = () => {
    const initialAllocations: {[key: string]: number} = {};
    let hasExistingAllocations = false;
    
    // Initialize from asset classes in the store
    assetClasses.forEach(assetClass => {
      // Use the target_allocation if it exists, otherwise default to 0
      const targetValue = assetClass.target_allocation !== undefined ? assetClass.target_allocation : 0;
      initialAllocations[assetClass.id] = targetValue;
      if (targetValue > 0) hasExistingAllocations = true;
    });
    
    // If no asset classes have allocations, initialize remaining from constants
    if (!hasExistingAllocations) {
      ASSET_CLASSES.forEach(assetClass => {
        if (initialAllocations[assetClass.id] === undefined) {
          initialAllocations[assetClass.id] = 0;
        }
      });
    }
    
    setAllocations(initialAllocations);
    calculateTotalAllocation(initialAllocations);
    console.log('Initialized allocations:', initialAllocations);
  };

  const calculateTotalAllocation = (allocations: {[key: string]: number}) => {
    const total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    setTotalAllocation(total);
  };

  /**
   * Handle allocation change for an asset
   */
  const handleAllocationChange = (assetId: string, value: number) => {
    setAllocations(prev => {
      const updated = { ...prev, [assetId]: value };
      // Recalculate total
      const newTotal = Object.values(updated).reduce((sum, val) => sum + val, 0);
      setTotalAllocation(newTotal);
      return updated;
    });
  };

  /**
   * Save target allocations
   */
  const handleSave = async () => {
    if (Math.abs(totalAllocation - 100) > 0.01) {
      setFormError('Total allocation must equal 100%');
      return;
    }
    
    setIsSaving(true);
    setFormError(null);
    
    try {
      const allocationPayload = Object.entries(allocations).map(([assetId, percentage]) => ({
        asset_id: assetId,
        target_percentage: percentage
      }));
      
      setLoading(true);
      // Real API call
      await dispatch(saveTargetAllocations(allocationPayload)).unwrap();
      // Refresh portfolio drift data to reflect new allocations
      await dispatch(fetchPortfolioDrift()).unwrap();
      setLoading(false);
      
      // Close modal if onClose prop exists
      if (onClose) onClose();
    } catch (error: any) {
      setFormError(error.message || 'Failed to save target allocations');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Distribute remaining allocation evenly
   */
  const distributeRemaining = () => {
    const nonZeroCount = Object.values(allocations).filter(val => val > 0).length;
    const totalCount = Object.keys(allocations).length;
    
    // If there are no non-zero allocations, distribute evenly across all asset classes
    const countToUse = nonZeroCount === 0 ? totalCount : nonZeroCount;
    if (countToUse === 0) return; // Safety check
    
    const remaining = 100 - totalAllocation;
    const addPerAsset = remaining / countToUse;
    
    setAllocations(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        // If no non-zero allocations, distribute to all assets
        // Otherwise, only distribute to non-zero assets
        if (nonZeroCount === 0 || updated[key] > 0) {
          // For zero allocations, just add the per-asset amount
          // For non-zero, add to the existing amount
          updated[key] = Math.round((updated[key] + addPerAsset) * 100) / 100;
        }
      });
      setTotalAllocation(100);
      return updated;
    });
  };

  // Use fixed asset classes
  const assetData = ASSET_CLASSES;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Target Allocations</CardTitle>
        <CardDescription>
          Define target percentages for your portfolio's asset classes and sectors.
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

        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'asset-class' | 'sector')}>
          <TabsList className="mb-4">
            <TabsTrigger value="asset-class">Asset Classes</TabsTrigger>
            <TabsTrigger value="sector" disabled={activeTab === 'asset-class'}>Sectors</TabsTrigger>
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
                          className="w-16 text-right mr-2"
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
                
                <div className="mt-6 pt-3 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <span className="font-semibold">Total:</span> 
                    <span className={`ml-2 ${Math.abs(totalAllocation - 100) > 0.01 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
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
          
          <TabsContent value="sector">
            <div className="p-8 text-center text-muted-foreground">
              <p>Sector allocations will be available after setting asset class allocations.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 px-4 sm:px-6 pt-2 pb-4">
        <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || Math.abs(totalAllocation - 100) > 0.01}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Allocations</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TargetAllocationEditor;
