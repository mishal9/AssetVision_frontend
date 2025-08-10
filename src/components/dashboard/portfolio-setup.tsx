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
        quantity: parseFloat(holding.shares),
        purchasePrice: 0, // Will be fetched from market data
        purchaseDate: new Date().toISOString().split('T')[0], // Default to today
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
          <CardTitle className="text-2xl font-bold text-center">Welcome to AlphaOptimize</CardTitle>
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
          
          {/* Manual portfolio input removed. Only linking accounts is allowed. */}
          {/* If user is not authenticated, prompt to log in to link accounts */}
          {typeof window !== 'undefined' && !localStorage.getItem('auth_token') ? (
            <div className="flex flex-col items-center justify-center py-8">
              <h3 className="text-lg font-semibold mb-2">Sign in to link your accounts</h3>
              <p className="text-sm text-muted-foreground mb-4">You must be logged in to link your investment accounts and view your portfolio.</p>
              <Button onClick={() => router.push('/login')} variant="default" className="px-8 py-2 rounded-md">Login</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
