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

interface LinkedAccountsProps {
  onSelectAccount?: (account: LinkedAccount) => void;
  showCreatePortfolio?: boolean;
}

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
export function LinkedAccounts({ onSelectAccount, showCreatePortfolio = false }: LinkedAccountsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { linkedAccounts, accountsLoading, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState<string | null>(null);
  const [isRemovingAccount, setIsRemovingAccount] = useState<string | null>(null);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState<string | null>(null);

  // Fetch linked accounts when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchLinkedAccounts());
    }
  }, [dispatch, isAuthenticated]);

  // Handle successful Plaid link
  const handlePlaidSuccess = async (publicToken: string, metadata: Record<string, unknown>) => {
    console.log('Plaid Link Success in LinkedAccounts:', { publicToken, metadata });
    try {
      // Dispatch action to link the account
      console.log('Dispatching linkBrokerageAccount action...');
      const result = await dispatch(linkBrokerageAccount({ publicToken, metadata })).unwrap();
      console.log('Account linking result:', result);
      
      // Force a refresh of the linked accounts
      console.log('Refreshing linked accounts...');
      dispatch(fetchLinkedAccounts());
      
      toast.success("Account Linked Successfully", {
        description: `Successfully linked your ${metadata.institution.name} account.`,
      });
    } catch (error) {
      console.error('Error linking account:', error);
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

  // Handle creating a portfolio from an account
  const handleCreatePortfolio = async (account: LinkedAccount) => {
    try {
      setIsCreatingPortfolio(account.id);
      
      // Access token is needed, and should be stored on the backend
      // For this example, we're assuming it's retrieved as part of the account
      if (!account.accessToken) {
        throw new Error("Access token not available for this account");
      }
      
      // Create portfolio using the account's access token
      await plaidApi.createPortfolioFromPlaid(
        account.accessToken, 
        `${account.institutionName} Portfolio`
      );
      
      toast.success("Portfolio Created", {
        description: `Successfully created portfolio from your ${account.institutionName} account.`,
      });
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error("Error Creating Portfolio", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsCreatingPortfolio(null);
    }
  };

  // Select an account (if onSelectAccount is provided)
  const handleSelectAccount = (account: LinkedAccount) => {
    if (onSelectAccount) {
      onSelectAccount(account);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Linked Brokerage Accounts</h2>
        {/* Only show the connect button in the header when not on the Connected Accounts page */}
        {linkedAccounts && linkedAccounts.length > 0 && (
          <PlaidLinkButton 
            onSuccess={handlePlaidSuccess}
            variant="default"
            className="flex gap-2 items-center"
          />
        )}
      </div>
      
      {accountsLoading && (!linkedAccounts || linkedAccounts.length === 0) ? (
        <div className="space-y-3">
          <Skeleton className="h-[150px] w-full rounded-lg" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>
      ) : !linkedAccounts || linkedAccounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-3 py-8">
              <Building2 className="h-12 w-12 text-muted-foreground" />
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
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linkedAccounts && linkedAccounts.map((account) => (
            <Card 
              key={account.id} 
              className={`overflow-hidden ${onSelectAccount ? 'cursor-pointer hover:border-primary' : ''}`}
              onClick={onSelectAccount ? () => handleSelectAccount(account) : undefined}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {account.institutionName}
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
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="font-medium">
                      ${account.balance?.available?.toLocaleString() || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="font-medium">
                      ${account.balance?.current?.toLocaleString() || '0.00'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Last updated {new Date(account.lastUpdated).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <div className="flex justify-between items-center w-full">
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
                        <>
                          <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Update
                        </>
                      )}
                    </Button>
                  ) : showCreatePortfolio ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreatePortfolio(account);
                      }}
                      disabled={isCreatingPortfolio === account.id}
                    >
                      {isCreatingPortfolio === account.id ? (
                        <>
                          <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Create Portfolio
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectAccount) {
                          handleSelectAccount(account);
                        }
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Select
                    </Button>
                  )}
                  
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
          
          {/* Add another account card */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-muted">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Add another account</h3>
                <p className="text-sm text-muted-foreground max-w-[15rem]">
                  Connect additional brokerage accounts to import more investments
                </p>
                <PlaidLinkButton 
                  onSuccess={handlePlaidSuccess} 
                  variant="outline"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
