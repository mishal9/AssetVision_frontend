'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PlaidLinkButton } from '@/components/plaid/plaid-link-button';
import { portfolioApi } from '@/services/api';
import { plaidApi } from '@/services/plaid-api';
import { Plus, Trash2, Save, X, FileText, Building2 } from 'lucide-react';

// Define the form schema for multiple assets
const holdingSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
  shares: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Shares must be a positive number',
  }),
});

// Define the form schema for the entire portfolio
const portfolioSchema = z.object({
  holdings: z.array(holdingSchema)
    .min(1, 'Add at least one asset')
    .refine((holdings) => {
      // Check for duplicate symbols
      const symbols = holdings
        .filter(h => h.symbol.trim() !== '') // Only check non-empty symbols
        .map(h => h.symbol.toLowerCase());
      return new Set(symbols).size === symbols.length;
    }, { message: 'Portfolio contains duplicate symbols' })
});

type HoldingFormValues = z.infer<typeof holdingSchema>;
type PortfolioFormValues = z.infer<typeof portfolioSchema>;

/**
 * Multi-Asset Portfolio Setup Component
 * Allows users to input multiple assets at once with 10 input fields by default
 */
export function PortfolioSetup({ onPortfolioCreated }: { onPortfolioCreated: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'plaid'>('manual');
  const [plaidLoading, setPlaidLoading] = useState(false);
  const [plaidHoldings, setPlaidHoldings] = useState<HoldingFormValues[]>([]);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  
  // Initialize the portfolio form with multiple holdings
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      holdings: Array(5).fill({ symbol: '', shares: '' })
    },
    mode: 'onChange'
  });
  
  // Setup field array for dynamic fields
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'holdings'
  });
  
  // Count valid assets (non-empty symbols)
  const validAssetCount = form.watch('holdings')
    .filter(holding => holding.symbol && holding.symbol.trim() !== '')
    .length;
  
  // Add more input fields
  const addMoreFields = () => {
    // Add 3 more empty fields
    Array(3).fill({ symbol: '', shares: '' }).forEach(() => {
      append({ symbol: '', shares: '' });
    });
  };
  
  // Remove empty fields when submitting
  const removeEmptyFields = (holdings: HoldingFormValues[]) => {
    return holdings.filter(holding => holding.symbol && holding.symbol.trim() !== '');
  };
  
  // Show empty fields message after validation
  useEffect(() => {
    const subscription = form.watch(() => {
      setShowEmptyMessage(false);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  // Clear all fields
  const clearAllFields = () => {
    if (validAssetCount > 0 && confirm('Are you sure you want to clear all assets?')) {
      form.reset({
        holdings: Array(5).fill({ symbol: '', shares: '' })
      });
      setPlaidHoldings([]);
    }
  };
  
  // Handle Plaid success
  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      setPlaidLoading(true);
      setPlaidError(null);
      
      console.log('Processing Plaid success callback with metadata:', {
        institution: metadata.institution?.name || 'Unknown',
        accounts: metadata.accounts?.length || 0
      });
      
      // Step 1: Exchange public token for access token
      try {
        await plaidApi.exchangePublicToken(publicToken);
      } catch (error) {
        console.error('Error exchanging public token:', error);
        throw new Error(
          'Failed to exchange token with your bank. Please try again or contact support if the issue persists.'
        );
      }
      
      // Step 2: Get investment holdings from Plaid
      let holdings;
      try {
        holdings = await plaidApi.getInvestmentHoldings();
      } catch (error) {
        console.error('Error retrieving investment holdings:', error);
        throw new Error(
          'Unable to retrieve your investment holdings. The server may be experiencing issues. Please try again later.'
        );
      }
      
      if (!holdings || holdings.length === 0) {
        throw new Error('No investment holdings found in your account. Please try another account or use manual input.');
      }
      
      // Log the raw holdings data
      console.log('Raw holdings data received:', holdings);
      
      // Convert to form values - ensure all values are properly converted to strings
      const formattedHoldings = holdings.map(holding => {
        // Log each holding as we process it
        console.log('Processing holding for form:', holding);
        
        return {
          symbol: holding.symbol || '',
          shares: holding.shares ? String(holding.shares) : ''
        };
      });
      
      // Log the formatted holdings
      console.log('Formatted holdings for form:', formattedHoldings);
      
      // Update the form with holdings
      setPlaidHoldings(formattedHoldings);
      replace(formattedHoldings);
      
    } catch (error: any) {
      console.error('Error in Plaid flow:', error);
      setPlaidError(error.message || 'An error occurred connecting to your bank. Please try again later or use manual input.');
      setInputMethod('manual');
    } finally {
      setPlaidLoading(false);
    }
  };
  
  // Handle Plaid error
  const handlePlaidError = () => {
    setPlaidError(null);
    setInputMethod('manual');
  };
  
  // Handle input method change
  const handleInputMethodChange = (value: string) => {
    setInputMethod(value as 'manual' | 'plaid');
    
    // Reset form when switching methods
    if (value === 'manual' && plaidHoldings.length > 0) {
      if (confirm('Switching to manual input will clear your imported holdings. Continue?')) {
        form.reset({
          holdings: Array(5).fill({ symbol: '', shares: '' })
        });
        setPlaidHoldings([]);
      } else {
        setInputMethod('plaid');
      }
    }
  };
  
  // Submit the portfolio
  const submitPortfolio = async (data: PortfolioFormValues) => {
    // Check if we have any assets
    const filteredHoldings = removeEmptyFields(data.holdings);
    
    if (filteredHoldings.length === 0) {
      setShowEmptyMessage(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert string values to numbers and add default values for API
      const formattedHoldings = filteredHoldings.map(holding => ({
        symbol: holding.symbol.toUpperCase(),
        shares: parseFloat(holding.shares),
        purchasePrice: 0, // Will be fetched from market data
        assetClass: 'stocks', // Default asset class
      }));
      
      // Call API to create portfolio
      await portfolioApi.createPortfolio({ holdings: formattedHoldings });
      
      // Notify parent component that portfolio was created
      onPortfolioCreated();
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('Failed to create portfolio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="mb-8 shadow-lg border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background pb-6">
          <CardTitle className="text-2xl font-bold text-center mb-2">Welcome to Asset Vision</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Let's set up your investment portfolio. Add your assets to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Choose how to add your investments:</h3>
            <ToggleGroup 
              type="single" 
              value={inputMethod} 
              onValueChange={(value) => value && handleInputMethodChange(value)}
              className="justify-start w-full md:w-auto"
            >
              <ToggleGroupItem value="manual" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Manual Input
              </ToggleGroupItem>
              <ToggleGroupItem value="plaid" className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> Connect Bank
              </ToggleGroupItem>
            </ToggleGroup>
            
            {plaidError && (
              <div className="mt-3 p-3 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{plaidError}</span>
                <button 
                  onClick={() => setPlaidError(null)} 
                  className="ml-auto text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          {inputMethod === 'plaid' && plaidHoldings.length === 0 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-border rounded-lg bg-muted/20">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <div>
                <h3 className="font-medium mb-1">Connect your investment account</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Securely connect your investment account to automatically import your holdings.
                </p>
                {plaidError === null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    If you encounter any issues, you can always switch to manual input.
                  </p>
                )}
              </div>
              <PlaidLinkButton 
                onSuccess={handlePlaidSuccess} 
                onExit={handlePlaidError}
                isLoading={plaidLoading}
                className="mt-2"
              />
            </div>
          )}
          
          {(inputMethod === 'manual' || plaidHoldings.length > 0) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitPortfolio)} className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="text-lg font-medium">Your Assets</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      {validAssetCount} {validAssetCount === 1 ? 'asset' : 'assets'} added
                    </span>
                    {validAssetCount > 0 && (
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        onClick={clearAllFields}
                        className="h-8 px-3 text-xs flex items-center gap-1 border-muted-foreground/30"
                      >
                        <X className="h-3.5 w-3.5" /> Clear All
                      </Button>
                    )}
                  </div>
                </div>
                
                {showEmptyMessage && (
                  <div className="p-3 mb-4 text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <div className="p-1 rounded-full bg-amber-200 dark:bg-amber-800">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    Please add at least one asset to create your portfolio
                  </div>
                )}
              
                <div className="space-y-4 mt-4">
                  {/* Header labels */}
                  <div className="grid md:grid-cols-[1fr_1fr_48px] gap-x-4 mb-1 px-1">
                    <div className="hidden md:block text-sm font-medium text-muted-foreground">Asset Symbol</div>
                    <div className="hidden md:block text-sm font-medium text-muted-foreground">Number of Shares</div>
                    <div></div>
                  </div>
                  
                  {/* Input fields */}
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid md:grid-cols-[1fr_1fr_48px] gap-x-4 gap-y-2 border-b border-border/20 pb-3">
                      <FormField
                        control={form.control}
                        name={`holdings.${index}.symbol`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <div className="flex items-center justify-between md:hidden">
                              <FormLabel className="text-sm font-medium">Asset Symbol</FormLabel>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="AAPL" 
                                className="h-9 focus-visible:ring-primary" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`holdings.${index}.shares`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <div className="md:hidden">
                              <FormLabel className="text-sm font-medium">Number of Shares</FormLabel>
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="10" 
                                className="h-9 focus-visible:ring-primary" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <div className="hidden md:flex items-end justify-center h-9">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {inputMethod === 'manual' && (
                  <div className="pt-2 flex justify-center">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={addMoreFields}
                      className="px-5 py-2 h-10 font-medium rounded-md transition-all border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Plus className="mr-1.5 h-4 w-4" /> Add More Fields
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit"
                    disabled={isSubmitting} 
                    variant="outline"
                    className="px-8 py-2 h-10 rounded-md text-sm font-medium transition-all max-w-xs w-full border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Creating Portfolio...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Portfolio
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
