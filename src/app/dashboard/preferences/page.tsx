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
import { preferencesApi } from '@/services/api';

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
  
  // State code to name mapping
  const stateCodeToName: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'District of Columbia'
  };

  // State name to code mapping (reverse of above)
  const stateNameToCode: Record<string, string> = Object.entries(stateCodeToName).reduce(
    (acc, [code, name]) => ({ ...acc, [name]: code }),
    {}
  );
  
  // Available options for state of residence dropdown (full state names)
  const statesOfResidence = Object.values(stateCodeToName);
  
  // Tax filing status options with mapping to API values
  const taxFilingStatusMapping: Record<string, string> = {
    'SINGLE': 'Single',
    'MARRIED_FILING_JOINTLY': 'Married Filing Jointly',
    'MARRIED_FILING_SEPARATELY': 'Married Filing Separately',
    'HEAD_OF_HOUSEHOLD': 'Head of Household',
    'QUALIFYING_WIDOW': 'Qualifying Widow(er)'
  };

  // Reverse mapping for API submission
  const taxFilingStatusReverseMapping: Record<string, string> = Object.entries(taxFilingStatusMapping).reduce(
    (acc, [apiValue, displayValue]) => ({ ...acc, [displayValue]: apiValue }),
    {}
  );

  // Options for the dropdown
  const taxFilingStatusOptions = Object.values(taxFilingStatusMapping);

  // State for loading states and errors
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user preferences from the API
  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const preferences = await preferencesApi.getPreferences();
        setMarketRegionValues(preferences.marketRegion);
        setTaxValues(preferences.tax);
        dispatch(updateAllPreferences(preferences));
      } catch (err) {
        console.error('Failed to load preferences:', err);
        setError('Failed to load preferences. Using default values.');
        toast.error('Failed to load your preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [dispatch]);

  // Handle all preferences submission
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      // Update Redux state
      dispatch(updateAllPreferences({
        marketRegion: marketRegionValues,
        tax: taxValues
      }));
      
      // Make API call to persist to backend
      await preferencesApi.updatePreferences({
        marketRegion: marketRegionValues,
        tax: taxValues
      });
      
      toast.success('Preferences saved successfully');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences. Please try again.');
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
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
    // Special handling for string fields - convert display values to API codes
    if (field === 'stateOfResidence') {
      // Convert state name to state code for the API
      const stateCode = stateNameToCode[value] || value;
      setTaxValues(prev => ({
        ...prev,
        [field]: stateCode
      }));
    } else if (field === 'taxFilingStatus') {
      // Convert display filing status to API code
      const filingStatusCode = taxFilingStatusReverseMapping[value] || value;
      setTaxValues(prev => ({
        ...prev,
        [field]: filingStatusCode
      }));
    } else {
      // Normal handling for numeric fields
      const numericValue = parseFloat(value) || 0;
      setTaxValues(prev => ({
        ...prev,
        [field]: numericValue
      }));
    }
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
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
      ) : (
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
                    value={marketRegionValues?.marketRegion || ''}
                    onChange={(value) => handleMarketRegionChange('marketRegion', value)}
                    options={marketRegionOptions}
                    description="Select market region for analyzed securities"
                  />

                  <SimpleSelect
                    id="riskFreeRate"
                    label="Risk Free Rate"
                    value={marketRegionValues?.riskFreeRate || ''}
                    onChange={(value) => handleMarketRegionChange('riskFreeRate', value)}
                    options={riskFreeRateOptions}
                    description="Select risk free series for risk metrics"
                  />

                  <SimpleSelect
                    id="inflationSeries"
                    label="Inflation Series"
                    value={marketRegionValues?.inflationSeries || ''}
                    onChange={(value) => handleMarketRegionChange('inflationSeries', value)}
                    options={inflationSeriesOptions}
                    description="Select inflation series for inflation adjusted returns and cashflow"
                  />

                  <SimpleSelect
                    id="default_benchmark"
                    label="Default Benchmark"
                    value={marketRegionValues?.default_benchmark || ''}
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
                        value={taxValues?.pretaxAnnualIncome?.toString() || ''}
                        onChange={(e) => handleTaxChange('pretaxAnnualIncome', e.target.value)}
                        className="pr-8 h-10"
                      />
                      <span className="absolute right-3 text-muted-foreground">$</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <SimpleSelect
                      id="stateOfResidence"
                      value={stateCodeToName[taxValues?.stateOfResidence || ''] || ''}
                      onChange={(value) => handleTaxChange('stateOfResidence', value)}
                      options={statesOfResidence}
                      label="State of Residence"
                      description="Your primary state of residence for tax purposes"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <SimpleSelect
                      id="taxFilingStatus"
                      value={taxFilingStatusMapping[taxValues?.taxFilingStatus || ''] || ''}
                      onChange={(value) => handleTaxChange('taxFilingStatus', value)}
                      options={taxFilingStatusOptions}
                      label="Tax Filing Status"
                      description="Your tax filing status for federal tax purposes"
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
                        value={taxValues?.federalIncomeTax?.toString() || ''}
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
                        value={taxValues?.stateIncomeTax?.toString() || ''}
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
                        value={taxValues?.longTermCapitalGainsTax?.toString() || ''}
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
                        value={taxValues?.shortTermCapitalGainsTax?.toString() || ''}
                        onChange={(e) => handleTaxChange('shortTermCapitalGainsTax', e.target.value)}
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
      <div className="mt-8 flex flex-col space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md p-3">
            {error}
          </div>
        )}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="px-10 py-6 text-base" 
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Preferences'}
          </Button>
        </div>
      </div>
    </form>
      )}
    </div>
  );
}
