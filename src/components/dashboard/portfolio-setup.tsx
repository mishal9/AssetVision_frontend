'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { portfolioApi } from '@/services/api';
import { Plus, Trash2, Save, ArrowRight, FileText, Building2 } from 'lucide-react';

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
 * Allows users to input multiple assets at once or connect their brokerage account
 * 
 * @param onPortfolioCreated - Callback function to execute when a portfolio is successfully created
 */
export function PortfolioSetup({ onPortfolioCreated }: { onPortfolioCreated: () => void }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  
  // Initialize the portfolio form with multiple holdings
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      holdings: Array(5).fill({ symbol: '', shares: '' })
    },
    mode: 'onChange'
  });
  
  // Setup field array for dynamic fields
  const { fields, append, remove } = useFieldArray({
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
    }
  };
  
  // Navigate to the Connected Accounts page
  const navigateToConnectedAccounts = () => {
    router.push('/dashboard/connected-accounts');
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
      <Card className="shadow-lg border-border/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
          <CardTitle className="text-2xl font-bold text-center">Welcome to Asset Vision</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Let's set up your investment portfolio. Add your assets to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-8">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center bg-muted/40 p-4 rounded-lg border border-border/80">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-medium">Connect a Brokerage Account</h3>
                    <p className="text-xs text-muted-foreground">Import your holdings directly from your brokerage</p>
                  </div>
                </div>
                <Button 
                  onClick={navigateToConnectedAccounts} 
                  variant="outline" 
                  className="gap-1"
                >
                  Connect <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium">Manual Portfolio Setup</h3>
            <div className="text-xs text-muted-foreground">Enter your investment details manually</div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitPortfolio)} className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="text-lg font-medium">Your Assets</h3>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={clearAllFields}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Clear All
                  </Button>
                </div>
              </div>
              
              {showEmptyMessage && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm p-3 rounded-md border border-yellow-200 dark:border-yellow-800/60">
                  Please add at least one asset to create your portfolio.
                </div>
              )}
              
              <div className="space-y-4">
                {/* Header row - visible only on desktop */}
                <div className="hidden md:grid grid-cols-[1fr,1fr,50px] gap-4 px-2">
                  <FormLabel className="text-sm font-medium">Symbol</FormLabel>
                  <FormLabel className="text-sm font-medium">Shares</FormLabel>
                  <div></div>
                </div>
                
                <div className="divide-y divide-border/30">
                  {fields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="grid grid-cols-1 md:grid-cols-[1fr,1fr,50px] gap-4 py-3 first:pt-0 last:pb-0"
                    >
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
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
