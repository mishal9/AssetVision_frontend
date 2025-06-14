'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateAllPreferences, type MarketRegionSettings, type TaxSettings } from '@/store/preferencesSlice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * User Preferences Page
 * Allows users to set their market region settings and tax settings
 */
export default function PreferencesPage() {
  const dispatch = useAppDispatch();
  const { marketRegion, tax } = useAppSelector(state => state.preferences);
  
  // Local state for form values
  const [marketRegionValues, setMarketRegionValues] = useState<MarketRegionSettings>(marketRegion);
  const [taxValues, setTaxValues] = useState<TaxSettings>(tax);
  
  // Available options for dropdowns
  const marketRegionOptions = ['US', 'Canada', 'UK', 'EU', 'Japan', 'Australia'];
  const riskFreeRateOptions = [
    'US 3 Month Treasury Bill',
    'US 10 Year Treasury Bond',
    'Canada 3 Month Treasury Bill',
    'UK LIBOR 3 Month',
    'EU 3 Month EURIBOR'
  ];
  const inflationSeriesOptions = [
    'U.S. Consumer Price Index',
    'Canada Consumer Price Index',
    'UK Retail Price Index',
    'EU Harmonized Index of Consumer Prices',
    'Japan Consumer Price Index'
  ];
  const benchmarkOptions = [
    'S&P 500',
    'Dow Jones Industrial Average',
    'NASDAQ Composite',
    'Russell 2000',
    'FTSE 100',
    'Nikkei 225',
    'DAX',
    'TSX Composite'
  ];
  
  // US states for state of residence
  const statesOfResidence = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
  ];

  // Handle all preferences submission
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateAllPreferences({
      marketRegion: marketRegionValues,
      tax: taxValues
    }));
    toast.success('Preferences saved successfully');
  };

  // Handle market region form input changes
  const handleMarketRegionChange = (field: keyof MarketRegionSettings, value: string) => {
    setMarketRegionValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle tax form input changes
  const handleTaxChange = (field: keyof TaxSettings, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setTaxValues(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  // Simple select component helper
  const SimpleSelect = ({ 
    id,
    value, 
    onChange, 
    options, 
    label,
    description
  }: { 
    id: string,
    value: string, 
    onChange: (value: string) => void, 
    options: string[], 
    label: string,
    description?: string
  }) => {
    return (
      <div className="space-y-2 mb-4">
        <Label htmlFor={id} className="text-base font-medium">{label}</Label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="" disabled>{`Select ${label.toLowerCase()}`}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-6">User Preferences</h1>
      <form onSubmit={handleSavePreferences}>
        <Tabs defaultValue="market-region" className="w-full">
          <TabsList className="mb-6 w-full justify-start border-b">
            <TabsTrigger value="market-region" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 py-3">Market Region Settings</TabsTrigger>
            <TabsTrigger value="tax" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 py-3">Tax Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="market-region">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Market Region Settings</CardTitle>
              <CardDescription>
                Configure the market region settings for analyzed securities, risk metrics, and inflation adjustments.
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <div className="grid gap-0">
                  <SimpleSelect
                    id="marketRegion"
                    label="Market Region"
                    value={marketRegionValues.marketRegion}
                    onChange={(value) => handleMarketRegionChange('marketRegion', value)}
                    options={marketRegionOptions}
                    description="Select market region for analyzed securities"
                  />

                  <SimpleSelect
                    id="riskFreeRate"
                    label="Risk Free Rate"
                    value={marketRegionValues.riskFreeRate}
                    onChange={(value) => handleMarketRegionChange('riskFreeRate', value)}
                    options={riskFreeRateOptions}
                    description="Select risk free series for risk metrics"
                  />

                  <SimpleSelect
                    id="inflationSeries"
                    label="Inflation Series"
                    value={marketRegionValues.inflationSeries}
                    onChange={(value) => handleMarketRegionChange('inflationSeries', value)}
                    options={inflationSeriesOptions}
                    description="Select inflation series for inflation adjusted returns and cashflow"
                  />

                  <SimpleSelect
                    id="default_benchmark"
                    label="Default Benchmark"
                    value={marketRegionValues.default_benchmark}
                    onChange={(value) => handleMarketRegionChange('default_benchmark', value)}
                    options={benchmarkOptions}
                    description="Select default benchmark index for portfolio comparison"
                  />
                </div>
              </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="tax">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>
                Configure your tax settings for accurate portfolio return and income calculations.
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-3 md:grid-cols-2 md:gap-x-6 md:gap-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="pretaxAnnualIncome" className="text-base font-medium">Approximate Pre-Tax Annual Income ($)</Label>
                    <div className="relative flex items-center">
                      <Input
                        id="pretaxAnnualIncome"
                        type="number"
                        min="0"
                        step="1000"
                        value={taxValues.pretaxAnnualIncome.toString()}
                        onChange={(e) => handleTaxChange('pretaxAnnualIncome', e.target.value)}
                        className="pr-8 h-10"
                      />
                      <span className="absolute right-3 text-muted-foreground">$</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <SimpleSelect
                      id="stateOfResidence"
                      value={taxValues.stateOfResidence}
                      onChange={(value) => handleTaxChange('stateOfResidence', value)}
                      options={statesOfResidence}
                      label="State of Residence"
                      description="Your primary state of residence for tax purposes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="federalIncomeTax" className="text-base font-medium">Federal Income Tax (%)</Label>
                    <div className="relative flex items-center">
                      <Input
                        id="federalIncomeTax"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxValues.federalIncomeTax.toString()}
                        onChange={(e) => handleTaxChange('federalIncomeTax', e.target.value)}
                        className="pr-8 h-10"
                      />
                      <span className="absolute right-3 text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stateIncomeTax" className="text-base font-medium">State Income Tax (%)</Label>
                    <div className="relative flex items-center">
                      <Input
                        id="stateIncomeTax"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxValues.stateIncomeTax.toString()}
                        onChange={(e) => handleTaxChange('stateIncomeTax', e.target.value)}
                        className="pr-8 h-10"
                      />
                      <span className="absolute right-3 text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longTermCapitalGainsTax" className="text-base font-medium">Long Term Capital Gains Tax (%)</Label>
                    <div className="relative flex items-center">
                      <Input
                        id="longTermCapitalGainsTax"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxValues.longTermCapitalGainsTax.toString()}
                        onChange={(e) => handleTaxChange('longTermCapitalGainsTax', e.target.value)}
                        className="pr-8 h-10"
                      />
                      <span className="absolute right-3 text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortTermCapitalGainsTax" className="text-base font-medium">Short Term Capital Gains Tax (%)</Label>
                    <div className="relative flex items-center">
                      <Input
                        id="shortTermCapitalGainsTax"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxValues.shortTermCapitalGainsTax.toString()}
                        onChange={(e) => handleTaxChange('shortTermCapitalGainsTax', e.target.value)}
                        className="pr-8 h-10"
                      />
                      <span className="absolute right-3 text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affordableCareActTax" className="text-base font-medium">Affordable Care Act Tax (%)</Label>
                    <div className="relative flex items-center">
                      <Input
                        id="affordableCareActTax"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxValues.affordableCareActTax.toString()}
                        onChange={(e) => handleTaxChange('affordableCareActTax', e.target.value)}
                        className="pr-8 h-10"
                      />
                      <span className="absolute right-3 text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      <div className="mt-8 flex justify-end">
        <Button type="submit" className="px-10 py-6 text-base">Save All Preferences</Button>
      </div>
    </form>
    </div>
  );
}
