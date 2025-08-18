'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLinkedAccounts,
  linkBrokerageAccount,
  removeLinkedAccount,
  updateAccountStatus,
  LinkedAccount
} from '@/store/userSlice';
import { AppDispatch, RootState } from '@/store';
import { fetchHoldingsAndBalance } from '@/store/portfolioSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlaidLinkButton } from './plaid-link-button';
import { plaidApi } from '@/services/plaid-api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Building2, 
  RefreshCw, 
  Plus, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LinkedAccountsProps {}

/**
 * Linked Accounts Component
 * 
 * This component displays all linked brokerage accounts and allows users to:
 * - View their connected accounts
 * - Add new accounts
 * - Remove existing accounts
 * - Update account connections
 * - Create portfolios from specific accounts
 */
/**
 * Linked Accounts Component
 * 
 * This component displays all linked brokerage accounts and allows users to:
 * - View their connected accounts
 * - Add new accounts
 * - Remove existing accounts
 * - Update account connections
 * - Fetch and display holdings and total balance for each linked account
 * - All accounts are automatically part of the user's portfolio
 */
export function LinkedAccounts({}: LinkedAccountsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { linkedAccounts, accountsLoading, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState<string | null>(null);
  const [isRemovingAccount, setIsRemovingAccount] = useState<string | null>(null);

  // State for holdings modal
  const [holdingsModalAccountId, setHoldingsModalAccountId] = useState<string | null>(null);

  // Redux state for holdings
  const portfolio = useSelector((state: RootState) => state.portfolio);

  // Fetch linked accounts when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchLinkedAccounts());
    }
  }, [dispatch, isAuthenticated]);

  // Handle successful Plaid link
  const handlePlaidSuccess = async (publicToken: string, metadata: Record<string, unknown>) => {
    try {
      // Validate inputs before proceeding
      if (!publicToken) {
        console.error('LinkedAccounts: Missing publicToken');
        throw new Error('Missing public token');
      }
      
      if (!metadata) {
        console.error('LinkedAccounts: Missing metadata');
        throw new Error('Missing metadata');
      }
      
      // Dispatch action to link the account
      console.log('LinkedAccounts: Dispatching linkBrokerageAccount action...');
      
      try {
        const actionResult = dispatch(linkBrokerageAccount({ publicToken, metadata }));
        console.log('LinkedAccounts: Action dispatched successfully, awaiting result...');
        
        const result = await actionResult.unwrap();
        console.log('LinkedAccounts: Account linking result:', result);
        
        // Force a refresh of the linked accounts
        console.log('LinkedAccounts: Refreshing linked accounts...');
        dispatch(fetchLinkedAccounts());
        
        toast.success("Account Linked Successfully", {
          description: `Successfully linked your ${(metadata.institution as any)?.name || 'brokerage'} account.`,
        });
      } catch (dispatchError) {
        console.error('LinkedAccounts: Error in dispatch or unwrap:', dispatchError);
        throw dispatchError;
      }
    } catch (error) {
      console.error('LinkedAccounts: Error linking account:', error);
      toast.error("Error Linking Account", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Handle account update via Plaid
  const handleUpdateAccount = async (accountId: string) => {
    try {
      setIsUpdatingAccount(accountId);
      const result = await plaidApi.updateAccountConnection(accountId);
      
      if (result.success && result.linkToken) {
        // We need to open Plaid Link with the linkToken
        // This would typically be done via the PlaidLinkButton component
        // but for updating, we need to handle it slightly differently
        toast.success("Account Update Prepared", {
          description: "Please follow the prompts to update your account connection.",
        });
        
        // For now, we'll just update the status in Redux to simulate a successful update
        dispatch(updateAccountStatus({ accountId, status: 'active' }));
      }
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error("Error Updating Account", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUpdatingAccount(null);
    }
  };

  // Handle account removal
  const handleRemoveAccount = async (accountId: string) => {
    try {
      setIsRemovingAccount(accountId);
      await plaidApi.disconnectAccount(accountId);
      dispatch(removeLinkedAccount(accountId));
      toast.success("Account Removed", {
        description: "Your account has been successfully disconnected.",
      });
    } catch (error) {
      console.error('Error removing account:', error);
      toast.error("Error Removing Account", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsRemovingAccount(null);
    }
  };



  // Calculate total balance across all linked accounts
  const totalBalance = linkedAccounts.reduce((sum, acc) => sum + (acc.balance?.current || 0), 0);

  return (
    <div className="space-y-6">
      {/* Holdings Modal */}
      <Dialog open={!!holdingsModalAccountId} onOpenChange={() => setHoldingsModalAccountId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Holdings</DialogTitle>
            <DialogDescription asChild>
              {portfolio.loading ? (
                <span key="loading-holdings">Loading holdings...</span>
              ) : portfolio.error ? (
                <span key="error-holdings" className="text-red-500">{portfolio.error}</span>
              ) : (
                <div>
                  <div className="mb-2 font-semibold">
                    Total Balance: <span className="text-primary">${portfolio.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left">Symbol</th>
                          <th className="px-2 py-1 text-left">Shares</th>
                          <th className="px-2 py-1 text-left">Purchase Price</th>
                          <th className="px-2 py-1 text-left">Asset Class</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.holdings.map((h, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="px-2 py-1">{h.symbol}</td>
                            <td className="px-2 py-1">{h.shares}</td>
                            <td className="px-2 py-1">${h.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-2 py-1">{h.assetClass}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Linked Brokerage Accounts</h2>
      </div>
           {/* Stepper for onboarding if < 2 accounts */}
      {linkedAccounts && linkedAccounts.length < 2 && !accountsLoading && (
        <div className="flex items-center mb-4" aria-label="Onboarding Progress">
          <div className={`flex items-center gap-2 ${linkedAccounts.length === 0 ? 'font-bold text-primary' : ''}`}>1. Connect your first account</div>
          <div className="mx-2 h-1 w-8 bg-muted rounded-full" />
          <div className={`flex items-center gap-2 ${linkedAccounts.length === 1 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>2. Add another account</div>
        </div>
      )}
      {accountsLoading && (!linkedAccounts || linkedAccounts.length === 0) ? (
        <div key="accounts-loading-skeleton" className="space-y-3">
          <Skeleton className="h-[150px] w-full rounded-lg" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>
      ) : !linkedAccounts || linkedAccounts.length === 0 ? (
        <Card key="no-linked-accounts" className="border-dashed animate-fade-in">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-3 py-8">
              <Building2 className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">No linked accounts</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your brokerage accounts to import your portfolio data
                </p>
              </div>
              <PlaidLinkButton 
                onSuccess={handlePlaidSuccess} 
                variant="default"
                className="mt-4"
                aria-label="Connect brokerage account"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linkedAccounts && linkedAccounts.map((account, idx) => (
            <Card 
              key={account.id} 
              className="overflow-hidden animate-fade-in"
              tabIndex={0}
              aria-label={`Linked account: ${account.institutionName}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {/* Institution logo if available, fallback to icon */}
                      {account.institutionLogoUrl ? (
                        <img key="institution-logo" src={account.institutionLogoUrl} alt={account.institutionName + ' logo'} className="h-5 w-5 rounded-full border bg-white" />
                      ) : (
                        <Building2 key="institution-icon" className="h-5 w-5" aria-hidden="true" />
                      )}
                      {account.institutionName}
                      {/* Status dot */}
                      <span className={`ml-2 inline-block h-2 w-2 rounded-full ${account.status === 'active' ? 'bg-green-500' : account.status === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} aria-label={`Status: ${account.status}`}></span>
                    </CardTitle>
                    <CardDescription>
                      {account.accountType} •••• {account.accountMask}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      account.status === 'active' ? 'outline' : 
                      account.status === 'error' ? 'destructive' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {account.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-1 pb-2 flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">
                  Last updated {account.lastUpdated ? new Date(account.lastUpdated).toLocaleString() : 'unknown'}
                </p>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-4 py-2">
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center w-full">
                  {/* Button to fetch and display holdings for this account */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs ml-2 sm:ml-0 mr-2"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (account.connectionId) {
                        dispatch(fetchHoldingsAndBalance(account.connectionId));
                        setHoldingsModalAccountId(account.id);
                      }
                    }}
                    disabled={!account.connectionId || portfolio.loading}
                    aria-label="View Holdings"
                  >
                    View Holdings
                  </Button>
                  {account.status === 'error' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateAccount(account.id);
                      }}
                      disabled={isUpdatingAccount === account.id}
                    >
                      {isUpdatingAccount === account.id ? (
                        <div key="updating-state">
                          <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Updating...
                        </div>
                      ) : (
                        <div key="update-state">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Update
                        </div>
                      )}
                    </Button>
                  ) : null}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to disconnect your {account.institutionName} account? 
                          This will remove the account connection but won't affect any portfolios you've 
                          already created from this account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={isRemovingAccount === account.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAccount(account.id);
                          }}
                        >
                          {isRemovingAccount === account.id ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
                   {/* Add another account card with animation and accessibility */}
          <Card className="border-dashed animate-fade-in" tabIndex={0} aria-label="Add another account" role="button">
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-muted">
                  <Plus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium">Add another account</h3>
                <p className="text-sm text-muted-foreground max-w-[15rem]">
                  Connect additional brokerage accounts to import more investments
                </p>
                <PlaidLinkButton 
                  onSuccess={handlePlaidSuccess} 
                  variant="outline"
                  className="mt-2"
                  aria-label="Connect another brokerage account"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
